<?php
namespace App\Console\Common\Traits\Type\Typical;
use Jtbc\JSON;
use Jtbc\Request;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\Model\TinyModel;

trait Explorer
{
  public function explorer(Request $req)
  {
    $code = 1;
    $dataResult = [];
    $hasSelected = false;
    $keyword = strval($req -> get('keyword'));
    $selected = strval($req -> get('selected'));
    $model = new TinyModel();
    $model -> where -> lang = $this -> guard -> role -> getLang();
    $model -> where -> title -> like('%' . $keyword . '%');
    if (Validation::isJSON($selected))
    {
      $selectedArr = JSON::decode($selected);
      if (Validation::isIntSeries(implode(',', $selectedArr)))
      {
        $hasSelected = true;
        $model -> where -> id -> in($selectedArr);
      }
    }
    $model -> orderBy('id', 'desc');
    if ($hasSelected != true)
    {
      $model -> limit(10);
    }
    $rsa = $model -> getAll();
    foreach ($rsa as $rs)
    {
      $dataResult[] = ['id' => strval(intval($rs -> id)), 'title' => strval($rs -> title)];
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> data = ['result' => $dataResult];
    $result = $ss -> toJSON();
    return $result;
  }
}