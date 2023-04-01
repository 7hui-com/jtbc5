<?php
namespace Jtbc;
use Jtbc\Model\TinyModel;
use Jtbc\Exception\ErrorCollector;
use App\Console\Common\BasicSubstance;
use App\Console\Common\Ambassador;
use App\Console\Common\Traits\Action;
use App\Universal\Dictionary\Dictionary;

class Diplomat extends Ambassador {
  use Action\Typical\Add {
    actionAdd as private traitActionAdd;
  }
  use Action\Typical\Edit {
    actionEdit as private traitActionEdit;
  }
  use Action\Typical\Batch;
  use Action\Typical\Delete;

  private function getFieldContentAttr(int $argMode = 0)
  {
    $mode = $argMode;
    $contentColumns = [];
    $contentText = new Substance();
    $contentText -> add = Jtbc::take('universal:config.add', 'lng');
    $contentText -> remove = Jtbc::take('universal:config.delete', 'lng');
    $contentText -> removeTips = Jtbc::take('universal:phrases.are-you-sure-to-remove', 'lng');
    $contentText -> emptyTips = Jtbc::take('manage.text-tips-add-content-null', 'lng');
    $contentColumns[] = match($mode) {
      1 => ['name' => 'key', 'type' => 'number', 'text' => Jtbc::take('universal:config.key', 'lng'), 'extra' => ['width' => '100%']],
      default => ['name' => 'key', 'type' => 'text', 'text' => Jtbc::take('universal:config.key', 'lng')],
    };
    $allLang = Jtbc::take('::sel_lang.*', 'lng');
    foreach ($allLang as $key => $val)
    {
      $contentColumns[] = ['name' => 'value_' . $key, 'type' => 'text', 'text' => Jtbc::take('universal:config.value', 'lng') . ' (' . $val . ')'];
    }
    return ['text' => JSON::encode($contentText -> all()), 'columns' => JSON::encode($contentColumns)];
  }

  public function add(Request $req)
  {
    $mode = intval($req -> get('mode'));
    $bs = new BasicSubstance($this);
    $bs -> data -> mode = min(1, max($mode, 0));
    $bs -> data -> content = $this -> getFieldContentAttr($mode);
    return $bs -> toJSON();
  }

  public function edit(Request $req)
  {
    $data = [];
    $status = 200;
    $mode = 0;
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
      $mode = intval($rs -> mode);
    }
    $bs = new BasicSubstance($this);
    $bs -> data -> data = $data;
    $bs -> data -> status = $status;
    $bs -> data -> content = $this -> getFieldContentAttr($mode);
    return $bs -> toJSON();
  }

  public function list(Request $req)
  {
    $page = intval($req -> get('page'));
    $pagesize = intval(Jtbc::getConfig('pagesize'));
    $keyword = strval($req -> get('keyword'));
    $model = new TinyModel();
    $model -> pageNum = $page;
    $model -> pageSize = $pagesize;
    if (!Validation::isEmpty($keyword))
    {
      $model -> where -> setFuzzyLike('name', explode(' ', $keyword));
    }
    $model -> orderBy('name', 'asc');
    $bs = new BasicSubstance($this);
    $bs -> data -> data = $model -> getPage();
    $bs -> data -> keyword = $keyword;
    $bs -> data -> pagination = [
      'pagenum' => $model -> pagination -> pageNum,
      'pagecount' => $model -> pagination -> pageCount,
    ];
    return $bs -> toJSON();
  }

  public function actionAdd(Request $req)
  {
    $this -> hook -> beforeAutoSave = function(Request $req)
    {
      $result = null;
      $name = strval($req -> post('name'));
      if (!Validation::isEmpty($name))
      {
        $model = new TinyModel();
        $model -> where -> name = $name;
        $rs = $model -> get();
        if (!is_null($rs))
        {
          $result = new ErrorCollector();
          $result -> collect(['code' => 4001, 'message' => Jtbc::take('manage.text-code-4001', 'lng')]);
        }
      }
      return $result;
    };
    return $this -> traitActionAdd($req);
  }

  public function actionEdit(Request $req)
  {
    $this -> hook -> beforeAutoSave = function(Request $req)
    {
      $result = null;
      $id = intval($req -> get('id'));
      $name = strval($req -> post('name'));
      if (!Validation::isEmpty($name))
      {
        $model = new TinyModel();
        $model -> where -> name = $name;
        $rs = $model -> get();
        if (!is_null($rs))
        {
          if ($rs -> id != $id)
          {
            $result = new ErrorCollector();
            $result -> collect(['code' => 4001, 'message' => Jtbc::take('manage.text-code-4001', 'lng')]);
          }
        }
      }
      return $result;
    };
    $this -> hook -> afterAutoSave = function($argId)
    {
      $id = intval($argId);
      $model = new TinyModel();
      $model -> where -> id = $id;
      $rs = $model -> get();
      if (!is_null($rs))
      {
        Dictionary::refresh($rs -> name);
      }
    };
    return $this -> traitActionEdit($req);
  }
}