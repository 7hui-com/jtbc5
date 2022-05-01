<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;

class Random
{
  public static function getNumeric28()
  {
    return date('YmdHis', time()) . sprintf("%03d", intval((microtime(true) - time()) * 1000)) . sprintf("%011d", rand(0, 100000000000));
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
        'mix' => 'abcdefghijklmnopqrstuvwxyz1234567890',
        'mix-optimized' => 'acdefghjkmnpqrstuwxy12356789',
        'number' => '1234567890',
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
}