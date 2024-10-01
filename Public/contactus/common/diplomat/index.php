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
    $this -> addParam('stylesheets', ['url' => Path::getActualRoute('feedback/') . $this -> getParam('assets_path') . '/feedback.css']);
    $this -> breadcrumbBuilder = new BreadcrumbBuilder($this -> getParam('genre'));
  }

  public function index(Response $res)
  {
    $result = null;
    $timestamp = time();
    $uniqueId = Random::getNumeric28();
    $sign = Encoder::saltedMD5($uniqueId . $timestamp);
    $lang = intval($this -> getParam('lang'));
    $model = new TinyModel();
    $model -> where -> lang = $lang;
    $model -> orderBy('id', 'desc');
    $model -> limit(1);
    $rs = $model -> get();
    if (!is_null($rs))
    {
      $this -> setParam('breadcrumb', $this -> breadcrumbBuilder -> build());
      $renderer = new Renderer('index.index', ['timestamp' => $timestamp, 'unique_id' => $uniqueId, 'sign' => $sign]);
      $result = $renderer -> render([$rs -> all()]);
    }
    else
    {
      $res -> setStatusCode(404);
    }
    return $result;
  }
}