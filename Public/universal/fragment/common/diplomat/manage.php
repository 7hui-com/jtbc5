<?php
namespace Jtbc;
use Jtbc\Model\TinyModel;
use Jtbc\Exception\ErrorCollector;
use App\Console\Common\BasicSubstance;
use App\Console\Common\Ambassador;
use App\Console\Common\Traits\Action;
use App\Universal\Upload\UploadedStatus;

class Diplomat extends Ambassador {
  use Action\Typical\Add {
    actionAdd as private traitActionAdd;
  }
  use Action\Typical\Edit {
    actionEdit as private traitActionEdit;
  }
  use Action\Typical\Delete;
  use Action\Typical\Batch;
  use Action\Typical\Upload;

  public function add()
  {
    $bs = new BasicSubstance($this);
    return $bs -> toJSON();
  }

  public function edit(Request $req)
  {
    $id = intval($req -> get('id'));
    $model = new TinyModel();
    $model -> where -> id = $id;
    $data = $model -> get();
    $bs = new BasicSubstance($this);
    $bs -> data -> data = $data;
    return $bs -> toJSON();
  }

  public function list(Request $req)
  {
    $page = intval($req -> get('page'));
    $published = intval($req -> get('published') ?? -1);
    $pagesize = intval(Jtbc::getConfig('pagesize'));
    $keyword = strval($req -> get('keyword'));
    $model = new TinyModel();
    $model -> pageNum = $page;
    $model -> pageSize = $pagesize;
    if ($published != -1)
    {
      $model -> where -> published = $published;
    }
    if (!Validation::isEmpty($keyword))
    {
      $model -> where(function($where) use ($keyword){
        $where -> setFuzzyLike('key', explode(' ', $keyword));
        $where -> setFuzzyLike('name', explode(' ', $keyword), 'or');
      });
    }
    $model -> orderBy('key', 'asc');
    $data = $model -> getPage(['id', 'key', 'name', 'mode', 'published', 'time']);
    foreach ($data as $item)
    {
      $item -> mode_text = Jtbc::take('sel_mode.' . $item -> mode, 'lng') ?? '';
    }
    $bs = new BasicSubstance($this);
    $bs -> data -> data = $data;
    $bs -> data -> keyword = $keyword;
    $bs -> data -> pagination = [
      'pagenum' => $model -> pagination -> pageNum,
      'pagecount' => $model -> pagination -> pageCount,
    ];
    return $bs -> toJSON();
  }

  public function actionAdd(Request $req)
  {
    $mode = intval($req -> post('mode'));
    $req -> source -> post['value'] = $req -> post('value_' . $mode);
    $this -> hook -> beforeAutoSave = function(Request $req)
    {
      $result = null;
      $key = strval($req -> post('key'));
      
      if (!Validation::isEmpty($key))
      {
        $model = new TinyModel();
        $model -> where -> key = $key;
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
      $key = strval($req -> post('key'));
      if (!Validation::isEmpty($key))
      {
        $model = new TinyModel();
        $model -> where -> key = $key;
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
    return $this -> traitActionEdit($req);
  }
}