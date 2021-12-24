<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Phar;
use Jtbc\Path;
use Jtbc\Validation;
use Jtbc\Exception\NotExistException;
use Jtbc\Exception\NotSupportedException;

class PharLoader
{
  private static $loaded = [];
  private static $folderName = 'Phar';

  public static function getFolderPath()
  {
    return Path::getActualRoute('../') . self::$folderName;
  }

  public static function getPharFullPath(string $argName)
  {
    return self::getFolderPath() . '/' . $argName . '.phar';
  }

  public static function isExists(string $argName)
  {
    return is_file(self::getPharFullPath($argName));
  }

  public static function isLoaded(string $argName)
  {
    return array_key_exists($argName, self::$loaded);
  }

  public static function load(string $argName)
  {
    $result = false;
    $name = $argName;
    if (self::isLoaded($name))
    {
      $result = true;
    }
    else
    {
      if (Validation::isNatural($name))
      {
        $fullPath = self::getPharFullPath($name);
        if (is_file($fullPath))
        {
          $result = true;
          require_once($fullPath);
          self::$loaded[$name] = ['time' => time()];
        }
        else
        {
          throw new NotExistException('Phar "' . $name . '" does not exist', 50404);
        }
      }
      else
      {
        throw new NotSupportedException('Phar\'s name "' . $name . '" is not supported', 50415);
      }
    }
    return $result;
  }
}