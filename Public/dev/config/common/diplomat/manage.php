<?php
namespace Jtbc;
use Jtbc\Jtbc\Codename;
use Jtbc\Jtbc\JtbcReader;
use Jtbc\Jtbc\JtbcWriter;
use Jtbc\Config\ClassicConfigManager;
use App\Common\Config\ConfigItemsScanner;
use App\Common\Config\ConfigItemsValidator;
use App\Console\Common\BasicSubstance;
use App\Console\Log\Logger;
use App\Console\Common\Ambassador;
use App\Universal\Upload\chunkFile;
use App\Universal\Upload\LocalUploader\LocalUploader;
use Config\App\Config as AppConfig;

class Diplomat extends Ambassador {
  private $assetsFolder = 'common/assets';

  public function list1()
  {
    $bs = new BasicSubstance($this);
    $lang = $this -> guard -> role -> getLang();
    $language = Env::getLanguageByID($lang);
    $bs -> data -> info = [
      'sysname' => Jtbc::take('::index.title', 'lng', false, null, $language),
      'title' => Jtbc::take('global.communal.title', 'lng', false, null, $language),
      'keywords' => Jtbc::take('global.communal.keywords', 'lng', false, null, $language),
      'description' => Jtbc::take('global.communal.description', 'lng', false, null, $language),
    ];
    return $bs -> toJSON();
  }

  public function list2()
  {
    $bs = new BasicSubstance($this);
    $lang = $this -> guard -> role -> getLang();
    $language = Env::getLanguageByID($lang);
    $logoPath = $this -> assetsFolder . '/' . strval(Jtbc::take('global.communal.logo', 'lng', false, null, $language));
    $logoFullPath = Path::getActualRoute($logoPath . '?rand=' . Random::getRandomMix());
    $bs -> data -> info = [
      'logo' => $logoFullPath,
    ];
    return $bs -> toJSON();
  }

  public function list3()
  {
    $bs = new BasicSubstance($this);
    $extensions = [];
    $extensionsArr = explode(',', strval(Jtbc::take('global.config.upload-allowed-extensions', 'cfg')));
    foreach ($extensionsArr as $item)
    {
      $extensions[] = ['extension' => $item];
    }
    $extensionsText = new Substance();
    $extensionsText -> add = Jtbc::take('universal:config.add', 'lng');
    $extensionsText -> remove = Jtbc::take('universal:config.delete', 'lng');
    $extensionsText -> removeTips = Jtbc::take('universal:phrases.are-you-sure-to-remove', 'lng');
    $extensionsText -> emptyTips = Jtbc::take('manage.text-tips-extensions-null', 'lng');
    $extensionsColumns = [['name' => 'extension', 'type' => 'text', 'text' => Jtbc::take('config.extension', 'lng')]];
    $bs -> data -> extensions = [
      'text' => $extensionsText -> toJSON(),
      'columns' => JSON::encode($extensionsColumns),
    ];
    $bs -> data -> info = [
      'max_filesize' => intval(Jtbc::take('global.config.upload-allowed-max-filesize', 'cfg')) / (1024 * 1024),
      'extensions' => JSON::encode($extensions),
    ];
    return $bs -> toJSON();
  }

  public function list4()
  {
    $items = [];
    $status = 200;
    $configItemsScanner = new ConfigItemsScanner();
    $configItems = $configItemsScanner -> getOrderedItems();
    if (empty($configItems))
    {
      $status = 404;
    }
    else
    {
      foreach ($configItems as $key => $value)
      {
        $form = [];
        $title = $key;
        if (is_array($value))
        {
          if (array_key_exists('__title', $value))
          {
            $title = strval($value['__title']);
          }
          $formSchema = $configItemsScanner -> getFormSchemaByKey($key);
          if (is_array($formSchema))
          {
            foreach ($formSchema as $item)
            {
              $ss = new Substance($item);
              $currentValue = Config::get(AppConfig::class, $key . '_' . $ss -> name);
              if (is_null($currentValue) && $ss -> exists('value'))
              {
                $currentValue = $ss -> value;
              }
              $form[] = array_merge($ss -> toArray(), is_null($currentValue)? []: ['value' => $currentValue]);
            }
          }
        }
        $items[] = ['key' => $key, 'title' => $title, 'form' => $form];
      }
    }
    $bs = new BasicSubstance($this);
    $bs -> data -> items = $items;
    $bs -> data -> status = $status;
    return $bs -> toJSON();
  }

  public function actionEdit(Request $req)
  {
    $code = 0;
    $message = '';
    $ss = new Substance();
    $post = $req -> post();
    $group = intval($req -> get('group'));
    $lang = $this -> guard -> role -> getLang();
    if ($this -> guard -> role -> checkPermission('edit'))
    {
      $language = Env::getLanguageByID($lang);
      $writeFile = function(array $task, string $type) use ($language)
      {
        $result = true;
        foreach ($task as $key => $value)
        {
          $codename = new Codename($key, $type);
          $keyword = $codename -> getKeyword();
          $filePath = $codename -> getFilepath();
          if (JtbcWriter::putNodeContent($filePath, $type, $keyword, $value, JtbcReader::hasField($filePath, $language)? $language: JtbcReader::getDefaultNodeName(strval(JtbcReader::getConfigure($filePath, 'field')))) !== true)
          {
            $result = false;
            break;
          }
        }
        return $result;
      };
      if ($group == 1)
      {
        $sysname = strval($req -> post('sysname'));
        $title = strval($req -> post('title'));
        $keywords = strval($req -> post('keywords'));
        $description = strval($req -> post('description'));
        $task = [
          '::index.title' => $sysname,
          'global.communal.title' => $title,
          'global.communal.keywords' => $keywords,
          'global.communal.description' => $description,
        ];
        if ($writeFile($task, 'lng'))
        {
          $code = 1;
          Logger::log($this, 'manage.log-edit-' . $group);
        }
        else
        {
          $code = 4002;
        }
      }
      else if ($group == 2)
      {
        $chunkFile = new chunkFile($req);
        $logoName = 'logo.' . $chunkFile -> getFileExtension();
        $logoFullPath = Path::getActualRoute($this -> assetsFolder . '/' . $logoName);
        $uploader = new LocalUploader($this -> di, $this -> getParam('genre'), false);
        $uploadFile = $uploader -> uploadFile($chunkFile, $logoFullPath);
        if (!is_null($uploadFile))
        {
          $code = $uploadFile -> code;
          $vars = $uploadFile -> vars;
          $message = Jtbc::take('::communal.text-upload-code-' . $code, 'lng', false, $vars) ?? Jtbc::take('::communal.text-upload-code-others', 'lng');
          if ($code == 1)
          {
            $task = [
              'global.communal.logo' => $logoName . '?ver=' . Random::getNumeric28(),
            ];
            if ($writeFile($task, 'lng'))
            {
              $code = 1;
              Logger::log($this, 'manage.log-edit-' . $group);
            }
            else
            {
              $code = 4002;
            }
          }
        }
      }
      else if ($group == 3)
      {
        $extensionsValue = '';
        $extensions = strval($req -> post('extensions'));
        $maxFilesize = intval($req -> post('max_filesize')) * 1024 * 1024;
        if (Validation::isJSON($extensions))
        {
          $extensionsTempArr = [];
          $extensionsArr = JSON::decode($extensions);
          foreach ($extensionsArr as $item)
          {
            $extensionsTempArr[] = $item['extension'];
          }
          $extensionsValue = implode(',', $extensionsTempArr);
        }
        $task = [
          'global.config.upload-allowed-max-filesize' => $maxFilesize,
          'global.config.upload-allowed-extensions' => $extensionsValue,
        ];
        if ($writeFile($task, 'cfg'))
        {
          $code = 1;
          Logger::log($this, 'manage.log-edit-' . $group);
        }
        else
        {
          $code = 4002;
        }
      }
      else if ($group == 4)
      {
        $key = strval($req -> get('key'));
        if (Validation::isConstantName($key))
        {
          $configItemsScanner = new ConfigItemsScanner();
          $formSchema = $configItemsScanner -> getFormSchemaByKey($key);
          if (empty($formSchema))
          {
            $code = 4400;
          }
          else
          {
            $validated = ConfigItemsValidator::validate($formSchema, is_array($post)? $post: []);
            if ($validated === true)
            {

              $classicConfigManager = new ClassicConfigManager(AppConfig::class, true);
              foreach ($formSchema as $item)
              {
                $ss = new Substance($item);
                if (!in_array($ss -> type, ['tips']))
                {
                  $name = $ss -> name;
                  $format = $ss -> format;
                  $value = $req -> post($name);
                  $constantName = $key . '_' . $name;
                  if ($format == 'int')
                  {
                    $value = intval($value);
                  }
                  $classicConfigManager -> {strtoupper($constantName)} = $value;
                }
              }
              $saved = $classicConfigManager -> save();
              if ($saved === true)
              {
                $code = 1;
                Logger::log($this, 'manage.log-edit-' . $group, ['key' => $key]);
              }
              else
              {
                $code = 4002;
              }
            }
            else
            {
              $code = $validated -> firstCode;
              $message = $validated -> firstMessage;
              $ss -> errorTips = $validated -> error;
            }
          }
        }
        else
        {
          $code = 4400;
        }
      }
      else
      {
        $code = 4001;
      }
    }
    else
    {
      $code = 4403;
      $message = Jtbc::take('::communal.text-tips-error-4403', 'lng');
    }
    $ss -> code = $code;
    $ss -> message = Jtbc::take('manage.text-edit-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }
}