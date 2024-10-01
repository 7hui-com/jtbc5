<?php
namespace Jtbc;
use Jtbc\Model\TinyModel;
use Jtbc\Model\StandardModel;
use App\Common\Ambassador;

class Diplomat extends Ambassador {
  public $MIMEType = 'json';

  public function actionAdd(Request $req)
  {
    $code = 0;
    $message = null;
    $now = time();
    $source = $req -> post();
    $sign = strval($req -> get('sign'));
    $uniqueId = strval($req -> post('unique_id'));
    $timestamp = intval($req -> post('timestamp'));
    $lang = intval($this -> getParam('lang'));
    if (Encoder::saltedMD5($uniqueId . $timestamp) != $sign)
    {
      $code = 4001;
    }
    else
    {
      $model = new TinyModel();
      $model -> where -> unique_id = $uniqueId;
      $rs = $model -> get();
      if (!is_null($rs))
      {
        $code = 4011;
      }
      else
      {
        $model = new StandardModel();
        $model -> coffer -> unique_id = $uniqueId;
        $model -> coffer -> time = Date::now();
        $model -> coffer -> lang = $lang;
        $model -> coffer -> disposed = 0;
        $model -> pocket = new Substance($source);
        $autoValidate = $model -> autoValidate();
        if ($autoValidate === true)
        {
          if ($now - $timestamp < 15)
          {
            $code = 4021;
          }
          else if ($now - $timestamp > 12 * 60 * 60)
          {
            $code = 4022;
          }
          else
          {
            $re = $model -> autoSave();
            $code = is_numeric($re)? 1: 4444;
          }
        }
        else
        {
          $code = $autoValidate -> firstCode;
          $message = $autoValidate -> firstMessage;
        }
      }
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = Jtbc::take('api.text-action-add-code-' . $code, 'lng') ?? $message;
    return $ss -> toJSON();
  }
}