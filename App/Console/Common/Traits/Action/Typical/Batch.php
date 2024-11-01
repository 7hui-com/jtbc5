<?php
namespace App\Console\Common\Traits\Action\Typical;
use Jtbc\Jtbc;
use Jtbc\JSON;
use Jtbc\Request;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\Model\TinyModel;
use App\Console\Log\Logger;

trait Batch
{
  public function actionBatch(Request $req)
  {
    $code = 0;
    $message = '';
    $ss = new Substance();
    $id = strval($req -> post('id'));
    $type = strval($req -> post('type'));
    if (!Validation::isEmpty($id))
    {
      $idArr = JSON::decode($id);
      if (is_array($idArr))
      {
        $idList = implode(',', $idArr);
        $batch = Jtbc::take('guide.batch', 'cfg');
        $fieldMap = [
          'delete' => 'deleted',
          'enable' => 'enabled',
          'disable' => 'disabled',
          'dispose' => 'disposed',
          'verify' => 'verified',
          'review' => 'reviewed',
          'lock' => 'locked',
          'publish' => 'published',
          'recommend' => 'recommended',
          'suspend' => 'suspended',
        ];
        if (Validation::isIntSeries($idList) && in_array($type, explode(',', $batch)) && array_key_exists($type, $fieldMap))
        {
          $model = new TinyModel();
          $model -> where -> id -> in($idList);
          if ($this -> guard -> role -> checkPermission($type))
          {
            $field = $fieldMap[$type];
            $model -> pocket -> {$field} = ['reverse' => 1];
            $re = $model -> save();
            if (is_numeric($re))
            {
              $code = 1;
              $hookName = 'afterBatch' . ucfirst($type);
              $this -> hook -> {$hookName} -> trigger($id);
              Logger::log($this, ['::communal.log-batch', $this -> getParam('basename') . '.log-batch'], ['id' => $idList, 'type' => $type]);
            }
          }
        }
      }
    }
    $ss -> code = $code;
    $ss -> message = $message;
    $result = $ss -> toJSON();
    return $result;
  }
}