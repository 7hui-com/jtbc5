<?php
namespace App\Universal\Fragment;

class FragmentFetcher
{
  private static $data;
  private static $map = [];

  public static function getData()
  {
    $result = self::$data;
    if (is_null($result))
    {
      $model = new Model();
      $result = self::$data = $model -> getAll();
    }
    return $result;
  }

  public static function fetch(string $argKey)
  {
    $result = [];
    $key = $argKey;
    if (array_key_exists($key, self::$map))
    {
      $result[] = self::$map[$key];
    }
    else
    {
      $data = self::getData();
      if (!empty($data))
      {
        foreach ($data as $item)
        {
          if ($item -> key == $key)
          {
            self::$map[$key] = $item -> all();
            $result[] = self::$map[$key];
            break;
          }
        }
      }
    }
    return $result;
  }
}