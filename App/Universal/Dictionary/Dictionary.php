<?php
namespace App\Universal\Dictionary;
use Jtbc\Env;
use Jtbc\JSON;
use Jtbc\Substance;
use Jtbc\Facade\Cache;

class Dictionary
{
  private static function getCacheName(string $argName)
  {
    return 'universal-dictionary-' . $argName;
  }

  public static function get(string $argName)
  {
    $result = [];
    $name = $argName;
    $cache = new Cache();
    $cacheName = self::getCacheName($name);
    $content = $cache -> get($cacheName);
    if (!is_array($content))
    {
      $model = new Model();
      $model -> where -> name = $name;
      $rs = $model -> get();
      if (!is_null($rs))
      {
        $content = JSON::decode($rs -> content);
        $cache -> put($cacheName, $content);
      }
    }
    if (is_array($content))
    {
      $lang = Env::getLang();
      $defaultLang = Env::getDefaultLang();
      foreach ($content as $item)
      {
        $currentItem = new Substance($item);
        $key = $currentItem -> key;
        if (!array_key_exists($key, $result))
        {
          $result[$key] = $currentItem['value_' . $lang] ?: $currentItem['value_' . $defaultLang];
        }
      }
    }
    return $result;
  }

  public static function getList()
  {
    $result = [];
    $model = new Model();
    $model -> orderBy('name', 'asc');
    $rsa = $model -> getAll();
    foreach ($rsa as $rs)
    {
      $result[] = ['name' => $rs -> name];
    }
    return $result;
  }

  public static function refresh(string $argName)
  {
    $name = $argName;
    $cache = new Cache();
    $cache -> remove(self::getCacheName($name));
  }
}