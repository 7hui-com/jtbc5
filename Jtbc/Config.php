<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;
use Jtbc\Config\ConfigReader;
use Jtbc\String\StringHelper;

final class Config
{
  public static function get(string $argConfigClassName, string $argName, $argDefaultValue = null)
  {
    $configReader = new ConfigReader($argConfigClassName, false);
    return $configReader -> read($argName, $argDefaultValue);
  }

  public static function getConfig(string $argKey, $argDefaultValue = null)
  {
    $result = null;
    $key = $argKey;
    $defaultValue = $argDefaultValue;
    if (str_contains($key, '.'))
    {
      $name = StringHelper::getClipedString($key, '.', 'right');
      $configClassName = str_replace('.', '/', StringHelper::getClipedString($key, '.', 'left+'));
      $result = self::get($configClassName, $name, $defaultValue);
    }
    return $result;
  }

  public static function getConfigClassNameByGenre(string $argGenre, string $argFilename)
  {
    $genre = $argGenre;
    $filename = $argFilename;
    $className = ['config', 'app'];
    if (!Validation::isEmpty($genre))
    {
      $className = array_merge($className, explode('/', $genre));
    }
    if (!Validation::isEmpty($filename))
    {
      $className = array_merge($className, [$filename]);
    }
    return implode(chr(92), array_map(fn($val) => ucfirst($val), $className));
  }

  public static function read(string $argConfigClassName, string $argName, $argDefaultValue = null)
  {
    $currentClass = __CLASS__;
    $configClassName = $argConfigClassName;
    $currentClassPrefix = StringHelper::getClipedString($currentClass, chr(92), 'left');
    if (str_starts_with($configClassName, $currentClassPrefix . chr(92)))
    {
      $configClassName = StringHelper::getClipedString($configClassName, chr(92), 'right+');
    }
    if (str_contains($configClassName, chr(92)))
    {
      $configClassName = str_replace(chr(92), chr(47), $configClassName);
    }
    return self::get($configClassName, $argName, $argDefaultValue);
  }
}