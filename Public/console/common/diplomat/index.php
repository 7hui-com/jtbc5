<?php
namespace Jtbc;
use App\Console\Common\Envoy;

class Diplomat extends Envoy {
  public function index()
  {
    return Jtbc::take('index.index');
  }
}