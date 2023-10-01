<?php
namespace Jtbc;
use Jtbc\Model\TinyModel;
use Jtbc\Template\Renderer;
use App\Common\Ambassador;
use App\Common\Widgets\Breadcrumb\BreadcrumbBuilder;

class Diplomat extends Ambassador {
  private $breadcrumbBuilder;

  public function __start(Request $req)
  {
    $this -> addParam('meta_title', Jtbc::take('index.title', 'lng'));
    $this -> breadcrumbBuilder = new BreadcrumbBuilder($this -> getParam('genre'));
  }

  public function list(Request $req, Response $res)
  {
    $lang = intval($this -> getParam('lang'));
    $model = new TinyModel();
    $model -> where -> published = 1;
    $model -> where -> lang = $lang;
    $model -> orderBy('order', 'desc');
    $model -> orderBy('id', 'asc');
    $data = $model -> getAll('*');
    $this -> setParam('breadcrumb', $this -> breadcrumbBuilder -> build());
    $renderer = new Renderer('index.list');
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
      $this -> addParam('meta_title', $rsTitle);
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

  public function index(Request $req, Response $res)
  {
    return Jtbc::take('index.index') ?? $this -> list($req, $res);
  }
}