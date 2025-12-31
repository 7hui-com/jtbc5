<?php
namespace Jtbc;
use Jtbc\Model\TinyModel;
use App\Console\Common\BasicSubstance;
use App\Console\Common\Ambassador;
use App\Console\Common\Traits\Action;
use App\Common\Form\SchemaGenerator;

class Diplomat extends Ambassador {
  use Action\Typical\Add;
  use Action\Typical\Edit;
  use Action\Typical\Delete;
  use Action\Typical\Batch;
  use Action\Typical\Upload;

  public function add()
  {
    $model = new TinyModel();
    $schemaGenerator = new SchemaGenerator($model -> table -> getTableInfo(), $this -> getParam('visible_uri'));
    $schemaGenerator -> setLang($this -> guard -> role -> getLang());
    if (!$this -> guard -> role -> checkPermission('publish'))
    {
      $schemaGenerator -> ignore -> published = true;
    }
    $bs = new BasicSubstance($this);
    $bs -> data -> form = $schemaGenerator -> generate('add');
    return $bs -> toJSON();
  }

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
      if (!$this -> guard -> role -> checkPermission('publish'))
      {
        $schemaGenerator -> ignore -> published = true;
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
    $published = intval($req -> get('published') ?? -1);
    $keyword = strval($req -> get('keyword'));
    $pagesize = intval(Jtbc::getConfig('pagesize'));
    $lang = $this -> guard -> role -> getLang();
    $model = new TinyModel();
    $model -> pageNum = $page;
    $model -> pageSize = $pagesize;
    $model -> where -> lang = $lang;
    if ($published != -1)
    {
      $model -> where -> published = $published;
    }
    if (!Validation::isEmpty($keyword))
    {
      $model -> where -> setFuzzyLike('title', explode(' ', $keyword));
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