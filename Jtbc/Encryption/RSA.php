<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Encryption;

class RSA
{
  public static function publicEncrypt(string $argData, string $argPublicKey)
  {
    $result = null;
    $data = $argData;
    $publicKey = $argPublicKey;
    if (is_file($publicKey))
    {
      $encryptData = '';
      $publicKeyContent = openssl_pkey_get_public(file_get_contents($publicKey));
      if (openssl_public_encrypt($data, $encryptData, $publicKeyContent) === true)
      {
        $result = base64_encode($encryptData);
      }
      else
      {
        $result = false;
      }
    }
    return $result;
  }

  public static function privateDecrypt(string $argData, string $argPrivateKey)
  {
    $result = null;
    $data = $argData;
    $privateKey = $argPrivateKey;
    if (is_file($privateKey))
    {
      $decryptData = '';
      $privateKeyContent = openssl_pkey_get_private(file_get_contents($privateKey));
      if (openssl_private_decrypt(base64_decode($data), $decryptData, $privateKeyContent) === true)
      {
        $result = $decryptData;
      }
      else
      {
        $result = false;
      }
    }
    return $result;
  }

  public static function privateSign(string $argData, string $argPrivateKey, string $argSignType = 'RSA')
  {
    $result = null;
    $data = $argData;
    $privateKey = $argPrivateKey;
    $signType = $argSignType;
    if (is_file($privateKey))
    {
      $sign = '';
      $algorithm = match($signType)
      {
        'RSA2' => OPENSSL_ALGO_SHA256,
        default => OPENSSL_ALGO_SHA1,
      };
      $privateKeyContent = openssl_pkey_get_private(file_get_contents($privateKey));
      if (openssl_sign($data, $sign, $privateKeyContent, $algorithm) === true)
      {
        $result = base64_encode($sign);
      }
      else
      {
        $result = false;
      }
    }
    return $result;
  }

  public static function publicVerify(string $argData, string $argSign, string $argPublicKey, string $argSignType = 'RSA')
  {
    $result = null;
    $data = $argData;
    $sign = $argSign;
    $publicKey = $argPublicKey;
    $signType = $argSignType;
    if (is_file($publicKey))
    {
      $result = false;
      $algorithm = match($signType)
      {
        'RSA2' => OPENSSL_ALGO_SHA256,
        default => OPENSSL_ALGO_SHA1,
      };
      $publicKeyContent = openssl_pkey_get_public(file_get_contents($publicKey));
      if (openssl_verify($data, base64_decode($sign), $publicKeyContent, $algorithm) === 1)
      {
        $result = true;
      }
    }
    return $result;
  }
}