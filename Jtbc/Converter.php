<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;

class Converter
{
  public static function convertToArrayExceptNull(array $argArray)
  {
    $result = [];
    $array = $argArray;
    foreach ($array as $key => $val)
    {
      if (!is_null($val))
      {
        $result[$key] = $val;
      }
    }
    return $result;
  }

  public static function convertToArrayWithKey(string $argString, string $argSeparator = ',', string $argKey = 'value')
  {
    $result = [];
    $string = $argString;
    $separator = $argSeparator;
    $key = $argKey;
    $tempArr = explode($separator, $string);
    if (is_array($tempArr))
    {
      foreach ($tempArr as $item)
      {
        $result[] = [$key => $item];
      }
    }
    return $result;
  }

  public static function convertToOption(array $argArray)
  {
    $result = [];
    $array = $argArray;
    foreach ($array as $key => $val)
    {
      $result[] = ['text' => $val, 'value' => $key];
    }
    return $result;
  }

  public static function convertToOrderedQuery(array $argArray)
  {
    $array = $argArray;
    ksort($array);
    $tempArr = [];
    foreach ($array as $key => $val)
    {
      $tempArr[] = $key . '=' . $val;
    }
    return implode('&', $tempArr);
  }

  public static function convertToVersionString(int $argVersionNumber)
  {
    return implode('.', str_split($argVersionNumber));
  }
}