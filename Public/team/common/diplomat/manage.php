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
  use Action\Typical\Order;
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
    $isFiltered = false;
    $published = intval($req -> get('published') ?? -1);
    $lang = $this -> guard -> role -> getLang();
    $model = new TinyModel();
    $model -> where -> lang = $lang;
    if ($published != -1)
    {
      $isFiltered = true;
      $model -> where -> published = $published;
    }
    $model -> orderBy('order', 'desc');
    $model -> orderBy('id', 'asc');
    $bs = new BasicSubstance($this);
    $bs -> data -> isFiltered = $isFiltered;
    $bs -> data -> data = $model -> getAll('~');
    return $bs -> toJSON();
  }
}