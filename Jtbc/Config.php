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
}