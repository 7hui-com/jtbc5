<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\DAL;

class SQLFormatter
{
  public static function formatName($argName)
  {
    $name = $argName;
    if (is_numeric($name) || is_string($name))
    {
      $name = '`' . str_replace('`', '``', $name) . '`';
    }
    return $name;
  }
}