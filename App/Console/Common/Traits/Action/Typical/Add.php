<?php
namespace App\Console\Common\Traits\Action\Typical;
use Jtbc\Jtbc;
use Jtbc\Request;
use Jtbc\Substance;
use Jtbc\Model\TinyModel;
use Jtbc\Model\StandardModel;
use Jtbc\Exception\ErrorException;
use Jtbc\Exception\ErrorCollector;
use App\Console\Log\Logger;
use App\Universal\Upload\UploadedStatus;

trait Add
{
  public function actionAdd(Request $req)
  {
    $code = 0;
    $message = '';
    $ss = new Substance();
    $source = $req -> post();
    if ($this -> guard -> role -> checkPermission('add'))
    {
      $model = new StandardModel();
      $model -> pocket = new Substance($source);
      if ($model -> table -> hasField('lang'))
      {
        $model -> pocket -> lang = $this -> guard -> role -> getLang();
      }
      if ($model -> table -> hasField('published'))
      {
        if (!$this -> guard -> role -> checkPermission('published'))
        {
          $model -> pocket -> published = 0;
        }
      }
      $autoValidate = $model -> autoValidate();
      if ($autoValidate === true)
      {
        $hookResult = $this -> hook -> beforeAutoSave -> spark($req, 'add');
        if (is_null($hookResult))
        {
          $re = $model -> autoSave();
          if (is_numeric($re))
          {
            $code = 1;
            $id = $model -> lastInsertId;
            $this -> hook -> afterAutoSave -> trigger($id, 'add');
            Logger::log($this, '::communal.log-add', ['id' => $id]);
            UploadedStatus::autoUpdate(new TinyModel(), $this -> getParam('genre'), $id);
          }
        }
        else
        {
          if ($hookResult instanceof ErrorCollector)
          {
            $code = $hookResult -> firstCode;
            $message = $hookResult -> firstMessage;
            $ss -> errorTips = $hookResult -> error;
          }
          else
          {
            throw new ErrorException('Return value must be an instanceof of ErrorCollector', 50405);
          }
        }
      }
      else
      {
        $code = $autoValidate -> firstCode;
        $message = $autoValidate -> firstMessage;
        $ss -> errorTips = $autoValidate -> error;
      }
    }
    else
    {
      $code = 4403;
      $message = Jtbc::take('::communal.text-tips-error-4403', 'lng');
    }
    $ss -> code = $code;
    $ss -> message = Jtbc::take($this -> getParam('basename') . '.text-add-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }
}