<?php
namespace Jtbc;
use Jtbc\Model\TinyModel;
use Jtbc\Module\ModuleFinder;
use App\Console\Common\EmptySubstance;
use App\Console\Common\BasicSubstance;
use App\Console\Common\Ambassador;
use App\Console\Common\Traits\Action;
use App\Universal\Category\Guide;
use App\Universal\Category\Category;

class Diplomat extends Ambassador {
  use Action\Typical\Add;
  use Action\Typical\Edit;
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
        if (in_array($folder, $hasCategoryFolders)) $hasCategory = true;
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
    $id = intval($req -> get('id'));
    $model = new TinyModel();
    $model -> where -> id = $id;
    $bs = new BasicSubstance($this);
    $bs -> data -> data = $model -> get();
    $bs -> data -> policies = $this -> getPolicies();
    return $bs -> toJSON();
  }

  public function list()
  {
    $model = new TinyModel();
    $model -> orderBy('order', 'desc');
    $bs = new BasicSubstance($this);
    $bs -> data -> data = $model -> getAll(['id', 'title', 'time']);
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
}