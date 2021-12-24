<?php
namespace Jtbc;
use Jtbc\Jtbc\Codename;
use Jtbc\Jtbc\JtbcWriter;
use App\Console\Common\BasicSubstance;
use App\Console\Log\Logger;
use App\Console\Common\Ambassador;
use App\Universal\Upload\chunkFile;
use App\Universal\Upload\LocalUploader\LocalUploader;
use Config\Diplomatist as Config;

class Diplomat extends Ambassador {
  private $assetsFolder = 'common/assets';

  public function list1(Request $req)
  {
    $bs = new BasicSubstance($this);
    $bs -> data -> info = [
      'title' => Jtbc::take('global.communal.title', 'lng'),
      'keywords' => Jtbc::take('global.communal.keywords', 'lng'),
      'description' => Jtbc::take('global.communal.description', 'lng'),
    ];
    return $bs -> toJSON();
  }

  public function list2(Request $req)
  {
    $bs = new BasicSubstance($this);
    $logoPath = $this -> assetsFolder . '/' . strval(Jtbc::take('global.communal.logo', 'lng'));
    $logoFullPath = Path::getActualRoute($logoPath . '?rand=' . Random::getRandomMix());
    $bs -> data -> info = [
      'logo' => $logoFullPath,
    ];
    return $bs -> toJSON();
  }

  public function list3(Request $req)
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

  public function list4(Request $req)
  {
    $bs = new BasicSubstance($this);
    $bs -> data -> info = [
      'title' => Jtbc::take('global.' . Config::CONSOLE_DIR . ':index.title', 'lng'),
      'pagesize' => intval(Jtbc::take('global.config.pagesize', 'cfg')),
    ];
    return $bs -> toJSON();
  }

  public function actionEdit(Request $req)
  {
    $code = 0;
    $message = '';
    $ss = new Substance();
    $group = intval($req -> get('group'));
    if ($this -> guard -> role -> checkPermission('edit'))
    {
      if ($group == 1)
      {
        $title = strval($req -> post('title'));
        $keywords = strval($req -> post('keywords'));
        $description = strval($req -> post('description'));
        $codename1 = new Codename('global.communal.title', 'lng');
        $codename2 = new Codename('global.communal.keywords', 'lng');
        $codename3 = new Codename('global.communal.description', 'lng');
        $wroteStatus1 = JtbcWriter::putNodeContent($codename1 -> getFilepath(), 'lng', 'title', $title);
        $wroteStatus2 = JtbcWriter::putNodeContent($codename2 -> getFilepath(), 'lng', 'keywords', $keywords);
        $wroteStatus3 = JtbcWriter::putNodeContent($codename3 -> getFilepath(), 'lng', 'description', $description);
        if ($wroteStatus1 && $wroteStatus2 && $wroteStatus3)
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
          $param = $uploadFile -> param;
          $message = Jtbc::take('::communal.text-upload-code-' . $code, 'lng', false, $vars) ?? Jtbc::take('::communal.text-upload-code-others', 'lng');
          if ($code == 1)
          {
            $codename = new Codename('global.communal.logo', 'lng');
            $wroteStatus = JtbcWriter::putNodeContent($codename -> getFilepath(), 'cfg', 'logo', $logoName);
            if ($wroteStatus == true)
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
        $codename1 = new Codename('global.config.upload-allowed-max-filesize', 'cfg');
        $codename2 = new Codename('global.config.upload-allowed-extensions', 'cfg');
        $wroteStatus1 = JtbcWriter::putNodeContent($codename1 -> getFilepath(), 'cfg', 'upload-allowed-max-filesize', $maxFilesize);
        $wroteStatus2 = JtbcWriter::putNodeContent($codename2 -> getFilepath(), 'cfg', 'upload-allowed-extensions', $extensionsValue);
        if ($wroteStatus1 && $wroteStatus2)
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
        $title = strval($req -> post('title'));
        $pagesize = intval($req -> post('pagesize'));
        $codename1 = new Codename('global.' . Config::CONSOLE_DIR . ':index.title', 'lng');
        $codename2 = new Codename('global.config.pagesize', 'cfg');
        $wroteStatus1 = JtbcWriter::putNodeContent($codename1 -> getFilepath(), 'lng', 'title', $title);
        $wroteStatus2 = JtbcWriter::putNodeContent($codename2 -> getFilepath(), 'cfg', 'pagesize', $pagesize);
        if ($wroteStatus1 && $wroteStatus2)
        {
          $code = 1;
          Logger::log($this, 'manage.log-edit-' . $group);
        }
        else
        {
          $code = 4002;
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