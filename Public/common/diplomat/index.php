<?php
namespace Jtbc;
use App\Common\Ambassador;

class Diplomat extends Ambassador {
  public function __start()
  {
    $this -> addParam('stylesheets', ['url' => $this -> getParam('root_assets_path') . '/package/css/home.css']);
  }

  public function index()
  {
    return Jtbc::take('index.index');
  }
}