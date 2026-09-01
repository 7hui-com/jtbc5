<?php
namespace Jtbc;
use Exception;
use Jtbc\DB\MySQL\DB;
use Jtbc\Hook\GlobalHookManager;
use Jtbc\Config\ClassicConfigManager;
use App\Common\Ambassador;
use Config\DB\MySQL as MySQLConfig;
use Config\Encoder as EncoderConfig;

class Diplomat extends Ambassador {
  public $MIMEType = 'json';

  private function isSupportedDBHost(mixed $argHost)
  {
    $result = false;
    $host = $argHost;
    if (is_string($host) && !Validation::isEmpty($host))
    {
      if (!is_file('localdb.lock'))
      {
        $result = true;
      }
      else
      {
        if (in_array($host, ['localhost', '127.0.0.1']))
        {
          $result = true;
        }
      }
    }
    return $result;
  }

  private function isSupportedDBVersion(mixed $argVersion)
  {
    $result = false;
    $version = $argVersion;
    if (is_string($version) && !empty($version))
    {
      $versionArr = explode('.', $version);
      if (count($versionArr) >= 3)
      {
        $firstVersionNumber = intval($versionArr[0]);
        $secondVersionNumber = intval($versionArr[1]);
        if ($firstVersionNumber >= 8)
        {
          $result = true;
        }
        else if ($firstVersionNumber == 5 && $secondVersionNumber >= 7)
        {
          $result = true;
        }
      }
    }
    return $result;
  }

  private function getSQL(string $argUsername, string $argPassword, string $argMobile)
  {
    $sql = file_get_contents('_database.sql');
    $sql = str_replace('{$console_account_username}', $argUsername, $sql);
    $sql = str_replace('{$console_account_password}', Encoder::passwordHash($argPassword), $sql);
    $sql = str_replace('{$console_account_mobile}', $argMobile, $sql);
    $sql = str_replace('{$console_account_time}', Date::now(), $sql);
    return $sql;
  }

  public function actionInstall(Request $req)
  {
    $code = 0;
    $message = '';
    $redirectURL = null;
    $source = $req -> post();
    $validator = new Validator($source);
    if ($validator -> db_host -> isEmpty()) $code = 4001;
    else if ($validator -> db_username -> isEmpty()) $code = 4002;
    else if (!$validator -> db_database -> isNatural()) $code = 4003;
    else if (!$validator -> username -> isName()) $code = 4011;
    else if ($validator -> password -> isEmpty()) $code = 4012;
    else if (!$validator -> password -> sameAs('password_repeat')) $code = 4013;
    else if (!$validator -> mobile -> isEmpty() && !$validator -> mobile -> isMobile()) $code = 4014;
    else
    {
      $server = MySQLConfig::SERVER;
      $dbHost = $validator -> db_host -> value();
      if (!$this -> isSupportedDBHost($dbHost))
      {
        $code = 4403;
      }
      else if (is_array($server))
      {
        $completeToken = Random::getNumeric28();
        $completeFilePath = Path::getActualRoute('common/diplomat/complete.php');
        $completeFileContent = str_replace('{$token}', $completeToken, base64_decode(Jtbc::take('api.complete', 'lng')));
        $selfFolderPath = Path::getActualRoute(Path::getCurrentGenre());
        $classicConfigManager1 = new ClassicConfigManager(MySQLConfig::class);
        $classicConfigManager2 = new ClassicConfigManager(EncoderConfig::class);
        if (array_key_exists('default', $server))
        {
          $code = 4021;
        }
        else if (!$classicConfigManager1 -> isWritable() || !$classicConfigManager2 -> isWritable() || !is_writable($selfFolderPath))
        {
          $code = 4022;
        }
        else if (!@file_put_contents($completeFilePath, $completeFileContent))
        {
          $code = 4023;
        }
        else
        {
          $dbDatabase = $validator -> db_database -> value();
          $dbUsername = $validator -> db_username -> value();
          $dbPassword = $validator -> db_password -> value();
          $db = new DB($dbHost, null, $dbUsername, $dbPassword);
          if ($db -> errCode == 0)
          {
            $selectedDB = false;
            try
            {
              $re = $db -> exec('create database if not exists ' . $dbDatabase . ';');
              if (is_numeric($re))
              {
                $re = $db -> exec('use ' . $dbDatabase . ';select database();');
                if (is_numeric($re))
                {
                  $selectedDB = true;
                }
              }
            }
            catch(Exception $e)
            {
              $selectedDB = false;
            }
            if ($selectedDB == true)
            {
              if ($this -> isSupportedDBVersion($db -> getVersion()))
              {
                $re = $db -> exec($this -> getSQL($validator -> username -> value(), $validator -> password -> value(), $validator -> mobile -> value()));
                if (is_numeric($re))
                {
                  $classicConfigManager1 -> SERVER = [
                    'default' => [
                      'HOST' => $dbHost,
                      'USERNAME' => $dbUsername,
                      'PASSWORD' => $dbPassword,
                      'DATABASE' => $dbDatabase,
                      'CHARSET' => 'utf8mb4',
                    ],
                  ];
                  $classicConfigManager2 -> SALT = Random::getRandomLetterOptimized(16);
                  if ($classicConfigManager1 -> save() && $classicConfigManager2 -> save())
                  {
                    $code = 1;
                    $message = Jtbc::take('api.text-done', 'lng');
                    $globalHookManager = new GlobalHookManager();
                    $globalHookManager -> cancel('_install');
                    $redirectURL = Path::getActualRoute('complete?token=' . $completeToken);
                  }
                  else
                  {
                    $code = 4444;
                  }
                }
                else
                {
                  $code = 4061;
                }
              }
              else
              {
                $code = 4051;
              }
            }
            else
            {
              $code = 4041;
            }
          }
          else
          {
            $code = 4031;
          }
        }
      }
      else
      {
        $code = 4444;
      }
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = $message ?: Jtbc::take('api.text-tips-install-error-' . $code, 'lng');
    $ss -> redirect_url = $redirectURL;
    return $ss -> toJSON();
  }
}