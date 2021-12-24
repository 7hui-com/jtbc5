<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;

class Middleware
{
  private $pocket = [];
  private $callback = null;

  public function add(...$args)
  {
    $middleware = [];
    $callable = array_shift($args);
    $middleware['callable'] = $callable;
    $middleware['args'] = $args;
    $this -> pocket[] = $middleware;
    return $this;
  }

  public function run(...$args)
  {
    $pocket = $this -> pocket;
    $handler = $this -> callback;
    foreach (array_reverse($pocket) as $middleware) 
    {
      $middlewareCallable = $middleware['callable'];
      $middlewareArgs = array_merge($middleware['args'], $args);
      $handler = call_user_func($middlewareCallable, $handler, ...$middlewareArgs);
    }
    $result = call_user_func($handler, ...$args);
    return $result;
  }

  public function __construct(callable $callback)
  {
    $this -> callback = $callback;
  }
}