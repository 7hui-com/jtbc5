<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Module;
use Jtbc\Module;

class ModuleHelper
{
  public static function fetch(string $argPrefixFolderName = '', string $argGuideFileName = 'guide', bool $argIsCacheable = true)
  {
    $result = [];
    $prefixFolderName = $argPrefixFolderName;
    $guideFileName = $argGuideFileName;
    $isCacheable = $argIsCacheable;
    $moduleFinder = new ModuleFinder($guideFileName, $isCacheable);
    $modules = $moduleFinder -> getModules($prefixFolderName);
    foreach ($modules as $genre)
    {
      $module = new Module($genre, $guideFileName, $isCacheable);
      $result[] = ['genre' => $genre, 'title' => $module -> getTitle(true)];
    }
    return $result;
  }

  public static function find(string $argPrefixFolderName = '', string $argGuideFileName = 'guide', bool $argIsCacheable = true)
  {
    $prefixFolderName = $argPrefixFolderName;
    $guideFileName = $argGuideFileName;
    $isCacheable = $argIsCacheable;
    $moduleFinder = new ModuleFinder($guideFileName, $isCacheable);
    return $moduleFinder -> getModules($prefixFolderName);
  }

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