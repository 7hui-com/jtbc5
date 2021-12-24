<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;
use Jtbc\Exception\UnexpectedException;

class Hook
{
  private $hooks = [];

  private function getSortedFunctionsByName($argName)
  {
    $result = null;
    $name = $argName;
    if ($this -> exists($name))
    {
      $result = [];
      $hook = $this -> hooks[$name];
      krsort($hook, SORT_NUMERIC);
      foreach ($hook as $items)
      {
        foreach ($items as $item)
        {
          $result[] = $item -> function;
        }
      }
    }
    return $result;
  }

  public function add($argName, $argContent)
  {
    $name = $argName;
    $content = $argContent;
    $item = null;
    if (is_callable($content))
    {
      $item = new Substance();
      $item -> index = 0;
      $item -> function = $content;
    }
    else
    {
      $content = is_array($content)? new Substance($content): $content;
      if ($content instanceof Substance)
      {
        if (is_int($content -> index) && is_callable($content -> function))
        {
          $item = $content;
        }
      }
    }
    if (is_null($item))
    {
      throw new UnexpectedException('Unexpected argument(s)', 50801);
    }
    else
    {
      if (!array_key_exists($name, $this -> hooks))
      {
        $this -> hooks[$name] = [$item -> index => [$item]];
      }
      else
      {
        $hook = $this -> hooks[$name];
        if (array_key_exists($item -> index, $hook))
        {
          array_unshift($this -> hooks[$name][$item -> index], $item);
        }
        else
        {
          $this -> hooks[$name][$item -> index] = [$item];
        }
      }
    }
    return $this;
  }

  public function exists($argName)
  {
    return array_key_exists($argName, $this -> hooks)? true: false;
  }

  public function remove($argName)
  {
    $bool = false;
    $name = $argName;
    if (array_key_exists($name, $this -> hooks))
    {
      unset($this -> hooks[$name]);
      $bool = true;
    }
    return $bool;
  }

  public function trigger(...$args)
  {
    $result = null;
    if (!empty($args))
    {
      $name = array_shift($args);
      if (array_key_exists($name, $this -> hooks))
      {
        $result = [];
        $hook = $this -> hooks[$name];
        $sortedFunctions = $this -> getSortedFunctionsByName($name);
        if (is_array($sortedFunctions))
        {
          foreach ($sortedFunctions as $function)
          {
            $result[] = call_user_func_array($function, $args);
          }
        }
      }
    }
    return $result;
  }

  public function spark(...$args)
  {
    $result = null;
    $triggerResult = $this -> trigger(...$args);
    if (is_array($triggerResult))
    {
      foreach ($triggerResult as $itemResult)
      {
        if (!is_null($itemResult))
        {
          $result = $itemResult;
          break;
        }
      }
    }
    return $result;
  }

  public function provoke(...$args)
  {
    $result = null;
    if (!empty($args))
    {
      $name = array_shift($args);
      if (array_key_exists($name, $this -> hooks))
      {
        $hook = $this -> hooks[$name];
        $sortedFunctions = $this -> getSortedFunctionsByName($name);
        if (is_array($sortedFunctions))
        {
          foreach ($sortedFunctions as $function)
          {
            $result = call_user_func_array($function, $args);
            if (!is_null($result)) break;
          }
        }
      }
    }
    return $result;
  }

  public function __get($argName)
  {
    $name = $argName;
    $class = new class($name, $this) {
      private $instance = null;
      private $name = null;

      public function exists()
      {
        return $this -> instance -> exists($this -> name);
      }

      public function remove()
      {
        return $this -> instance -> remove($name);
      }

      public function trigger(...$args)
      {
        array_unshift($args, $this -> name);
        return $this -> instance -> trigger(...$args);
      }

      public function spark(...$args)
      {
        array_unshift($args, $this -> name);
        return $this -> instance -> spark(...$args);
      }

      public function provoke(...$args)
      {
        array_unshift($args, $this -> name);
        return $this -> instance -> provoke(...$args);
      }

      public function __construct($argName, $argInstance)
      {
        $this -> name = $argName;
        $this -> instance = $argInstance;
      }
    };
    return $class;
  }

  public function __set($argName, $argContent)
  {
    $name = $argName;
    $content = $argContent;
    $this -> add($name, $content);
  }
}