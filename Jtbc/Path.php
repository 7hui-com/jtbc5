<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;
use DirectoryIterator;

class Path
{
  private static $currentRank = null;
  private static $currentGenre = null;

  private static function getRank()
  {
    $rank = null;
    $index = -1;
    $rootFile = 'common/root.jtbc';
    while ($index < 5)
    {
      $index += 1;
      if (is_file($rootFile))
      {
        $rank = $index;
        break;
      }
      else
      {
        $rootFile = '../' . $rootFile;
      }
    }
    return $rank;
  }

  private static function getActualGenre($argRank)
  {
    $genre = '';
    $rank = $argRank;
    $currentPath = realpath(getcwd());
    $usefulArray = [];
    $pathArray = array_reverse(explode(DIRECTORY_SEPARATOR, $currentPath));
    if (is_numeric($rank)) $usefulArray = array_slice($pathArray, 0, $rank);
    if (!empty($usefulArray))
    {
      $genre = implode('/', array_reverse($usefulArray));
    }
    return $genre;
  }

  public static function changeTo(string $argDirName)
  {
    $dirName = $argDirName;
    self::$currentRank = null;
    self::$currentGenre = null;
    return @chdir($dirName);
  }

  public static function getActualRoute($argRouteStr = '')
  {
    $routeStr = $argRouteStr;
    $route = str_repeat('../', self::getCurrentRank()) . $routeStr;
    return $route;
  }

  public static function getCurrentGenre()
  {
    $currentGenre = self::$currentGenre;
    if (is_null($currentGenre))
    {
      $currentGenre = self::$currentGenre = self::getActualGenre(self::getCurrentRank());
    }
    return $currentGenre;
  }

  public static function getCurrentGenreByNS(string $argNamespace)
  {
    $genre = null;
    $namespace = strtolower($argNamespace);
    if (substr($namespace, 0, 4) == 'web\\')
    {
      $tempGenre = substr($namespace, 4);
      $genre = str_replace('\\', '/', $tempGenre);
    }
    return $genre;
  }

  public static function getCurrentRank()
  {
    $currentRank = self::$currentRank;
    if (is_null($currentRank))
    {
      $currentRank = self::$currentRank = self::getRank();
    }
    return $currentRank;
  }

  public static function getParentGenre($argOriGenre = null)
  {
    return self::getParentGenreByGeneration(1, $argOriGenre);
  }

  public static function getParentGenreByGeneration($argGeneration, $argOriGenre = null)
  {
    $parentGenre = null;
    $generation = $argGeneration;
    $oriGenre = $argOriGenre ?? self::getCurrentGenre();
    if (is_numeric($generation) && str_contains($oriGenre, '/'))
    {
      $oriGenreAry = explode('/', $oriGenre);
      if ($generation < count($oriGenreAry))
      {
        $tempGenreAry = array_reverse(array_slice(array_reverse($oriGenreAry), $generation));
        $parentGenre = implode('/', $tempGenreAry);
      }
    }
    return $parentGenre;
  }

  public static function getInteriorNameSpace($argGenre = null)
  {
    $genre = $argGenre ?? self::getCurrentGenre();
    $folders = array_merge(['web'], explode('/', $genre));
    foreach ($folders as $key => $val)
    {
      $folders[$key] = ucfirst($val);
    }
    return implode('\\', $folders);
  }
}