<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\String;

class StringHelper
{
  public static function getBestMatchedString(string $argString, array $argStrings)
  {
    $result = null;
    $string = $argString;
    $strings = $argStrings;
    $bestPercent = $percent = 0;
    foreach ($strings as $item)
    {
      if (is_string($item))
      {
        similar_text($string, $item, $percent);
        if ($percent >= $bestPercent)
        {
          $result = $item;
          $bestPercent = $percent;
        }
      }
    }
    return $result;
  }

  public static function getClipedString(string $argString, string $argKey, string $argMode = 'left')
  {
    $result = '';
    $string = $argString;
    $key = $argKey;
    $mode = $argMode;
    if ($key == '' || !str_contains($string, $key))
    {
      $result = $string;
    }
    else
    {
      $tempArr = explode($key, $string);
      switch($mode)
      {
        case 'left':
          $tempArr = array_slice($tempArr, 0, 1);
          break;
        case 'left+':
          array_pop($tempArr);
          break;
        case 'right':
          $tempArr = array_slice($tempArr, -1, 1);
          break;
        case 'right+':
          array_shift($tempArr);
          break;
      }
      $result = implode($key, $tempArr);
    }
    return $result;
  }
}