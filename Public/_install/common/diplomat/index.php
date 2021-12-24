<?php
namespace Jtbc;
use Jtbc\Template\Renderer;
use App\Common\Ambassador;

class Diplomat extends Ambassador {
  public function __start()
  {
    $this -> addParam('meta_title', Jtbc::take('index.title', 'lng'));
  }

  public function index()
  {
    $data = new Substance();
    $data -> license = file_get_contents(Path::getActualRoute('../license.txt'));
    $renderer = new Renderer('index.index');
    $result = $renderer -> render([$data -> toArray()]);
    return $result;
  }
}