<?php
namespace App\Common\Premium;
use Jtbc\Path;
use Jtbc\Encoder;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\String\StringHelper;
use Config\App\Common\Premium\PremiumConfig as Config;

class PremiumConfig
{
  private $fullPath;

  private function getFullPath()
  {
    $result = null;
    $classPath = Config::class;
    if (!is_null($classPath))
    {
      $configPath = '../' . str_replace('\\', '/', $classPath) . '.php';
      $result = Path::getActualRoute($configPath);
    }
    return $result;
  }

  public function get()
  {
    $result = new Substance();
    $result -> appid = Config::APPID;
    $result -> certificate = Config::CERTIFICATE;
    $result -> created_at = Config::CREATED_AT;
    $result -> updated_at = Config::UPDATED_AT;
    return $result;
  }

  public function getRealPath()
  {
    return realpath($this -> fullPath);
  }

  public function isWritable()
  {
    return is_writable($this -> fullPath);
  }

  public function set(Substance $config)
  {
    $result = false;
    if ($this -> isWritable())
    {
      if (is_int($config -> appid) && is_string($config -> certificate) && is_int($config -> created_at) && is_int($config -> updated_at))
      {
        if (!Validation::isEmpty($config -> certificate))
        {
          $configPath = $this -> fullPath;
          $baseName = basename($configPath, '.php');
          $configContent = '<?php' . chr(13) . chr(10);
          $configContent .= 'namespace ' . StringHelper::getClipedString(Config::class, '\\', 'left+') . ';' . chr(13) . chr(10) . chr(13) . chr(10);
          $configContent .= 'class ' . $baseName . chr(13) . chr(10);
          $configContent .= '{' . chr(13) . chr(10);
          $configContent .= '  public const APPID = ' . $config -> appid . ';' . chr(13) . chr(10);
          $configContent .= '  public const CERTIFICATE = \'' . Encoder::addslashes($config -> certificate) . '\';' . chr(13) . chr(10);
          $configContent .= '  public const CREATED_AT = ' . $config -> created_at . ';' . chr(13) . chr(10);
          $configContent .= '  public const UPDATED_AT = ' . $config -> updated_at . ';' . chr(13) . chr(10);
          $configContent .= '}';
          $result = @file_put_contents($configPath, $configContent) === false? false: true;
        }
      }
    }
    return $result;
  }

  public function __construct()
  {
    $this -> fullPath = $this -> getFullPath();
  }
}