<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Hook;
use Jtbc\Validation;
use Jtbc\Config\ClassicConfigManager;
use Jtbc\Exception\NotExistException;

class HookManager
{
  private $hooks;
  private $configClassName;
  private $classicConfigManager;
  private $lastErrorCode;

  private function save()
  {
    $result = false;
    $this -> classicConfigManager -> HOOKS = $this -> hooks;
    if ($this -> classicConfigManager -> save())
    {
      $result = true;
    }
    return $result;
  }

  public function getHooks()
  {
    return $this -> hooks;
  }

  public function getLastErrorCode()
  {
    return $this -> lastErrorCode;
  }

  public function exists(string $argKey)
  {
    $bool = false;
    $key = $argKey;
    if (array_key_exists($key, $this -> hooks))
    {
      $bool = true;
    }
    return $bool;
  }

  public function clean()
  {
    $result = false;
    $newHooks = [];
    $isHealthy = true;
    foreach ($this -> hooks as $key => $val)
    {
      if (is_callable($val))
      {
        $newHooks[$key] = $val;
      }
      else
      {
        $isHealthy = false;
      }
    }
    if ($isHealthy === true)
    {
      $result = true;
    }
    else
    {
      $this -> hooks = $newHooks;
      $result = $this -> save()? true: false;
    }
    return $result;
  }

  public function cancel(string $argKey)
  {
    $result = false;
    $key = $argKey;
    $this -> lastErrorCode = 0;
    if (Validation::isEmpty($key))
    {
      $this -> lastErrorCode = 2001;
    }
    else if (!$this -> exists($key))
    {
      $result = true;
      $this -> lastErrorCode = 2002;
    }
    else
    {
      unset($this -> hooks[$key]);
      if ($this -> save())
      {
        $result = true;
      }
      else
      {
        $this -> lastErrorCode = 2401;
      }
    }
    return $result;
  }

  public function register(string $argKey, string $argHandle)
  {
    $result = false;
    $key = $argKey;
    $handle = $argHandle;
    $this -> lastErrorCode = 0;
    if (Validation::isEmpty($key))
    {
      $this -> lastErrorCode = 1001;
    }
    else if ($this -> exists($key))
    {
      $this -> lastErrorCode = 1002;
    }
    else if (!is_callable($handle))
    {
      $this -> lastErrorCode = 1003;
    }
    else
    {
      $this -> hooks[$key] = $handle;
      if ($this -> save())
      {
        $result = true;
      }
      else
      {
        $this -> lastErrorCode = 1401;
      }
    }
    return $result;
  }

  public function registerIfNotExists(string $argKey, string $argHandle)
  {
    $result = false;
    $key = $argKey;
    $handle = $argHandle;
    if ($this -> exists($key))
    {
      $result = true;
    }
    else
    {
      $result = $this -> register($key, $handle);
    }
    return $result;
  }

  public function __construct(string $argConfigClassName)
  {
    $configClassName = $this -> configClassName = $argConfigClassName;
    if (!class_exists($configClassName))
    {
      throw new NotExistException('Class "' . $configClassName . '" does not exist', 50404);
    }
    else
    {
      $this -> hooks = constant($configClassName . '::HOOKS');
      $this -> classicConfigManager = new ClassicConfigManager($configClassName);
      if (!is_array($this -> hooks)) $this -> hooks = [];
    }
  }
}