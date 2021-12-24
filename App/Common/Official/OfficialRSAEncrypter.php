<?php
namespace App\Common\Official;
use Jtbc\Path;
use Jtbc\Encryption\RSA;

class OfficialRSAEncrypter
{
  private static function getPublicKeyPath()
  {
    return Path::getActualRoute(ConfigReader::getPublicKeyPath());
  }

  public static function publicEncrypt(string $argData)
  {
    return RSA::publicEncrypt($argData, self::getPublicKeyPath());
  }

  public static function publicVerify(string $argData, string $argSign)
  {
    return RSA::publicVerify($argData, $argSign, self::getPublicKeyPath(), 'RSA2');
  }
}