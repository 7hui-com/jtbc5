<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;

class Validation
{
  public static function isArrayList($argArray)
  {
    $bool = false;
    $array = $argArray;
    if (is_array($array))
    {
      $bool = true;
      $currentKey = 0;
      foreach ($array as $key => $value)
      {
        if ($key !== $currentKey)
        {
          $bool = false;
          break;
        }
        $currentKey += 1;
      }
    }
    return $bool;
  }

  public static function isChinese($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      if (preg_match('/^[x{4e00}-\x{9fa5}]+$/u', $string)) $bool = true;
    }
    return $bool;
  }

  public static function isClassicArray($argArray)
  {
    $bool = false;
    $array = $argArray;
    if (is_array($array))
    {
      $bool = true;
      foreach ($array as $key => $value)
      {
        if (is_array($value))
        {
          if (!self::isClassicArray($value))
          {
            $bool = false;
            break;
          }
        }
        else
        {
          if (!is_scalar($value))
          {
            $bool = false;
            break;
          }
        }
      }
    }
    return $bool;
  }

  public static function isConstantName($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      if (preg_match('/^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*$/', $string)) $bool = true;
    }
    return $bool;
  }

  public static function isDate($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      $dateArray = explode('-', $string);
      if (count($dateArray) == 3)
      {
        list($year, $month, $day) = $dateArray;
        if (is_numeric($year) && is_numeric($month) && is_numeric($day))
        {
          $bool = checkdate($month, $day, $year);
        }
      }
    }
    return $bool;
  }

  public static function isDateRange($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      if (str_contains($string, '~'))
      {
        $dateArr = explode('~', $string);
        if (count($dateArr) == 2)
        {
          if (self::isDate($dateArr[0]) && self::isDate($dateArr[1]))
          {
            $bool = true;
          }
        }
      }
    }
    return $bool;
  }

  public static function isDateTime($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      $standardDate = date('Y-m-d H:i:s', strtotime($string));
      if ($standardDate == $string) $bool = true;
    }
    return $bool;
  }

  public static function isDateTimeRange($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      if (str_contains($string, '~'))
      {
        $dateArr = explode('~', $string);
        if (count($dateArr) == 2)
        {
          if (self::isDateTime($dateArr[0]) && self::isDateTime($dateArr[1]))
          {
            $bool = true;
          }
        }
      }
    }
    return $bool;
  }

  public static function isDirPath($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      if (preg_match('/^[\/a-zA-Z0-9_-]+$/', $string)) $bool = true;
    }
    return $bool;
  }

  public static function isDomain($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      if (preg_match('/^(([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]))\.([a-zA-Z]{2,6}|[a-zA-Z0-9-]{2,30}\.[a-zA-Z]{2,3})$/', $string)) $bool = true;
    }
    return $bool;
  }

  public static function isEmpty($argValue)
  {
    $bool = false;
    $value = $argValue;
    if (is_null($value)) $bool = true;
    else if (is_array($value) && empty($value)) $bool = true;
    else if (is_string($value) && trim($value) == '') $bool = true;
    return $bool;
  }

  public static function isEmail($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      if (preg_match('/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/', $string)) $bool = true;
    }
    return $bool;
  }

  public static function isHex($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      if (preg_match('/^[0-9a-fA-F]+$/', $string)) $bool = true;
    }
    return $bool;
  }

  public static function isHexColor($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      if (preg_match('/^#([0-9a-fA-F]{6})$/', $string)) $bool = true;
    }
    return $bool;
  }

  public static function isIDCard($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      if (preg_match('/(^\d{18}$)|(^\d{17}(\d|X|x)$)/', $string))
      {
        $checkSum = 0;
        $cardBase = substr($string, 0, 17);
        $codeFactor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        $verifyNumberList = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
        for ($ti = 0; $ti < strlen($cardBase); $ti ++)
        {
          $checkSum += substr($cardBase, $ti, 1) * $codeFactor[$ti];
        }
        $verifyNumber = $verifyNumberList[$checkSum % 11];
        if (strtoupper(substr($string, 17, 1)) == $verifyNumber) $bool = true;
      }
    }
    return $bool;
  }

  public static function isInteger($argString)
  {
    $bool = false;
    $string = $argString;
    if (ctype_digit(strval($string))) $bool = true;
    else
    {
      if (str_starts_with($string, '-'))
      {
        $bool = self::isInteger(substr($string, 1));
      }
    }
    return $bool;
  }

  public static function isIP($argString)
  {
    $bool = false;
    $string = $argString;
    if (self::isIPv4($string) || self::isIPv6($string)) $bool = true;
    return $bool;
  }

  public static function isIPv4($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      if (filter_var($string, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) !== false) $bool = true;
    }
    return $bool;
  }

  public static function isIPv6($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      if (filter_var($string, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) !== false) $bool = true;
    }
    return $bool;
  }

  public static function isIntArray($argArray)
  {
    $bool = false;
    $array = $argArray;
    if (self::isArrayList($array))
    {
      $bool = true;
      foreach ($array as $item)
      {
        if (!is_int($item))
        {
          $bool = false;
          break;
        }
      }
    }
    return $bool;
  }

  public static function isIntSeries($argString)
  {
    $bool = false;
    $string = $argString;
    if (is_int($string)) $bool = true;
    else if (is_string($string))
    {
      $allMatch = true;
      $strArray = explode(',', $string);
      foreach($strArray as $val)
      {
        if (!(is_numeric($val) && strval(intval($val)) == $val)) $allMatch = false;
      }
      if ($allMatch == true) $bool = true;
    }
    return $bool;
  }

  public static function isJSON($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      $jsonDecode = json_decode($string);
      $jsonLastError = json_last_error();
      if ($jsonLastError == JSON_ERROR_NONE) $bool = true;
    }
    return $bool;
  }

  public static function isMobile($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      if (preg_match('/^1\d{10}$/', $string)) $bool = true;
    }
    return $bool;
  }

  public static function isName($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      if (preg_match('/^[A-Za-z0-9\x{0020}\x{00b7}\x{4e00}-\x{9fa5}_,.-]+$/u', $string)) $bool = true;
    }
    return $bool;
  }

  public static function isNatural($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      if (preg_match('/^[a-zA-Z0-9_-]+$/', $string)) $bool = true;
    }
    return $bool;
  }

  public static function isNumber($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      if (preg_match('/^[0-9]*$/', $string)) $bool = true;
    }
    return $bool;
  }

  public static function isNumeric28($argString)
  {
    $bool = false;
    $string = $argString;
    if (is_string($string) && strlen($string) == 28 && self::isNumber($string))
    {
      $bool = true;
    }
    return $bool;
  }

  public static function isPercent($argString)
  {
    $bool = false;
    $string = $argString;
    if (substr_count($string, '%') == 1 && str_ends_with($string, '%'))
    {
      $bool = self::isPercentage(substr($string, 0, -1));
    }
    return $bool;
  }

  public static function isPercentage($argString)
  {
    $bool = false;
    $string = $argString;
    $percentage = intval($string);
    if (strval($percentage) == strval($string))
    {
      if ($percentage >= 0 && $percentage <= 100)
      {
        $bool = true;
      }
    }
    return $bool;
  }

  public static function isSlug($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      if (!str_starts_with($string, '-') && !str_ends_with($string, '-'))
      {
        if (preg_match('/^[a-z0-9-]+$/', $string)) $bool = true;
      }
    }
    return $bool;
  }

  public static function isTime($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      if (preg_match('/^(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/', $string)) $bool = true;
    }
    return $bool;
  }

  public static function isTimeRange($argString)
  {
    $bool = false;
    $string = $argString;
    if (!self::isEmpty($string))
    {
      if (str_contains($string, '~'))
      {
        $timeArr = explode('~', $string);
        if (count($timeArr) == 2)
        {
          if (self::isTime($timeArr[0]) && self::isTime($timeArr[1]))
          {
            $bool = true;
          }
        }
      }
    }
    return $bool;
  }

  public static function isURL($argString)
  {
    $bool = false;
    $string = $argString;
    if (filter_var($string, FILTER_VALIDATE_URL) !== false) $bool = true;
    return $bool;
  }
}