<?php
namespace Jtbc;
use Jtbc\Model\TinyModel;
use Jtbc\Model\StandardModel;
use Jtbc\Module\ModuleFinder;
use App\Console\Common\EmptySubstance;
use App\Console\Common\BasicSubstance;
use App\Console\Common\Ambassador;
use App\Console\Common\Traits\Action;
use App\Console\Log\Logger;
use App\Universal\Category\Guide;
use App\Universal\Category\Category;

class Diplomat extends Ambassador {
  use Action\Typical\Batch;
  use Action\Typical\Delete;
  use Action\Typical\Order;

  private function getPolicies(string $argBaseFolder = '')
  {
    $result = [];
    $baseFolder = $argBaseFolder;
    $moduleFinder = new ModuleFinder();
    $hasCategoryModuleFinder = new ModuleFinder('category');
    $folders = $moduleFinder -> getModules();
    $hasCategoryFolders = $hasCategoryModuleFinder -> getModules();
    foreach ($folders as $folder)
    {
      $canBeGuide = true;
      $currentFolder = $folder;
      if (!Validation::isEmpty($baseFolder))
      {
        if (strpos($folder, $baseFolder) === 0)
        {
          $currentFolder = substr($folder, strlen($baseFolder));
        }
        else
        {
          $canBeGuide = false;
        }
      }
      if ($canBeGuide == true && strpos($currentFolder, '/') === false)
      {
        $sub = [];
        $hasCategory = false;
        if (in_array($folder, $hasCategoryFolders))
        {
          $hasCategory = Guide::isValidGenre($folder);
        }
        $guideLink = Jtbc::take('global.' . $folder . ':guide.link', 'cfg');
        $guideTitle = Jtbc::take('global.' . $folder . ':guide.title', 'cfg');
        if (!is_null($guideLink))
        {
          $subPermissions = Jtbc::take('global.' . $folder . ':guide.subpermissions', 'cfg');
          if (!Validation::isEmpty($subPermissions))
          {
            $subPermissionsArr = explode(',', $subPermissions);
            foreach ($subPermissionsArr as $item)
            {
              $sub[] = ['title' => Jtbc::take('::sel_subpermission.' . $item, 'lng'), 'name' => $item];
            }
          }
          $result[] = ['title' => $guideTitle, 'genre' => $folder, 'hasCategory' => $hasCategory, 'sub' => $sub, 'children' => $this -> getPolicies($baseFolder . $currentFolder . '/')];
        }
      }
    }
    return $result;
  }

  public function add()
  {
    $bs = new BasicSubstance($this);
    $bs -> data -> policies = $this -> getPolicies();
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
    $bs -> data -> policies = $this -> getPolicies();
    return $bs -> toJSON();
  }

  public function list()
  {
    $model = new TinyModel();
    $model -> orderBy('order', 'desc');
    $model -> orderBy('id', 'asc');
    $bs = new BasicSubstance($this);
    $bs -> data -> data = $model -> getAll('~');
    return $bs -> toJSON();
  }

  public function selectCategory(Request $req)
  {
    $lang = [];
    $category = [];
    $genre = strval($req -> get('genre'));
    $allLang = Jtbc::take('::sel_lang.*', 'lng');
    foreach ($allLang as $key => $val)
    {
      $currentCategory = [];
      $lang[] = ['text' => $val, 'value' => $key];
      if (Guide::isValidGenre($genre))
      {
        $cat = new Category($genre, $key);
        $currentCategory = ['category' => $cat -> getTree(), 'value' => $key];
      }
      $category[] = $currentCategory;
    }
    $es = new EmptySubstance();
    $es -> data -> lang = $lang;
    $es -> data -> genre = $genre;
    $es -> data -> category = $category;
    return $es -> toJSON();
  }

  public function actionAdd(Request $req)
  {
    $code = 0;
    $message = '';
    $ss = new Substance();
    $source = $req -> post();
    if ($this -> guard -> role -> checkPermission('add'))
    {
      $model = new StandardModel();
      $model -> pocket = new Substance($source);
      $autoValidate = $model -> autoValidate();
      if ($autoValidate === true)
      {
        $re = $model -> autoSave();
        if (is_numeric($re))
        {
          $code = 1;
          $id = $model -> lastInsertId;
          Logger::log($this, '::communal.log-add', ['id' => $id]);
        }
      }
      else
      {
        $code = $autoValidate -> firstCode;
        $message = $autoValidate -> firstMessage;
        $ss -> errorTips = $autoValidate -> error;
      }
    }
    else
    {
      $code = 4403;
      $message = Jtbc::take('::communal.text-tips-error-4403', 'lng');
    }
    $ss -> code = $code;
    $ss -> message = Jtbc::take($this -> getParam('basename') . '.text-add-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }

  public function actionEdit(Request $req)
  {
    $code = 0;
    $message = '';
    $ss = new Substance();
    $id = intval($req -> get('id'));
    $source = $req -> post();
    if ($this -> guard -> role -> checkPermission('edit'))
    {
      $model = new StandardModel();
      $model -> where -> id = $id;
      $model -> pocket = new Substance($source);
      $autoValidate = $model -> autoValidate();
      if ($autoValidate === true)
      {
        $re = $model -> autoSave();
        if (is_numeric($re))
        {
          $code = 1;
          $message = Jtbc::take('::communal.save-done', 'lng');
          Logger::log($this, '::communal.log-edit', ['id' => $id]);
        }
      }
      else
      {
        $code = $autoValidate -> firstCode;
        $message = $autoValidate -> firstMessage;
        $ss -> errorTips = $autoValidate -> error;
      }
    }
    else
    {
      $code = 4403;
      $message = Jtbc::take('::communal.text-tips-error-4403', 'lng');
    }
    $ss -> code = $code;
    $ss -> message = Jtbc::take($this -> getParam('basename') . '.text-edit-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }
}