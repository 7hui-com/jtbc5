<?php
namespace App\Universal\Captcha;
use Jtbc\Encoder;

class CaptchaVerifier
{
  public static function verify(int $argId, string $argMd5hash, string $argCode)
  {
    $result = false;
    $id = $argId;
    $md5hash = $argMd5hash;
    $code = strtolower($argCode);
    if (Encoder::saltedMD5($code) == $md5hash)
    {
      $model = new Model();
      $model -> where -> id = $id;
      $model -> where -> used = 0;
      $rs = $model -> get();
      if (!is_null($rs))
      {
        $rsTimestamp = intval($rs -> timestamp);
        if (time() - $rsTimestamp < 600)
        {
          if (strtolower($rs -> code) == $code)
          {
            $result = true;
            $model -> pocket -> used = 1;
            $model -> save();
          }
        }
      }
    }
    return $result;
  }
}