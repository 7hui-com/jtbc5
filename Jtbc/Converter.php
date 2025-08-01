<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;
use Jtbc\String\StringHelper;

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

  public static function convertKeyValuePairToArray(array $argArray, string $argKeyName = 'key', string $argValueName = 'value')
  {
    $result = [];
    $array = $argArray;
    $keyName = $argKeyName;
    $valueName = $argValueName;
    foreach ($array as $key => $value)
    {
      $result[] = [$keyName => $key, $valueName => $value];
    }
    return $result;
  }

  public static function convertNumericToTimestamp(string $argNumeric)
  {
    $result = false;
    $numeric = $argNumeric;
    if (Validation::isNumber($numeric) && strlen($numeric) == 14)
    {
      $result = intval(strtotime(substr($numeric, 0, 4) . '-' . substr($numeric, 4, 2) . '-' . substr($numeric, 6, 2) . ' ' . substr($numeric, 8, 2) . ':' . substr($numeric, 10, 2) . ':' . substr($numeric, 12, 2)));
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
    return self::convertKeyValuePairToArray($argArray, 'value', 'text');
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

  public static function convertToStandardIPv6(string $argString)
  {
    $result = false;
    $string = $argString;
    if (Validation::isIPv6($string))
    {
      if ($string == '::')
      {
        $result = '0:0:0:0:0:0:0:0';
      }
      else
      {
        if (str_contains($string, '.'))
        {
          $prefix = StringHelper::getClippedString($string, ':', 'left+');
          $suffix = StringHelper::getClippedString($string, ':', 'right');
          if (Validation::isIPv4($suffix))
          {
            $array = explode('.', $suffix);
            $p1 = dechex(intval($array[0]));
            $p2 = dechex(intval($array[1]));
            $p3 = dechex(intval($array[2]));
            $p4 = dechex(intval($array[3]));
            if (strlen($p2) === 1)
            {
              $p2 = '0' . $p2;
            }
            if (strlen($p4) === 1)
            {
              $p4 = '0' . $p4;
            }
            $result = self::convertToStandardIPv6($prefix . ':' . $p1 . $p2 . ':' . $p3 . $p4);
          }
        }
        else if (str_contains($string, '::'))
        {
          $array = ['0', '0', '0', '0', '0', '0', '0', '0'];
          $prefix = StringHelper::getClippedString($string, '::', 'left+');
          $suffix = StringHelper::getClippedString($string, '::', 'right');
          if (!Validation::isEmpty($prefix))
          {
            $tempArr = explode(':', $prefix);
            foreach ($tempArr as $key => $value)
            {
              $array[$key] = $value;
            }
          }
          if (!Validation::isEmpty($suffix))
          {
            $tempArr = explode(':', $suffix);
            foreach ($tempArr as $key => $value)
            {
              $array[count($array) - count($tempArr) + $key] = $value;
            }
          }
          $result = implode(':', $array);
        }
        else
        {
          $result = $string;
        }
      }
    }
    return $result;
  }

  public static function convertToTreeOption(array $argArray)
  {
    $index = 0;
    $result = [];
    $array = $argArray;
    $prefix = '_';
    $getChildren = function(int $argIndex, int $argRank) use ($array, $prefix, &$getChildren)
    {
      $index = 0;
      $result = [];
      $currentRank = $argRank;
      $nextRank = $currentRank + 1;
      foreach ($array as $key => $val)
      {
        if ($index > $argIndex)
        {
          if (str_starts_with($key, str_repeat($prefix, $currentRank)))
          {
            if (!str_starts_with($key, str_repeat($prefix, $nextRank)))
            {
              $children = $getChildren($index, $nextRank);
              $item = ['text' => $val, 'value' => substr($key, $currentRank)];
              if (!empty($children))
              {
                $item['children'] = $children;
              }
              $result[] = $item;
            }
          }
          else
          {
            break;
          }
        }
        $index += 1;
      }
      return $result;
    };
    foreach ($array as $key => $val)
    {
      if (!str_starts_with($key, $prefix))
      {
        $children = $getChildren($index, 1);
        $item = ['text' => $val, 'value' => $key];
        if (!empty($children))
        {
          $item['children'] = $children;
        }
        $result[] = $item;
      }
      $index += 1;
    }
    return $result;
  }

  public static function convertToVersionString(int $argVersionNumber)
  {
    return implode('.', str_split($argVersionNumber));
  }
}