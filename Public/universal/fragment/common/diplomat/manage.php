<?php
namespace Jtbc;
use Jtbc\Model\TinyModel;
use Jtbc\Exception\ErrorCollector;
use App\Common\Form\FieldTextGenerator;
use App\Console\Common\BasicSubstance;
use App\Console\Common\Ambassador;
use App\Console\Common\Traits\Action;

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

  private function getFieldText(string $argName)
  {
    $result = null;
    $fieldText = FieldTextGenerator::generate($argName);
    if (is_array($fieldText) && array_key_exists('text', $fieldText))
    {
      $result = $fieldText['text'];
    }
    return $result;
  }

  public function __start()
  {
    $this -> hook -> afterDelete = function($id)
    {
      $model = new TinyModel(autoFilter: false);
      $model -> where -> id = intval($id);
      $rs = $model -> get();
      if (!is_null($rs))
      {
        $rsId = intval($rs -> id);
        $rsKey = strval($rs -> key);
        $rsDeleted = intval($rs -> deleted);
        if ($rsDeleted === 1)
        {
          $model -> pocket -> key = $rsKey . '~' . $rsId;
          $model -> submit();
        }
      };
    };
  }

  public function add()
  {
    $bs = new BasicSubstance($this);
    $bs -> data -> visibleUri = $this -> getParam('visible_uri');
    $bs -> data -> fieldGalleryText = $this -> getFieldText('gallery');
    $bs -> data -> fieldAttachmentText = $this -> getFieldText('attachment');
    $bs -> data -> fieldTableText = $this -> getFieldText('table');
    return $bs -> toJSON();
  }

  public function edit(Request $req)
  {
    $data = [];
    $status = 200;
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
    }
    $bs = new BasicSubstance($this);
    $bs -> data -> data = $data;
    $bs -> data -> status = $status;
    $bs -> data -> visibleUri = $this -> getParam('visible_uri');
    $bs -> data -> fieldGalleryText = $this -> getFieldText('gallery');
    $bs -> data -> fieldAttachmentText = $this -> getFieldText('attachment');
    $bs -> data -> fieldTableText = $this -> getFieldText('table');
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
    $data = $model -> getPage('~');
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