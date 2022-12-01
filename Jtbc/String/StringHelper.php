<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\String;

class StringHelper
{
  public static function contains(string $argString, string $argKey, string $argSeparator = ',')
  {
    $result = false;
    $string = $argString;
    $key = $argKey;
    $separator = $argSeparator;
    if (str_contains($string, $separator))
    {
      if (in_array($key, explode($separator, $string)))
      {
        $result = true;
      }
    }
    else
    {
      if ($string == $key)
      {
        $result = true;
      }
    }
    return $result;
  }

  public static function desensitize(string $argString, int $argStart = null, int $argLength = null, string $argTargetChar = '*')
  {
    $result = null;
    $string = $argString;
    $start = $argStart ?? floor(mb_strlen($string) / 3);
    $length = $argLength ?? ceil(mb_strlen($string) / 3);
    $targetChar = $argTargetChar;
    if (mb_strlen($string) == 1)
    {
      $result = $targetChar;
    }
    else
    {
      $pocket = [];
      $strings = mb_str_split($string);
      foreach ($strings as $key => $value)
      {
        if ($key < $start)
        {
          $pocket[] = $value;
        }
        else if ($key >= $start + $length)
        {
          $pocket[] = $value;
        }
        else
        {
          $pocket[] = $targetChar;
        }
      }
      $result = implode($pocket);
    }
    return $result;
  }

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

  public static function getClipedString(...$args)
  {
    return self::getClippedString(...$args);
  }

  public static function getClippedString(string $argString, string $argKey, string $argMode = 'left')
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

  public static function getLeftString(string $argString, int $argLength, string $argEllipsis = null)
  {
    $string = $argString;
    $length = max(0, $argLength);
    $ellipsis = $argEllipsis;
    $result = mb_substr($string, 0, $length);
    if (!is_null($ellipsis) && mb_strlen($string) > $length)
    {
      $result .= $ellipsis;
    }
    return $result;
  }
}