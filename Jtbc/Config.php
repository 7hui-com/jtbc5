<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;
use Jtbc\Config\ConfigReader;

final class Config
{
  public static function get(string $argConfigClassName, string $argName, $argDefaultValue = null)
  {
    $configReader = new ConfigReader($argConfigClassName, false);
    return $configReader -> read($argName, $argDefaultValue);
  }
}