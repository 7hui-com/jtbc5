<?php
namespace Jtbc;
use Jtbc\DB\DBFactory;
use Jtbc\File\FileHelper;
use Jtbc\Module\ModuleFinder;
use Jtbc\String\StringHelper;
use App\Common\Module\ModuleRecognizer;
use App\Console\Common\Ambassador;
use App\Console\Common\Navigation;
use App\Console\Account\Model as AccountModel;
use App\Console\Log\Logger;
use Config\DB as DBConfig;

class Diplomat extends Ambassador {
  public function __initialize()
  {
    $this -> isPublic = true;
    $di = $this -> di;
    $type = $di -> request -> get('type');
    if ($type == 'fragment')
    {
      $codename = $di -> request -> get('codename');
      if (strpos($codename, ':') !== false)
      {
        $genrePath = '../' . StringHelper::getClipedString($codename, ':', 'left');
        if (is_dir($genrePath))
        {
          chdir($genrePath);
        }
        else
        {
          $this -> crashed = true;
          $di -> response -> setStatusCode(404);
        }
      }
    }
  }

  public function fragment(Request $req)
  {
    $code = 0;
    $fragment = '';
    $ss = new Substance();
    $validator = new Validator($req -> get());
    if (!$validator -> codename -> isEmpty())
    {
      $code = 1;
      $fragment = Jtbc::take('global.' . $validator -> codename -> value());
    }
    $ss -> code = $code;
    $ss -> fragment = $fragment;
    $result = $ss -> toJSON();
    return $result;
  }

  public function info()
  {
    $ss = new Substance();
    $langList = [];
    $submenuList = [];
    $lang = $this -> guard -> role -> getLang();
    $name = $this -> guard -> account -> username;
    $allLang = Jtbc::take('::sel_lang.*', 'lng');
    foreach ($allLang as $key => $value)
    {
      $langList[] = ['lang' => $key, 'text' => $value];
    }
    $hookResult = $this -> di -> hook -> backstageAccountSubmenu -> trigger($this);
    if (is_array($hookResult))
    {
      foreach ($hookResult as $itemResult)
      {
        if (is_array($itemResult))
        {
          foreach ($itemResult as $item)
          {
            if (is_array($item))
            {
              $currentItem = new Substance($item);
              if ($currentItem -> exists('text') && $currentItem -> exists('href'))
              {
                $submenuList[] = [
                  'href' => $currentItem -> href,
                  'target' => $currentItem -> target ?? 'main',
                  'text' => $currentItem -> text,
                ];
              }
            }
          }
        }
      }
    }
    $data = [
      'name' => $name,
      'currentLang' => $lang,
      'currentLangText' => Jtbc::take('::sel_lang.' . $lang, 'lng'),
      'lang' => $langList,
      'submenu' => $submenuList,
    ];
    $ss -> code = 1;
    $ss -> data = $data;
    $result = $ss -> toJSON();
    return $result;
  }

  public function notification()
  {
    $ss = new Substance();
    $notification = [];
    $hookResult = $this -> di -> hook -> backstageNotification -> trigger($this);
    if (is_array($hookResult))
    {
      foreach ($hookResult as $itemResult)
      {
        if (is_array($itemResult))
        {
          foreach ($itemResult as $item)
          {
            if (is_array($item))
            {
              $currentItem = new Substance($item);
              if ($currentItem -> exists('tips') && $currentItem -> exists('href') && $currentItem -> exists('buttonText'))
              {
                $notification[] = [
                  'tips' => $currentItem -> tips,
                  'href' => $currentItem -> href,
                  'target' => $currentItem -> target ?? 'main',
                  'buttonText' => $currentItem -> buttonText,
                  'buttonNumber' => $currentItem -> buttonNumber ?? 1,
                ];
              }
            }
          }
        }
      }
    }
    $ss -> code = 1;
    $ss -> data = ['notification' => $notification];
    $result = $ss -> toJSON();
    return $result;
  }

  public function leftmenu()
  {
    $ss = new Substance();
    $moduleFinder = new ModuleFinder();
    $folders = $moduleFinder -> getModules();
    $getGuideData = function(string $argBaseFolder = '') use ($folders, &$getGuideData)
    {
      $result = [];
      $baseFolder = $argBaseFolder;
      foreach ($folders as $folder)
      {
        if ($this -> guard -> role -> permission -> hasPermission($folder))
        {
          $canBeGuide = true;
          $currentFolder = $folder;
          if (!Validation::isEmpty($baseFolder))
          {
            if (strpos($folder, $baseFolder) === 0)
            {
              $currentFolder = substr($folder, strlen($baseFolder));
            }
            else
            {
              $canBeGuide = false;
            }
          }
          if ($canBeGuide === true && strpos($currentFolder, '/') === false)
          {
            $moduleRecognizer = new ModuleRecognizer($folder);
            if (!$moduleRecognizer -> isConfusing())
            {
              $guideLink = Jtbc::take('global.' . $folder . ':guide.link', 'cfg');
              $guideTitle = Jtbc::take('global.' . $folder . ':guide.title', 'cfg');
              $guideIcon = Jtbc::take('global.' . $folder . ':guide.icon', 'cfg') ?? 'clover';
              if (!is_null($guideLink))
              {
                if (!Validation::isEmpty($guideLink))
                {
                  $guideLink = 'codename=' . $folder . ':' . $guideLink;
                }
                $result[] = ['title' => $guideTitle, 'link' => $guideLink, 'icon' => $guideIcon, 'genre' => $folder, 'children' => $getGuideData($baseFolder . $currentFolder . '/')];
              }
            }
          }
        }
      }
      return $result;
    };
    $ss -> code = 1;
    $ss -> data = $getGuideData();
    $result = $ss -> toJSON();
    return $result;
  }

  public function welcome(Request $req)
  {
    $ss = new Substance();
    $ss -> code = 0;
    if ($this -> guard -> checkLogin())
    {
      $ss -> code = 1;
      $role = $this -> guard -> getRole();
      $account = $this -> guard -> account;
      $nav = Navigation::getNavByGuide();
      $db = DBFactory::getInstance();
      $accountInfo = [
        'username' => $account -> username,
        'role_name' => $role -> getName(),
        'last_ip' => $account -> last_ip,
        'last_time' => $account -> last_time,
      ];
      $systemInfo = [];
      $systemInfo[] = ['title' => Jtbc::take('manage.text-sys-param-0', 'lng'), 'value' => $req -> server('SERVER_SOFTWARE')];
      $systemInfo[] = ['title' => Jtbc::take('manage.text-sys-param-1', 'lng'), 'value' => Kernel::getVersionString()];
      $systemInfo[] = ['title' => Jtbc::take('manage.text-sys-param-2', 'lng'), 'value' => PHP_VERSION];
      $systemInfo[] = ['title' => Jtbc::take('manage.text-sys-param-3', 'lng'), 'value' => DBConfig::DB_TYPE];
      $systemInfo[] = ['title' => Jtbc::take('manage.text-sys-param-4', 'lng'), 'value' => $db -> getVersion()];
      $systemInfo[] = ['title' => Jtbc::take('manage.text-sys-param-5', 'lng'), 'value' => strtoupper(php_sapi_name())];
      $systemInfo[] = ['title' => Jtbc::take('manage.text-sys-param-6', 'lng'), 'value' => $req -> server('SERVER_ADDR') ?? gethostbyname($req -> server('SERVER_NAME'))];
      $systemInfo[] = ['title' => Jtbc::take('manage.text-sys-param-7', 'lng'), 'value' => Date::now()];
      $systemInfo[] = ['title' => Jtbc::take('manage.text-sys-param-8', 'lng'), 'value' => get_cfg_var('max_execution_time')];
      $systemInfo[] = ['title' => Jtbc::take('manage.text-sys-param-9', 'lng'), 'value' => get_cfg_var('post_max_size')];
      $systemInfo[] = ['title' => Jtbc::take('manage.text-sys-param-10', 'lng'), 'value' => get_cfg_var('upload_max_filesize')];
      $systemInfo[] = ['title' => Jtbc::take('manage.text-sys-param-11', 'lng'), 'value' => get_cfg_var('memory_limit')];
      $systemInfo[] = ['title' => Jtbc::take('manage.text-sys-param-12', 'lng'), 'value' => FileHelper::formatFileSize(disk_free_space('./'))];
      $ss -> data = ['nav' => $nav, 'account_info' => $accountInfo, 'system_info' => $systemInfo];
    }
    $result = $ss -> toJSON();
    return $result;
  }

  public function hasCloudService()
  {
    $status = 0;
    $fragment = null;
    if ($this -> guard -> role -> isSuper && is_dir('cloud'))
    {
      $status = 1;
      $fragment = Jtbc::take('manage.dashboard-cloudservice', 'tpl');
    }
    $ss = new Substance();
    $ss -> code = 1;
    $ss -> status = $status;
    $ss -> fragment = $fragment;
    $result = $ss -> toJSON();
    return $result;
  }

  public function actionLogout()
  {
    $ss = new Substance();
    $ss -> code = 1;
    $ss -> message = '';
    $this -> guard -> logout();
    $result = $ss -> toJSON();
    return $result;
  }

  public function actionModifyPassword(Request $req)
  {
    $ss = new Substance();
    $ss -> code = 0;
    $ss -> message = '';
    $validator = new Validator($req -> post());
    if ($validator -> password -> isEmpty())
    {
      $ss -> code = 4001;
    }
    else if ($validator -> new_password -> isEmpty())
    {
      $ss -> code = 4002;
    }
    else if (!$validator -> new_password -> sameAs('new_password_repeat'))
    {
      $ss -> code = 4003;
    }
    else
    {
      $password = $validator -> password -> value();
      $newPassword = $validator -> new_password -> value();
      $accountId = $this -> guard -> account -> id;
      $accountModel = new AccountModel();
      $accountModel -> where -> id = $accountId;
      $mp = $accountModel -> modifyPassword($password, $newPassword);
      if ($mp -> code == 1)
      {
        $ss -> code = 1;
        $this -> guard -> createToken(['id' => $accountId, 'password' => $mp -> password], 0);
        Logger::log($this, 'manage.log-modify-password');
      }
      else
      {
        $ss -> code = $mp -> code === 0? 4004: 4005;
      }
    }
    $ss -> message = Jtbc::take('manage.text-modify-password-code-' . $ss -> code, 'lng');
    $result = $ss -> toJSON();
    return $result;
  }

  public function actionSetLang(Request $req)
  {
    $ss = new Substance();
    $lang = intval($req -> get('lang'));
    $this -> guard -> role -> setLang($lang);
    $currentLang = $this -> guard -> role -> getLang();
    $ss -> code = 1;
    $ss -> data = ['currentLang' => $currentLang, 'currentLangText' => Jtbc::take('::sel_lang.' . $currentLang, 'lng')];
    $result = $ss -> toJSON();
    return $result;
  }
}