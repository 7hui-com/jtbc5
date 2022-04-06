<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;

class Converter
{
  public static function convertHexToRGB(string $argHexCode)
  {
    $result = [];
    $hexCode = $argHexCode;
    if (Validation::isHexColor($hexCode))
    {
      $result = sscanf($hexCode, "#%02x%02x%02x");
    }
    return $result;
  }

  public static function convertJSONToArray($argString)
  {
    $result = [];
    $string = $argString;
    if (is_scalar($string))
    {
      $array = json_decode($string, true);
      if (is_array($array))
      {
        $result = $array;
      }
    }
    return $result;
  }

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