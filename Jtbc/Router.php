<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;
use Jtbc\DI\DIFactory;
use Jtbc\Hook\GlobalHookLoader;
use Jtbc\Exception\UnexpectedException;

abstract class Router
{
  public $di;
  protected $starttime;
  protected $donetime;
  protected $globalHookLoader;

  public function output($argBody = '')
  {
    $body = $argBody;
    $response = $this -> di -> response;
    $hookResult = $this -> di -> hook -> beforeOutput -> spark($this, $body);
    if (is_null($hookResult))
    {
      $status = $response -> getStatusCode();
      if ($status != 200 && Validation::isEmpty($body))
      {
        $response -> header -> set('Content-Type', 'text/html');
        $hookStatusCodeBody = $this -> di -> hook -> beforeOutputStatusCode -> provoke($this, $status);
        $body = is_string($hookStatusCodeBody)? $hookStatusCodeBody: Jtbc::take('universal:httpStatus.' . $status, 'tpl');
      }
    }
    else if (is_string($hookResult))
    {
      $body = $hookResult;
    }
    else
    {
      throw new UnexpectedException('Unexpected result type', 50801);
    }
    $response -> send($body);
    $this -> donetime = microtime(true);
    $this -> di -> hook -> afterOutput -> trigger($this, $body);
  }

  public function getExecutionTime()
  {
    $result = null;
    if (!is_null($this -> donetime))
    {
      $result = $this -> donetime - $this -> starttime;
    }
    return $result;
  }

  public function __construct()
  {
    $this -> starttime = microtime(true);
    $this -> di = DIFactory::getInstance();
    $this -> globalHookLoader = new GlobalHookLoader();
    $this -> globalHookLoader -> load($this -> di -> hook);
  }
}