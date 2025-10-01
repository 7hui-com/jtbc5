<?php
namespace Jtbc;
use App\Universal\Captcha\Model;
use App\Universal\Captcha\CaptchaCreator;

class Diplomat extends Diplomatist {
  public $MIMEType = 'json';

  public function get(Request $req)
  {
    $code = 0;
    $data = [];
    $size = strtolower(strval($req -> get('size')));
    $fontSize = match($size)
    {
      's' => 18,
      'm' => 36,
      'l' => 54,
      default => 18,
    };
    $imageWidth = match($size)
    {
      's' => 118,
      'm' => 236,
      'l' => 354,
      default => 118,
    };
    $imageHeight = match($size)
    {
      's' => 28,
      'm' => 56,
      'l' => 84,
      default => 28,
    };
    $fonts = [];
    $ttfs = [
      '1' => 'Righteous-Regular.ttf',
      '2' => 'PatuaOne-Regular.ttf',
      '3' => 'DaysOne-Regular.ttf',
      '4' => 'BlackOpsOne-Regular.ttf',
      '5' => 'FredokaOne-Regular.ttf',
    ];
    foreach ($ttfs as $key => $val)
    {
      $fonts[] = realpath('common/assets/font/' . $key . '/' . $val);
    }
    $captchaCreator = new CaptchaCreator($fonts, $fontSize);
    $captcha = $captchaCreator -> getCode();
    $model = new Model();
    $model -> pocket -> code = $captcha;
    $model -> pocket -> timestamp = time();
    $re =  $model -> save();
    if (is_numeric($re))
    {
      $code = 1;
      $id = intval($model -> lastInsertId);
      $md5hash = Encoder::saltedMD5(strtolower($captcha));
      $image = 'data:image/png;base64,' . base64_encode($captchaCreator -> create($imageWidth, $imageHeight));
      $data = [
        'id' => $id,
        'md5hash' => $md5hash,
        'image' => $image,
      ];
    }
    $result = new Substance();
    $result -> code = $code;
    $result -> data = $data;
    return $result -> toJSON();
  }
}