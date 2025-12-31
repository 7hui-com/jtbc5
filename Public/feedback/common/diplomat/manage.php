<?php
namespace Jtbc;
use Jtbc\Model\TinyModel;
use App\Console\Common\BasicSubstance;
use App\Console\Common\Ambassador;
use App\Console\Common\Traits\Action;
use App\Common\Form\SchemaGenerator;

class Diplomat extends Ambassador {
  use Action\Typical\Edit;
  use Action\Typical\Delete;
  use Action\Typical\Batch;

  public function edit(Request $req)
  {
    $data = [];
    $status = 200;
    $form = [];
    $id = intval($req -> get('id'));
    $model = new TinyModel();
    $model -> where -> id = $id;
    $rs = $model -> get();
    if (is_null($rs))
    {
      $status = 404;
    }
    else
    {
      $data = $rs -> toArray();
      $schemaGenerator = new SchemaGenerator($model -> table -> getTableInfo(), $this -> getParam('visible_uri'));
      $schemaGenerator -> setLang($this -> guard -> role -> getLang());
      if (!$this -> guard -> role -> checkPermission('dispose'))
      {
        $schemaGenerator -> ignore -> disposed = true;
      }
      $schemaGenerator -> value = $rs;
      $form = $schemaGenerator -> generate('edit');
    }
    $bs = new BasicSubstance($this);
    $bs -> data -> data = $data;
    $bs -> data -> form = $form;
    $bs -> data -> status = $status;
    return $bs -> toJSON();
  }

  public function list(Request $req)
  {
    $page = intval($req -> get('page'));
    $disposed = intval($req -> get('disposed') ?? -1);
    $keyword = strval($req -> get('keyword'));
    $pagesize = intval(Jtbc::getConfig('pagesize'));
    $lang = $this -> guard -> role -> getLang();
    $model = new TinyModel();
    $model -> pageNum = $page;
    $model -> pageSize = $pagesize;
    $model -> where -> lang = $lang;
    if ($disposed != -1)
    {
      $model -> where -> disposed = $disposed;
    }
    if (!Validation::isEmpty($keyword))
    {
      $model -> where(function($where) use ($keyword){
        $where -> name -> like('%' . $keyword . '%');
        $where -> mobile -> or -> like('%' . $keyword . '%');
        $where -> email -> or -> like('%' . $keyword . '%');
      });
    }
    $model -> orderBy('time', 'desc');
    $bs = new BasicSubstance($this);
    $bs -> data -> data = $model -> getPage('~');
    $bs -> data -> keyword = $keyword;
    $bs -> data -> pagination = [
      'pagenum' => $model -> pagination -> pageNum,
      'pagecount' => $model -> pagination -> pageCount,
    ];
    return $bs -> toJSON();
  }
}