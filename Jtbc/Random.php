<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;
use Jtbc\Exception\OutOfRangeException;
use Jtbc\Exception\NotSupportedException;

class Random
{
  public static function getNumeric19(): int
  {
    $timestamp = time();
    $currentYear = intval(date('Y', $timestamp));
    if ($currentYear < 2002 || $currentYear > 2261)
    {
      throw new OutOfRangeException('The current time is out of range', 50416);
    }
    else if (PHP_INT_SIZE < 8)
    {
      throw new NotSupportedException('The "getNumeric19()" method cannot be used on systems with less than 64 bits', 50415);
    }
    else
    {
      return intval(round(microtime(true) * 1000) . sprintf("%06d", mt_rand(0, 999999)));
    }
  }

  public static function getNumeric28(): string
  {
    $timestamp = time();
    $currentYear = intval(date('Y', $timestamp));
    if ($currentYear < 1000 || $currentYear > 9999)
    {
      throw new OutOfRangeException('The current time is out of range', 50416);
    }
    else
    {
      return date('YmdHis', $timestamp) . substr(sprintf("%03d", intval((microtime(true) - $timestamp) * 1000)), -3) . sprintf("%011d", mt_rand(0, 99999999999));
    }
  }

  public static function getRandom($argLength = 16, $argMode = null)
  {
    $selected = [];
    $length = intval($argLength);
    $mode = $argMode;
    if ($length > 0)
    {
      $chars = match($mode){
        'letter' => 'abcdefghijklmnopqrstuvwxyz',
        'letter-optimized' => 'acdefghjkmnpqrstuwxy',
        'mix' => 'abcdefghijklmnopqrstuvwxyz1234567890',
        'mix-optimized' => 'acdefghjkmnpqrstuwxy12356789',
        'number' => '1234567890',
        'number-optimized' => '12356789',
        default => 'abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*',
      };
      $max = strlen($chars) - 1;
      for($i = 0; $i < $length; $i ++)
      {
        $selected[] = $chars[rand(0, $max)];
      }
    }
    return implode($selected);
  }

  public static function getRandomLetter($argLength = 16)
  {
    return self::getRandom($argLength, 'letter');
  }

  public static function getRandomLetterOptimized($argLength = 16)
  {
    return self::getRandom($argLength, 'letter-optimized');
  }

  public static function getRandomMix($argLength = 32)
  {
    return self::getRandom($argLength, 'mix');
  }

  public static function getRandomMixOptimized($argLength = 32)
  {
    return self::getRandom($argLength, 'mix-optimized');
  }

  public static function getRandomNumber($argLength = 6)
  {
    return self::getRandom($argLength, 'number');
  }

  public static function getRandomNumberOptimized($argLength = 6)
  {
    return self::getRandom($argLength, 'number-optimized');
  }
}