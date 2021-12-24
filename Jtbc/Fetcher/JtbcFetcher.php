<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Fetcher;
use Jtbc\Jtbc;
use Jtbc\Substance;

class JtbcFetcher
{
  public static function fetch(array $argParam)
  {
    $result = [];
    $param = $argParam;
    $ss = new Substance($param);
    $codename = $ss -> codename;
    $type = $ss -> type ?? 'lng';
    if (!is_null($codename))
    {
      $data = Jtbc::take($codename, $type);
      if (!is_null($data))
      {
        if (is_array($data))
        {
          foreach ($data as $key => $value)
          {
            $result[] = ['key' => $key, 'value' => $value];
          }
        }
        else
        {
          $result = ['key' => substr($codename, strrpos($codename, '.') + 1), 'value' => $data];
        }
      }
    }
    return $result;
  }
}