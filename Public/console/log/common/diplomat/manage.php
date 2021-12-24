<?php
namespace Jtbc;
use Jtbc\Model\TinyModel;
use App\Console\Common\BasicSubstance;
use App\Console\Log\Logger;
use App\Console\Common\Ambassador;
use App\Console\Common\Traits\Action;

class Diplomat extends Ambassador {
  use Action\Typical\Batch;
  use Action\Typical\Delete;

  public function list(Request $req)
  {
    $page = intval($req -> get('page'));
    $pagesize = intval(Jtbc::getConfig('pagesize'));
    $model = new TinyModel();
    $model -> pageNum = $page;
    $model -> pageSize = $pagesize;
    $model -> orderBy('id', 'desc');
    $bs = new BasicSubstance($this);
    $bs -> data -> data = $model -> getPage();
    $bs -> data -> pagination = [
      'pagenum' => $model -> pagination -> pageNum,
      'pagecount' => $model -> pagination -> pageCount,
    ];
    return $bs -> toJSON();
  }

  public function actionEmpty()
  {
    $code = 0;
    $message = '';
    $ss = new Substance();
    if ($this -> guard -> role -> checkPermission('empty'))
    {
      $model = new TinyModel();
      $re = $model -> truncate(true);
      if (is_numeric($re))
      {
        $code = 1;
        Logger::log($this, 'manage.log-empty');
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