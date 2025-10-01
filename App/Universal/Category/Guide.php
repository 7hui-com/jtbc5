<?php
namespace App\Universal\Category;
use Jtbc\Jtbc;
use Jtbc\Module\ModuleFinder;

class Guide
{
  public static function getAllGenre()
  {
    $moduleFinder = new ModuleFinder('category');
    return $moduleFinder -> getModules();
  }

  public static function getAllGenreOptions()
  {
    $result = [];
    $allGenre = self::getAllGenre();
    foreach ($allGenre as $genre)
    {
      if (self::isValidGenre($genre))
      {
        $result[] = ['text' => self::getGenreTitle($genre), 'subtext' => $genre, 'value' => $genre];
      }
    }
    return $result;
  }

  public static function getGenreMode(string $argGenre)
  {
    return Jtbc::take('global.' . $argGenre . ':category.mode', 'cfg');
  }

  public static function getGenreTitle(string $argGenre)
  {
    return Jtbc::take('global.' . $argGenre . ':category.title', 'cfg');
  }

  public static function getGenreParam(string $argGenre, string $argParamName)
  {
    $result = null;
    $genre = $argGenre;
    $paramName = $argParamName;
    if (self::isValidGenre($genre))
    {
      $result = Jtbc::take('global.' . $genre . ':category.' . $paramName, 'cfg');
    }
    return $result;
  }

  public static function getGenreProperty(string $argGenre)
  {
    $result = [];
    $genre = $argGenre;
    if (self::isValidGenre($genre))
    {
      $all = Jtbc::take('global.' . $genre . ':category.*', 'cfg');
      foreach ($all as $key => $value)
      {
        if (str_starts_with($key, 'has_'))
        {
          $result[$key] = $value == 'true'? true: false;
        }
      }
    }
    return $result;
  }

  public static function getFirstValidGenre(?array $argGenreArr = null)
  {
    $result = null;
    $genreArr = $argGenreArr ?? self::getAllGenre();
    if (is_array($genreArr))
    {
      foreach ($genreArr as $genre)
      {
        if (self::isValidGenre($genre))
        {
          $result = $genre;
          break;
        }
      }
    }
    return $result;
  }

  public static function isValidGenre(string $argGenre)
  {
    return is_null(self::getGenreTitle($argGenre))? false: true;
  }
}