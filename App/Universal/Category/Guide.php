<?php
namespace App\Universal\Category;
use Jtbc\Path;
use Jtbc\Jtbc;
use Jtbc\Module\ModuleFinder;

class Guide
{
  public static function getAllGenre()
  {
    $moduleFinder = new ModuleFinder('category');
    return $moduleFinder -> getModules();
  }

  public static function getAllGenreTitle(array $argGenreArr = null)
  {
    $result = [];
    $genreArr = $argGenreArr ?? self::getAllGenre();
    if (is_array($genreArr))
    {
      foreach ($genreArr as $genre)
      {
        if (self::isValidGenre($genre))
        {
          $result[] = ['genre' => $genre, 'title' => Jtbc::take('global.' . $genre . ':category.title', 'cfg') . '(' . $genre . ')'];
        }
      }
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

  public static function getFirstValidGenre(array $argGenreArr = null)
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
    $bool = false;
    $genre = $argGenre;
    $title = Jtbc::take('global.' . $genre . ':category.title', 'cfg');
    if (!is_null($title)) $bool = true;
    return $bool;
  }
}