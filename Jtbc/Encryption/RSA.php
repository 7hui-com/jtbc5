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
      openssl_public_encrypt($data, $encryptData, $publicKeyContent);
      $result = base64_encode($encryptData);
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
      openssl_private_decrypt(base64_decode($data), $decryptData, $privateKeyContent);
      $result = $decryptData;
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
      $privateKeyContent = openssl_pkey_get_private(file_get_contents($privateKey));
      if ($signType == 'RSA2')
      {
        openssl_sign($data, $sign, $privateKeyContent, OPENSSL_ALGO_SHA256);
      }
      else
      {
        openssl_sign($data, $sign, $privateKeyContent);
      }
      $result = base64_encode($sign);
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
      $publicKeyContent = openssl_pkey_get_public(file_get_contents($publicKey));
      $result = $signType == 'RSA2'? openssl_verify($data, base64_decode($sign), $publicKeyContent, OPENSSL_ALGO_SHA256): openssl_verify($data, base64_decode($sign), $publicKeyContent);
    }
    return $result;
  }
}