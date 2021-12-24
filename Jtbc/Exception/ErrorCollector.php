<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Exception;
use Jtbc\Substance;

class ErrorCollector
{
  private $error = [];

  public function collect(array $argItem)
  {
    $item = $argItem;
    if (!array_key_exists('code', $item))
    {
      $item['code'] = 4444;
    }
    if (!array_key_exists('message', $item))
    {
      $item['message'] = 'Unknown Error.';
    }
    $this -> error[] = $item;
  }

  public function isEmpty()
  {
    return empty($this -> error);
  }

  public function getResult()
  {
    $result = new Substance();
    $result -> error = $this -> error;
    $result -> firstCode = $this -> firstCode;
    $result -> firstMessage = $this -> firstMessage;
    return $result;
  }

  public function __get($argName)
  {
    $result = null;
    $name = $argName;
    if ($name == 'error')
    {
      $result = $this -> error;
    }
    else if ($name == 'firstCode')
    {
      $first = current($this -> error);
      if (is_array($first)) $result = $first['code'];
    }
    else if ($name == 'firstMessage')
    {
      $first = current($this -> error);
      if (is_array($first)) $result = $first['message'];
    }
    return $result;
  }
}