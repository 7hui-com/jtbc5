<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;

class Date
{
  public static function format(string $argDateTime, $argType = 0)
  {
    return self::formatTimestamp(strtotime($argDateTime), $argType);
  }

  public static function formatTimestamp(int $argTime, $argType = 0)
  {
    $time = $argTime;
    $format = match(intval($argType))
    {
      -7 => 'w',
      -6 => 's',
      -5 => 'i',
      -4 => 'H',
      -3 => 'd',
      -2 => 'm',
      -1 => 'Y',
      0 => 'Ymd',
      1 => 'Y-m-d',
      2 => 'Y.m.d',
      3 => 'Y/m/d',
      10 => 'His',
      11 => 'H:i:s',
      20 => 'YmdHis',
      21 => 'Y-m-d H:i:s',
      30 => 'md',
      31 => 'm-d',
      32 => 'm.d',
      33 => 'm/d',
      40 => 'Hi',
      41 => 'H:i',
      default => 'Y-m-d H:i:s',
    };
    return date($format, $time);
  }

  public static function getCurrentYear()
  {
    return intval(date('Y', time()));
  }

  public static function getCurrentMonth()
  {
    return intval(date('m', time()));
  }

  public static function getCurrentDate()
  {
    return intval(date('d', time()));
  }

  public static function getCurrentHour()
  {
    return intval(date('H', time()));
  }

  public static function getCurrentMinute()
  {
    return intval(date('i', time()));
  }

  public static function getCurrentSecond()
  {
    return intval(date('s', time()));
  }

  public static function now()
  {
    return date('Y-m-d H:i:s', time());
  }

  public static function today()
  {
    return date('Y-m-d', time());
  }

  public static function tomorrow()
  {
    return date('Y-m-d', time() + 24 * 60 * 60);
  }

  public static function theDayAfterTomorrow()
  {
    return date('Y-m-d', time() + 2 * 24 * 60 * 60);
  }

  public static function thisDay()
  {
    return intval(date('Ymd', time()));
  }
}