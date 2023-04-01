<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;

class Encoder
{
  public static function addslashes(string $argString)
  {
    $result = $argString;
    $result = str_replace('\\', '\\\\', $result);
    $result = str_replace('\'', '\\\'', $result);
    return $result;
  }

  public static function passwordHash(string $argString)
  {
    $string = $argString;
    $result = password_hash($string, PASSWORD_BCRYPT);
    return $result;
  }

  public static function htmlEncode($argString, int $argMode = 1)
  {
    $mode = $argMode;
    $string = strval($argString);
    if (!Validation::isEmpty($string))
    {
      $specialCharCodes = [36, 39, 64, 123, 125];
      if ($mode != 0)
      {
        $string = str_replace('&', '&amp;', $string);
        $string = str_replace('>', '&gt;', $string);
        $string = str_replace('<', '&lt;', $string);
        $string = str_replace('"', '&quot;', $string);
        $string = str_replace('\'', '&apos;', $string);
      }
      foreach ($specialCharCodes as $charCode)
      {
        $string = str_replace(chr($charCode), '&#' . $charCode . ';', $string);
      }
      if ($mode == 2)
      {
        $string = str_replace(chr(13) . chr(10), chr(10), $string);
        $string = str_replace(chr(32) . chr(32), '&nbsp; ', $string);
        $string = str_replace(chr(10), '<br />', $string);
      }
    }
    return $string;
  }

  public static function saltedMD5(string $argString)
  {
    $string = $argString;
    $salt = Config::read(__CLASS__, 'salt');
    $result = is_string($salt)? md5($salt . $string): md5($string);
    return $result;
  }

  public static function unifyLineEndings(string $argString)
  {
    $string = $argString;
    $string = str_replace(chr(13) . chr(10), chr(10), $string);
    $string = str_replace(chr(10), chr(13) . chr(10), $string);
    return $string;
  }
}