<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;
use Jtbc\DI\DIFactory;
use Jtbc\String\StringHelper;
use Jtbc\Exception\NotCallableException;

abstract class Facade
{
  protected $di;
  protected $instance;

  public function __get($argName)
  {
    $result = null;
    $name = $argName;
    if (method_exists($this -> instance, '__get') || property_exists($this -> instance, $name))
    {
      $result = $this -> instance -> {$name};
    }
    else
    {
      throw new NotCallableException('Undefined property "' . $name . '"', 50406);
    }
    return $result;
  }

  public function __set($argName, $argValue)
  {
    $name = $argName;
    $value = $argValue;
    if (method_exists($this -> instance, '__set') || property_exists($this -> instance, $name))
    {
      $result = $this -> instance -> {$name} = $value;
    }
    else
    {
      throw new NotCallableException('Undefined property "' . $name . '"', 50406);
    }
  }

  public function __call($argName, $args) 
  {
    $result = null;
    $name = $argName;
    if (method_exists($this -> instance, '__call') || method_exists($this -> instance, $name))
    {
      $result = call_user_func([$this -> instance, $name], ...$args);
    }
    else
    {
      throw new NotCallableException('Call to undefined method "' . $name . '"', 50406);
    }
    return $result;
  }

  public function __construct(...$args)
  {
    $this -> di = DIFactory::getInstance();
    $realClass = method_exists($this, 'getRealClass')? $this -> getRealClass(): strtolower(StringHelper::getClipedString(get_class($this), '\\', 'right'));
    if (count($args) !== 0)
    {
      $this -> instance = $this -> di -> make($realClass, ...$args);
    }
    else
    {
      $this -> instance = str_contains($realClass, '\\')? $this -> di -> autoMake($realClass): $this -> di -> {$realClass};
    }
  }
}