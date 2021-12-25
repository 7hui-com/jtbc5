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
    if (!$this -> guard -> role -> checkPermission('published'))
    {
      $schemaGenerator -> ignore -> published = true;
    }
    $bs = new BasicSubstance($this);
    $bs -> data -> form = $schemaGenerator -> generate('add');
    return $bs -> toJSON();
  }

  public function edit(Request $req)
  {
    $id = intval($req -> get('id'));
    $model = new TinyModel();
    $model -> where -> id = $id;
    $data = $model -> get();
    $schemaGenerator = new SchemaGenerator($model -> table -> getTableInfo(), $this -> getParam('visible_uri'));
    $schemaGenerator -> setLang($this -> guard -> role -> getLang());
    if (!$this -> guard -> role -> checkPermission('published'))
    {
      $schemaGenerator -> ignore -> published = true;
    }
    $schemaGenerator -> value = $data;
    $bs = new BasicSubstance($this);
    $bs -> data -> data = $data;
    $bs -> data -> form = $schemaGenerator -> generate('edit');
    return $bs -> toJSON();
  }

  public function list(Request $req)
  {
    $page = intval($req -> get('page'));
    $group = intval($req -> get('group') ?? -1);
    $published = intval($req -> get('published') ?? -1);
    $pagesize = intval(Jtbc::getConfig('pagesize'));
    $lang = $this -> guard -> role -> getLang();
    $model = new TinyModel();
    $model -> pageNum = $page;
    $model -> pageSize = $pagesize;
    $model -> where -> lang = $lang;
    if ($group != -1)
    {
      $model -> where -> group = $group;
    }
    if ($published != -1)
    {
      $model -> where -> published = $published;
    }
    $model -> orderBy('time', 'desc');
    $data = $model -> getPage(['id', 'title', 'group', 'published', 'time']);
    foreach ($data as $item)
    {
      $item -> group_text = Jtbc::take('sel_group.' . $item -> group, 'lng') ?? '';
    }
    $bs = new BasicSubstance($this);
    $bs -> data -> group = $group;
    $bs -> data -> data = $data;
    $bs -> data -> pagination = [
      'pagenum' => $model -> pagination -> pageNum,
      'pagecount' => $model -> pagination -> pageCount,
    ];
    return $bs -> toJSON();
  }
}