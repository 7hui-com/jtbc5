<?php
namespace App\Console\Common\Traits\Action\Typical;
use Jtbc\Jtbc;
use Jtbc\Request;
use Jtbc\Substance;
use Jtbc\Model\TinyModel;
use App\Console\Log\Logger;

trait Delete
{
  public function actionDelete(Request $req)
  {
    $code = 0;
    $message = '';
    $ss = new Substance();
    $id = intval($req -> get('id'));
    if ($this -> guard -> role -> checkPermission('delete'))
    {
      $model = new TinyModel();
      $model -> where -> id = $id;
      $model -> pocket -> deleted = 1;
      $re = $model -> save();
      if (is_numeric($re))
      {
        $code = 1;
        $this -> hook -> afterDelete -> trigger($id);
        Logger::log($this, ['::communal.log-delete', $this -> getParam('basename') . '.log-delete'], ['id' => $id]);
      }
    }
    else
    {
      $code = 4403;
      $message = Jtbc::take('::communal.text-tips-error-4403', 'lng');
    }
    $ss -> code = $code;
    $ss -> message = $message;
    $result = $ss -> toJSON();
    return $result;
  }
}