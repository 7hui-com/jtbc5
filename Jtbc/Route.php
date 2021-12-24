<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;
use Jtbc\Validation;
use Jtbc\Exception\ErrorException;

class Route
{
  private $route = [];

  private function compareMethod($argMethods, $argMethod)
  {
    $bool = false;
    $methods = $argMethods;
    $method = $argMethod;
    if ($methods == 'any' || $methods == 'all') $bool = true;
    else if (is_string($methods) && strtolower($methods) == strtolower($method)) $bool = true;
    else if (is_array($methods) && in_array($method, $methods)) $bool = true;
    return $bool;
  }

  private function createRoute($argMethods, $argPattern, callable $callback)
  {
    $methods = $argMethods;
    $pattern = $argPattern;
    $param = ['methods' => $methods, 'pattern' => $pattern, 'callback' => $callback];
    $result = new class($param)
    {
      private $param;
      private $middleware;

      public function middleware(...$args)
      {
        $this -> middleware -> add(...$args);
        return $this;
      }

      public function getMethods()
      {
        return $this -> param['methods'];
      }

      public function getPattern()
      {
        return $this -> param['pattern'];
      }

      public function getResult(...$args)
      {
        $result = $this -> middleware -> run(...$args);
        return $result;
      }

      public function __construct($param)
      {
        $this -> param = $param;
        $this -> middleware = new Middleware($this -> param['callback']);
      }
    };
    return $result;
  }

  public function add($argMethods, $argPattern, callable $callback)
  {
    $result = null;
    $methods = $argMethods;
    $pattern = $argPattern;
    if (!Validation::isEmpty($methods) && !Validation::isEmpty($pattern))
    {
      $this -> route[] = $result = $this -> createRoute($methods, $pattern, $callback);
    }
    return $result;
  }

  public function handle($argMethod, $argURL)
  {
    $method = $argMethod;
    $URL = $argURL;
    $result = null;
    foreach ($this -> route as $route)
    {
      $methods = $route -> getMethods();
      $pattern = $route -> getPattern();
      if ($this -> compareMethod($methods, $method))
      {
        $pregMatch = [];
        if (preg_match($pattern, $URL, $pregMatch))
        {
          $result = [];
          $result['args'] = array_splice($pregMatch, 1);
          $result['callback'] = function(...$args) use ($route) { return $route -> getResult(...$args); };
          break;
        }
      }
    }
    return $result;
  }

  public function __call($argName, $args)
  {
    $name = $argName;
    $result = null;
    if (is_array($args) && count($args) == 2)
    {
      $result = $this -> add($name, $args[0], $args[1]);
    }
    else
    {
      throw new ErrorException('Bad parameter', 50405);
    }
    return $result;
  }
}