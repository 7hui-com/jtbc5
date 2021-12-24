<?php
namespace Jtbc;
use Jtbc\Model\TinyModel;
use App\Console\Common\EmptySubstance;
use App\Console\Common\Ambassador;

class Diplomat extends Ambassador {
  public function __initialize()
  {
    $this -> isPublic = true;
  }

  public function explorer(Request $req)
  {
    $page = intval($req -> get('page'));
    $filegroup = intval($req -> get('filegroup') ?? -1);
    $pagesize = intval(Jtbc::getConfig('pagesize'));
    $keyword = strval($req -> get('keyword'));
    $order = strval($req -> get('order'));
    $model = new TinyModel();
    $model -> pageNum = $page;
    $model -> pageSize = $pagesize;
    if ($filegroup != -1)
    {
      $model -> where -> filegroup = $filegroup;
    }
    if (!Validation::isEmpty($keyword))
    {
      $model -> where -> setFuzzyLike('filename', explode(' ', $keyword));
    }
    if ($order == 'new')
    {
      $model -> orderBy('id', 'desc');
    }
    else
    {
      $model -> orderBy('hot', 'desc');
    }
    $es = new EmptySubstance();
    $es -> data -> data = $model -> getPage();
    $es -> data -> pagination = [
      'pagenum' => $model -> pagination -> pageNum,
      'pagecount' => $model -> pagination -> pageCount,
    ];
    return $es -> toJSON();
  }

  public function actionUpdateHot(Request $req)
  {
    $code = 0;
    $ss = new Substance();
    $idList = strval($req -> get('idList'));
    if (Validation::isIntSeries($idList))
    {
      $model = new TinyModel();
      $model -> where -> id -> in($idList);
      $model -> pocket -> hot = ['increase' => 1];
      $re = $model -> save();
      if (is_numeric($re)) $code = 1;
    }
    $ss -> code = $code;
    $result = $ss -> toJSON();
    return $result;
  }
}