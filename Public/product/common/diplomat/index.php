<?php
namespace Jtbc;
use Jtbc\Model\TinyModel;
use Jtbc\Template\Renderer;
use App\Common\Ambassador;
use App\Common\Widgets\Breadcrumb\BreadcrumbBuilder;
use App\Universal\Category\Category;
use App\Universal\Category\Navigation;

class Diplomat extends Ambassador {
  private $category;
  private $breadcrumbBuilder;

  public function __start(Request $req)
  {
    $this -> addParam('meta_title', Jtbc::take('index.title', 'lng'));
    $this -> breadcrumbBuilder = new BreadcrumbBuilder($this -> getParam('genre'));
    $this -> category = new Category($this -> getParam('genre'), $this -> getParam('lang'), 1);
    $this -> setParam('category', $this -> category);
    $this -> setParam('breadcrumb', $this -> breadcrumbBuilder -> build());
  }

  public function list(Request $req, Response $res)
  {
    $pagesize = 12;
    $page = intval($req -> get('page'));
    $category = intval($req -> get('category') ?? -1);
    $lang = intval($this -> getParam('lang'));
    $model = new TinyModel();
    $model -> pageNum = $page;
    $model -> pageSize = $pagesize;
    $model -> where -> published = 1;
    $model -> where -> lang = $lang;
    if ($category != -1)
    {
      $childId = $this -> category -> getChildIdById($category, true);
      $categorys = $this -> category -> getFatherGroupById($category, true);
      if (!empty($childId))
      {
        $model -> where -> category -> in($childId);
      }
      foreach ($categorys as $item)
      {
        $this -> addParam('meta_title', $item['title']);
      }
      $this -> breadcrumbBuilder -> batchAdd(Navigation::getBreadcrumb($this -> category, $category, '?type=list&category=#category#'));
    }
    else
    {
      $allCategoryId = $this -> category -> getAllId();
      $model -> where -> category -> in(empty($allCategoryId)? [-1]: $allCategoryId);
    }
    $this -> setParam('breadcrumb', $this -> breadcrumbBuilder -> build());
    $model -> orderBy('time', 'desc');
    $data = $model -> getPage('*');
    $variables = [
      'category' => $category,
      'pagenum' => $model -> pagination -> pageNum,
      'pagecount' => $model -> pagination -> pageCount,
    ];
    $renderer = new Renderer('index.list', $variables);
    $result = $renderer -> render($data -> toArray());
    return $result;
  }

  public function detail(Request $req, Response $res)
  {
    $result = null;
    $id = intval($req -> get('id'));
    $lang = intval($this -> getParam('lang'));
    $model = new TinyModel();
    $model -> where -> published = 1;
    $model -> where -> lang = $lang;
    $model -> where -> id = $id;
    $rs = $model -> get();
    if (!is_null($rs))
    {
      $rsTitle = strval($rs -> title);
      $rsCategory = intval($rs -> category);
      $variables = ['category' => $rsCategory];
      $this -> addParam('meta_title', $rsTitle);
      $this -> breadcrumbBuilder -> batchAdd(Navigation::getBreadcrumb($this -> category, $rsCategory, '?type=list&category=#category#'));
      $this -> setParam('breadcrumb', $this -> breadcrumbBuilder -> build());
      $renderer = new Renderer('index.detail', $variables);
      $result = $renderer -> render([$rs -> all()]);
    }
    else
    {
      $res -> setStatusCode(404);
    }
    return $result;
  }

  public function index(Request $req, Response $res)
  {
    return Jtbc::take('index.index') ?? $this -> list($req, $res);
  }
}