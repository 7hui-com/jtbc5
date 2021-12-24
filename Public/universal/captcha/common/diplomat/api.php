<?php
namespace Jtbc;
use App\Universal\Captcha\Model;
use App\Universal\Captcha\CaptchaCreator;

class Diplomat extends Diplomatist {
  public $MIMEType = 'json';

  public function get()
  {
    $code = 0;
    $data = [];
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
    $captchaCreator = new CaptchaCreator($fonts);
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
      $image = 'data:image/png;base64,' . base64_encode($captchaCreator -> create());
      $data = [
        'id' => $id,
        'md5hash' => $md5hash,
        'image' => $image,
      ];
    }
    $result = new Substance();
    $result -> code = 1;
    $result -> data = $data;
    return $result -> toJSON();
  }
}