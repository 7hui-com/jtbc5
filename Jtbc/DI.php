<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;
use ReflectionClass;
use ReflectionMethod;
use Jtbc\Service\AutoProvider;
use Jtbc\Exception\NotExistException;
use Jtbc\Exception\NotCallableException;

class DI
{
  private $alias = [];
  private $container = [];

  private function getClassByName($argName)
  {
    $result = null;
    $name = $argName;
    if (is_string($name) && !str_contains($name, '\\'))
    {
      if (array_key_exists($name, $this -> alias))
      {
        $result = $this -> alias[$name]['class'];
      }
      else
      {
        $autoClass = AutoProvider::getClass($name);
        if (!is_null($autoClass))
        {
          $this -> bind($name, $autoClass, true);
        }
        $result = $autoClass;
      }
    }
    return $result;
  }

  public function make(...$args)
  {
    $instance = null;
    if (is_array($args))
    {
      $name = array_shift($args);
      $class = $this -> getClassByName($name);
      if (is_null($class))
      {
        throw new NotExistException('Could not find class by "' . $name . '"', 50404);
      }
      else if (class_exists($class))
      {
        $tempInstance = new $class(...$args);
        $instance = $tempInstance instanceof Service? $tempInstance -> getInstance(): $tempInstance;
      }
      else
      {
        throw new NotExistException('Class "' . $class . '" does not exist', 50404);
      }
    }
    return $instance;
  }

  public function autoMake($argName)
  {
    $instance = null;
    $name = $argName;
    $class = $this -> getClassByName($name);
    if (is_null($class))
    {
      throw new NotExistException('Could not find class by "' . $name . '"', 50404);
    }
    else if (class_exists($class))
    {
      $injectParameters = $this -> inject($class);
      $tempInstance = is_null($injectParameters)? new $class(): new $class(...$injectParameters);
      $instance = $tempInstance instanceof Service? $tempInstance -> getInstance(): $tempInstance;
    }
    else
    {
      throw new NotExistException('Class "' . $class . '" does not exist', 50404);
    }
    return $instance;
  }

  public function bind(...$args)
  {
    $name = array_shift($args);
    $this -> alias[$name] = match(count($args)){
      1 => ['class' => $args[0], 'isSingletonMode' => false],
      2 => ['class' => $args[0], 'isSingletonMode' => $args[1]],
    };
  }

  public function inject($argClass, $argMethod = null)
  {
    $result = null;
    $class = $argClass;
    $method = $argMethod;
    $reflectionMethod = null;
    if (is_null($method))
    {
      if (class_exists($class))
      {
        $reflectionClass = new ReflectionClass($class);
        $reflectionMethod = $reflectionClass -> getConstructor();
      }
    }
    else if (method_exists($class, $method))
    {
      $reflectionMethod = new ReflectionMethod($class, $method);
    }
    if (!is_null($reflectionMethod))
    {
      $result = [];
      $parameters = $reflectionMethod -> getParameters();
      if (!empty($parameters))
      {
        foreach ($parameters as $parameter)
        {
          $injectValue = null;
          $defaultValue = null;
          if ($parameter -> isDefaultValueAvailable())
          {
            $defaultValue = $parameter -> getDefaultValue();
          }
          $parameterName = $parameter -> getName();
          $parameterType = $parameter -> getType();
          $parameterRequestValue = $this -> request -> get($parameterName) ?? $defaultValue;
          if (is_null($parameterType)) $injectValue = $parameterRequestValue;
          else
          {
            $parameterTypeName = $parameterType -> getName();
            $parameterTypeNameArray = explode('\\', $parameterTypeName);
            $parameterTypeAbbrName = strtolower(array_pop($parameterTypeNameArray));
            if ($parameterTypeName == 'string')
            {
              $injectValue = strval($parameterRequestValue);
            }
            else if ($parameterTypeName == 'int')
            {
              $injectValue = intval($parameterRequestValue);
            }
            else
            {
              $injectValue = $this -> {$parameterTypeAbbrName};
            }
          }
          array_push($result, $injectValue);
        }
      }
    }
    return $result;
  }

  public function call($argClass, $argMethod, $argThrowException = true)
  {
    $result = null;
    $class = $argClass;
    $method = $argMethod;
    $throwException = $argThrowException;
    if (method_exists($class, $method) && is_callable([$class, $method]))
    {
      $injectParameters = $this -> inject($class, $method);
      $callParameters = [[$class, $method]];
      if (is_array($injectParameters))
      {
        $callParameters = array_merge($callParameters, $injectParameters);
      }
      $result = call_user_func(...$callParameters);
    }
    else
    {
      if ($throwException == true)
      {
        throw new NotCallableException('Not callable', 50406);
      }
    }
    return $result;
  }

  public function __set($argName, $argDefinition)
  {
    $name = $argName;
    $definition = $argDefinition;
    $name = strtolower($name);
    $this -> container[$name] = $definition;
  }

  public function __get($argName)
  {
    $name = $argName;
    $definition = null;
    $name = strtolower($name);
    if ($name == 'di')
    {
      $definition = $this;
    }
    else if (array_key_exists($name, $this -> container))
    {
      $definition = $this -> container[$name];
    }
    else
    {
      $definition = $this -> autoMake($name);
      if ($this -> alias[$name]['isSingletonMode'] === true)
      {
        $this -> container[$name] = $definition;
      }
    }
    return $definition;
  }
}