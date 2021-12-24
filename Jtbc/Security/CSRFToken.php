<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Security;
use Jtbc\JSON;
use Jtbc\Encoder;
use Jtbc\Substance;

class CSRFToken
{
  public static function create(string $argKey)
  {
    $key = $argKey;
    $timestamp = time();
    $data = [
      'timestamp' => $timestamp,
      'sign' => Encoder::saltedMD5($timestamp . $key),
    ];
    return base64_encode(JSON::encode($data));
  }

  public static function verify(string $argKey, string $argToken)
  {
    $result = false;
    $key = $argKey;
    $token = $argToken;
    $timestamp = time();
    $data = new Substance(JSON::decode(base64_decode($token)));
    $dataSign = $data -> sign;
    $dataTimestamp = $data -> timestamp;
    if (!is_null($dataSign) && !is_null($dataTimestamp))
    {
      if (Encoder::saltedMD5($dataTimestamp . $key) == $dataSign)
      {
        if ($timestamp - $dataTimestamp < 2 * 60 * 60)
        {
          $result = true;
        }
      }
    }
    return $result;
  }
}