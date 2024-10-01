<?php
namespace Jtbc;
use App\Common\Ambassador;

class Diplomat extends Ambassador {
  public function __start()
  {
    $this -> addParam('meta_title', Jtbc::take('index.title', 'lng'));
  }

  public function index()
  {
    return Jtbc::take('index.index');
  }
}