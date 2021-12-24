<?php
namespace App\Console\Common\Traits\Action\Typical;
use Jtbc\Jtbc;
use Jtbc\Request;
use Jtbc\Substance;
use App\Console\Log\Logger;
use App\Universal\Upload\chunkFile;
use App\Universal\Upload\UploaderFactory;

trait Upload
{
  public function actionUpload(Request $req)
  {
    $code = 0;
    $param = '';
    $message = '';
    $ss = new Substance();
    if ($this -> guard -> role -> checkPermission('add') || $this -> guard -> role -> checkPermission('edit'))
    {
      $scene = $req -> get('scene');
      $chunkFile = new chunkFile($req);
      $uploader = UploaderFactory::getInstance($this -> di, $this -> getParam('genre'));
      if (is_string($scene)) $uploader -> scene = $scene;
      $uploadFile = $uploader -> uploadFile($chunkFile);
      if (!is_null($uploadFile))
      {
        $code = $uploadFile -> code;
        $vars = $uploadFile -> vars;
        $param = $uploadFile -> param;
        $message = Jtbc::take('::communal.text-upload-code-' . $code, 'lng', false, $vars) ?? Jtbc::take('::communal.text-upload-code-others', 'lng');
      }
    }
    else
    {
      $code = 4403;
      $message = Jtbc::take('::communal.text-tips-error-4403', 'lng');
    }
    $ss -> code = $code;
    $ss -> message = $message;
    $ss -> param = $param;
    $result = $ss -> toJSON();
    return $result;
  }
}