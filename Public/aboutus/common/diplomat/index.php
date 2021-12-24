<?php
namespace Jtbc;
use Jtbc\Model\TinyModel;
use Jtbc\Template\Renderer;
use App\Common\Ambassador;
use App\Common\Widgets\Breadcrumb\BreadcrumbBuilder;

class Diplomat extends Ambassador {
  private $breadcrumbBuilder;

  public function __start()
  {
    $this -> addParam('meta_title', Jtbc::take('index.title', 'lng'));
    $this -> breadcrumbBuilder = new BreadcrumbBuilder($this -> getParam('genre'));
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
      $this -> addParam('meta_title', $rs -> title);
      $this -> setParam('breadcrumb', $this -> breadcrumbBuilder -> build());
      $renderer = new Renderer('index.detail');
      $result = $renderer -> render([$rs -> all()]);
    }
    else
    {
      $res -> setStatusCode(404);
    }
    return $result;
  }

  public function index(Response $res)
  {
    $result = null;
    $model = new TinyModel();
    $model -> where -> published = 1;
    $model -> orderBy('order', 'desc');
    $model -> limit(1);
    $rs = $model -> get();
    if (!is_null($rs))
    {
      $currentId = intval($rs -> id);
      $res -> header -> set('location', './?type=detail&id=' . $currentId);
    }
    else
    {
      $res -> setStatusCode(404);
    }
    return $result;
  }
}