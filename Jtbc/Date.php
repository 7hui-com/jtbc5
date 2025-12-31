<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;
use DateTime;

class Date
{
  public static function format(string $argDateTime, $argType = 0)
  {
    return self::formatTimestamp(strtotime($argDateTime), $argType);
  }

  public static function formatTimestamp(int $argTime, $argType = 0)
  {
    $time = $argTime;
    $format = match(intval($argType)){
      -8 => 'F',
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
      50 => 'F j',
      51 => 'F j, Y',
      2822 => DateTime::RFC2822,
      3339 => DateTime::RFC3339,
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

  public static function getEarliestTimestamp(string $argDate)
  {
    $result = false;
    $date = $argDate;
    if (Validation::isDate($date))
    {
      $result = strtotime($date . ' 0:00:00');
    }
    return $result;
  }

  public static function getLatestTimestamp(string $argDate)
  {
    $result = false;
    $date = $argDate;
    if (Validation::isDate($date))
    {
      $result = strtotime($date . ' 23:59:59');
    }
    return $result;
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

  public static function thisYear()
  {
    return intval(date('Y', time()));
  }

  public static function thisMonth()
  {
    return intval(date('Ym', time()));
  }

  public static function thisDay()
  {
    return intval(date('Ymd', time()));
  }
}