<?php
namespace Jtbc;
use Jtbc\Model\TinyModel;
use App\Console\Common\BasicSubstance;
use App\Console\Common\Ambassador;
use App\Console\Common\Traits\Action;
use App\Universal\Category\Category;
use App\Universal\Category\Navigation;
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
    $lang = $this -> guard -> role -> getLang();
    $category = new Category($this -> getParam('genre'), $lang);
    $schemaGenerator = new SchemaGenerator($model -> table -> getTableInfo(), $this -> getParam('visible_uri'), $lang);
    $schemaGenerator -> data -> category = $this -> guard -> role -> filterSegmentOptions($category -> getOptions(), 'category');
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
    $lang = $this -> guard -> role -> getLang();
    $category = new Category($this -> getParam('genre'), $lang);
    $schemaGenerator = new SchemaGenerator($model -> table -> getTableInfo(), $this -> getParam('visible_uri'), $lang);
    $schemaGenerator -> data -> category = $this -> guard -> role -> filterSegmentOptions($category -> getOptions(), 'category');
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
    $published = intval($req -> get('published') ?? -1);
    $currentCategory = intval($req -> get('category') ?? 0);
    $keyword = strval($req -> get('keyword'));
    $pagesize = intval(Jtbc::getConfig('pagesize'));
    $lang = $this -> guard -> role -> getLang();
    $category = new Category($this -> getParam('genre'), $lang);
    $myCategory = $this -> guard -> role -> filterSegment($category -> getAllId(), 'category');
    $myCurrentCategory = $this -> guard -> role -> filterSegment($category -> getChildIdById($currentCategory, true), 'category');
    $model = new TinyModel();
    $model -> pageNum = $page;
    $model -> pageSize = $pagesize;
    if (!empty($myCurrentCategory))
    {
      $model -> where -> category -> in($myCurrentCategory);
    }
    else
    {
      if ($this -> guard -> role -> isSuper !== true)
      {
        if (!empty($myCategory))
        {
          $model -> where -> category -> in($myCategory);
        }
      }
    }
    if ($published != -1)
    {
      $model -> where -> published = $published;
    }
    if (!Validation::isEmpty($keyword))
    {
      $model -> where -> setFuzzyLike('title', explode(' ', $keyword));
    }
    $model -> orderBy('time', 'desc');
    $data = $model -> getPage(['id', 'title', 'category', 'published', 'time']);
    foreach ($data as $key => $item)
    {
      $item -> category_title = $category -> getTitleById($item -> category);
      $data[$key] = $item;
    }
    $bs = new BasicSubstance($this);
    $bs -> data -> data = $data;
    $bs -> data -> pagination = [
      'pagenum' => $model -> pagination -> pageNum,
      'pagecount' => $model -> pagination -> pageCount,
    ];
    $bs -> data -> keyword = $keyword;
    $bs -> data -> myCategory = $myCategory;
    $bs -> data -> currentCategory = $currentCategory;
    $bs -> data -> nav = array_merge($bs -> data -> nav, Navigation::getNavById($category, $currentCategory, 'codename=' . $this -> getParam('genre') . ':manage.list'));
    return $bs -> toJSON();
  }
}