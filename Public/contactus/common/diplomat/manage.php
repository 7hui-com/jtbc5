<?php
namespace Jtbc;
use Jtbc\Model\TinyModel;
use App\Console\Common\BasicSubstance;
use App\Console\Common\Ambassador;
use App\Console\Common\Traits\Action;
use App\Common\Form\SchemaGenerator;

class Diplomat extends Ambassador {
  use Action\Typical\Edit;
  use Action\Typical\Upload;

  private function getData(int $argLang)
  {
    $lang = $argLang;
    $model = new TinyModel();
    $model -> where -> lang = $lang;
    $model -> orderBy('id', 'desc');
    $model -> limit(1);
    $result = $model -> get();
    if (is_null($result))
    {
      $newModel = new TinyModel();
      $newModel -> pocket -> lang = $lang;
      $newModel -> pocket -> time = Date::now();
      $re = $newModel -> save();
      if (is_numeric($re))
      {
        $result = $this -> getData($lang);
      }
    }
    return $result;
  }

  public function edit(Request $req)
  {
    $lang = $this -> guard -> role -> getLang();
    $model = new TinyModel();
    $data = $this -> getData($lang);
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
}