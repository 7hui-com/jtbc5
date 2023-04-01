<?php
namespace Jtbc;
use App\Console\Common\Envoy;
use Jtbc\Exception\UnexpectedException;

class Diplomat extends Envoy {
  public function index(Response $res)
  {
    $result = null;
    $hook = $this -> di -> hook;
    $hookResult =  $hook -> backstageStartup -> spark($this);
    if (is_null($hookResult))
    {
      $result = $hook -> backstageIndex -> provoke($this);
      if (!is_string($result))
      {
        $result = Jtbc::take('index.index');
      }
    }
    else if (is_int($hookResult))
    {
      $res -> setStatusCode($hookResult);
    }
    else if (is_string($hookResult))
    {
      $result = $hookResult;
    }
    else
    {
      throw new UnexpectedException('Unexpected result', 50801);
    }
    return $result;
  }
}