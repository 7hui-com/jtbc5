<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;

class Kernel
{
  public static function getVersion()
  {
    return intval(Jtbc::take('global.root.version', 'cfg'));
  }

  public static function getVersionString()
  {
    return Converter::convertToVersionString(self::getVersion());
  }

  public static function isVersionString(string $argVersionString): bool
  {
    $result = false;
    $versionString = $argVersionString;
    if (substr_count($versionString, '.') === 3)
    {
      $result = true;
      foreach (explode('.', $versionString) as $piece)
      {
        if (!(is_numeric($piece) && strlen($piece) === 1 && strval(intval($piece)) == $piece))
        {
          $result = false;
          break;
        }
      }
    }
    return $result;
  }

  public static function isHigherVersion(string $argVersionString): bool
  {
    $result = false;
    $versionString = $argVersionString;
    if (self::isVersionString($versionString) && version_compare(self::getVersionString(), $versionString) === -1)
    {
      $result = true;
    }
    return $result;
  }

  public static function isLowerVersion(string $argVersionString): bool
  {
    $result = false;
    $versionString = $argVersionString;
    if (self::isVersionString($versionString) && version_compare(self::getVersionString(), $versionString) === 1)
    {
      $result = true;
    }
    return $result;
  }

  public static function isSameVersion(string $argVersionString): bool
  {
    $result = false;
    $versionString = $argVersionString;
    if (self::isVersionString($versionString) && version_compare(self::getVersionString(), $versionString) === 0)
    {
      $result = true;
    }
    return $result;
  }
}