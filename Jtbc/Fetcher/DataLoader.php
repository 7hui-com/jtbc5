<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Fetcher;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\Facade\Cache;

class DataLoader
{
  private static $cacheNamePrefix = 'fetcher_dataloader_';

  public static function load(array $argParam, callable $getFreshData)
  {
    $result = [];
    $param = $argParam;
    $ss = new Substance($param);
    if ($ss -> exists('cache'))
    {
      $cacheParam = new Substance($ss -> cache);
      if (Validation::isNatural($cacheParam -> name))
      {
        $cache = new Cache();
        $cacheName = self::$cacheNamePrefix . $cacheParam -> name;
        $data = $cache -> get($cacheName);
        if (!is_array($data))
        {
          $data = $getFreshData();
          $cache -> put($cacheName, $data, time() + intval($cacheParam -> timeout));
        }
      }
      $index = $count = 0;
      $limit = is_int($ss -> limit)? $ss -> limit: 1000000;
      $rowFilter = is_array($ss -> rowFilter)? $ss -> rowFilter: [];
      if (Validation::isArrayList($data))
      {
        foreach ($data as $item)
        {
          $index += 1;
          if (!in_array($index, $rowFilter))
          {
            if ($count < $limit)
            {
              $count += 1;
              $result[] = $item;
            }
            else
            {
              break;
            }
          }
        }
      }
    }
    return $result;
  }
}