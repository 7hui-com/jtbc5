<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;
use Jtbc\Fetcher\JtbcFetcher;
use Jtbc\Fetcher\ModelFetcher;
use Jtbc\Fetcher\SQLFetcher;

class Fetcher
{
  public static function fetch(array $argParam, string $argMode = 'model', callable $filter = null)
  {
    $mode = $argMode;
    $param = $argParam;
    $result = $data = [];
    switch($mode)
    {
      case 'jtbc':
        $data = JtbcFetcher::fetch($param);
        break;
      case 'model':
        $data = ModelFetcher::fetch($param);
        break;
      case 'sql':
        $data = SQLFetcher::fetch($param);
        break;
    }
    foreach ($data as $key => $item)
    {
      $isFiltered = false;
      if (is_callable($filter))
      {
        if ($filter(new Substance($item)) === true)
        {
          $isFiltered = true;
        }
      }
      if ($isFiltered === false)
      {
        $result[$key] = $item;
      }
    }
    return $result;
  }
}