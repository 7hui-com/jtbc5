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

trait Edit
{
  public function actionEdit(Request $req)
  {
    $code = 0;
    $message = '';
    $ss = new Substance();
    $id = intval($req -> get('id'));
    $source = $req -> post();
    if ($this -> guard -> role -> checkPermission('edit'))
    {
      $model = new StandardModel();
      $model -> where -> id = $id;
      $model -> pocket = new Substance($source);
      if ($model -> table -> hasField('published'))
      {
        if (!$this -> guard -> role -> checkPermission('publish'))
        {
          $model -> pocket -> published = 0;
        }
      }
      $autoValidate = $model -> autoValidate();
      if ($autoValidate === true)
      {
        $hookResult = $this -> hook -> beforeAutoSave -> spark($req, 'edit');
        if (is_null($hookResult))
        {
          $re = $model -> autoSave();
          if (is_numeric($re))
          {
            $code = 1;
            $message = Jtbc::take('::communal.save-done', 'lng');
            $this -> hook -> afterAutoSave -> trigger($id, 'edit');
            Logger::log($this, '::communal.log-edit', ['id' => $id]);
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
    $ss -> message = Jtbc::take($this -> getParam('basename') . '.text-edit-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }
}