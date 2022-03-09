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

  public static function get(string $argName, string $argKey = null, int $argLang = null)
  {
    $key = $argKey;
    $name = $argName;
    $result = is_null($key)? []: null;
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
      $lang = $argLang ?? Env::getLang();
      $defaultLang = Env::getDefaultLang();
      foreach ($content as $item)
      {
        $currentItem = new Substance($item);
        $currentKey = $currentItem -> key;
        $currentValue = $currentItem['value_' . $lang] ?: $currentItem['value_' . $defaultLang];
        if (is_null($key))
        {
          if (!array_key_exists($currentKey, $result))
          {
            $result[$currentKey] = $currentValue;
          }
        }
        else
        {
          if ($key == $currentKey)
          {
            $result = $currentValue;
            break;
          }
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