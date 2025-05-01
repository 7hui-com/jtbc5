<?php
namespace Jtbc;
use Jtbc\File\FileHelper;
use App\Console\Common\Ambassador;
use App\Console\Common\BasicSubstance;
use App\Console\Log\Logger;

class Diplomat extends Ambassador {
  public function list(Request $req)
  {
    $data = [];
    $cacheAll = $this -> di -> cache -> getAll();
    ksort($cacheAll);
    foreach ($cacheAll as $item)
    {
      $data[] = ['title' => $item['title'], 'size' => FileHelper::formatFileSize($item['size']), 'lasttime' => Date::formatTimestamp($item['last_timestamp'], 21)];
    }
    $bs = new BasicSubstance($this);
    $bs -> data -> data = $data;
    return $bs -> toJSON();
  }

  public function actionDelete(Request $req)
  {
    $code = 0;
    $message = '';
    $ss = new Substance();
    $id = strval($req -> get('id'));
    if ($this -> guard -> role -> checkPermission('delete'))
    {
      $code = 1;
      $this -> di -> cache -> remove($id);
      Logger::log($this, 'manage.log-delete', ['id' => $id]);
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

  public function actionEmpty()
  {
    $code = 0;
    $message = '';
    $ss = new Substance();
    if ($this -> guard -> role -> checkPermission('empty'))
    {
      $code = 1;
      $this -> di -> cache -> removeAll();
      Logger::log($this, 'manage.log-empty');
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

  public function actionBatch(Request $req)
  {
    $code = 0;
    $message = '';
    $ss = new Substance();
    $id = $req -> post('id');
    $type = strval($req -> post('type'));
    if (Validation::isJSON($id))
    {
      $idArr = JSON::decode($id);
      if ($type == 'delete' && is_array($idArr))
      {
        $code = 1;
        foreach ($idArr as $currentId)
        {
          $this -> di -> cache -> remove($currentId);
        }
        Logger::log($this, '::communal.log-batch', ['id' => implode(',', $idArr), 'type' => $type]);
      }
    }
    $ss -> code = $code;
    $ss -> message = $message;
    $result = $ss -> toJSON();
    return $result;
  }
}