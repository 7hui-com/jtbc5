<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Router;
use Jtbc\Route;
use Jtbc\Router;
use Jtbc\Exception\UnexpectedException;
use Config\Route as Config;

class ManualRouter extends Router
{
  public function manualRun()
  {
    $result = null;
    $hookResult = $this -> di -> hook -> beforeManualRoute -> spark($this);
    if (is_null($hookResult))
    {
      $route = new Route();
      Config::addRoute($route);
      $request = $this -> di -> request;
      $response = $this -> di -> response;
      $routeResult = $route -> handle($request -> method, $request -> getPathInfo());
      if (is_null($routeResult))
      {
        $hookResult = $this -> di -> hook -> beforeRouteLeave -> spark($this);
        if (is_null($hookResult))
        {
          $response -> setStatusCode(404);
        }
        else if (is_string($hookResult))
        {
          $result = $hookResult;
        }
        else
        {
          throw new UnexpectedException('Unexpected result type', 50801);
        }
      }
      else
      {
        $result = call_user_func($routeResult['callback'], ...$routeResult['args']);
      }
    }
    else if (is_string($hookResult))
    {
      $result = $hookResult;
    }
    else
    {
      throw new UnexpectedException('Unexpected result type', 50801);
    }
    $this -> output($result);
    $this -> di -> hook -> afterManualRoute -> trigger($this);
  }

  public static function run()
  {
    $instance = new self();
    $instance -> manualRun();
  }
}