<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Module;

class ModuleHelper
{
  public static function getTableNameByGenre(string $argGenre)
  {
    $tableName = null;
    $genre = $argGenre;
    if (!is_null($genre))
    {
      $tableName = str_replace('/', '_', $genre);
    }
    return $tableName;
  }
}