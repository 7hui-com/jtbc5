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
    $pagesize = 12;
    $page = intval($req -> get('page'));
    $lang = intval($this -> getParam('lang'));
    $model = new TinyModel();
    $model -> pageNum = $page;
    $model -> pageSize = $pagesize;
    $model -> where -> published = 1;
    $model -> where -> lang = $lang;
    $model -> orderBy('time', 'desc');
    $data = $model -> getPage('*');
    $variables = [
      'pagenum' => $model -> pagination -> pageNum,
      'pagecount' => $model -> pagination -> pageCount,
    ];
    $this -> setParam('breadcrumb', $this -> breadcrumbBuilder -> build());
    $renderer = new Renderer('index.list', $variables);
    $result = $renderer -> render($data -> toArray());
    return $result;
  }

  public function index(Request $req, Response $res)
  {
    return Jtbc::take('index.index') ?? $this -> list($req, $res);
  }
}