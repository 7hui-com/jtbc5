<?php
namespace App\Console\Common\Traits\Action\Typical;
use Jtbc\Jtbc;
use Jtbc\JSON;
use Jtbc\Request;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\Model\TinyModel;
use App\Console\Log\Logger;

trait Order
{
  public function actionOrder(Request $req)
  {
    $code = 0;
    $message = '';
    $ss = new Substance();
    $id = strval($req -> post('id'));
    if ($this -> guard -> role -> checkPermission('order'))
    {
      if (!Validation::isEmpty($id))
      {
        $idArr = JSON::decode($id);
        if (is_array($idArr))
        {
          $code = 1;
          $idCount = count($idArr);
          $idList = implode(',', $idArr);
          foreach ($idArr as $currentId)
          {
            $model = new TinyModel();
            $model -> where -> id = intval($currentId);
            $model -> pocket -> order = $idCount;
            $model -> save();
            $idCount -= 1;
          }
          $this -> hook -> afterOrder -> trigger($id);
          Logger::log($this, ['::communal.log-order', $this -> getParam('basename') . '.log-order'], ['id' => $idList]);
        }
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