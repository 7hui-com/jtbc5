<?php
namespace Jtbc;
use Jtbc\Model\TinyModel;

class Diplomat extends Diplomatist {
  public $MIMEType = 'json';

  public function detail(Request $req)
  {
    $code = 0;
    $data = [];
    $key = strval($req -> get('key'));
    $lang = intval($this -> getParam('lang'));
    if (!Validation::isEmpty($key))
    {
      $code = 1;
      $model = new TinyModel();
      $model -> where -> published = 1;
      $model -> where -> lang = $lang;
      $model -> where -> key -> in(explode(',', $key));
      $model -> orderBy('key', 'asc');
      $model -> limit(100);
      $rsa = $model -> getAll();
      foreach ($rsa as $rs)
      {
        $rsKey = strval($rs -> key);
        $data[$rsKey] = [
          'name' => strval($rs -> name),
          'mode' => intval($rs -> mode),
          'value' => strval($rs -> value),
          'time' => strval($rs -> time),
        ];
      }
    }
    $result = new Substance();
    $result -> code = $code;
    $result -> data = $data;
    return $result -> toJSON();
  }
}