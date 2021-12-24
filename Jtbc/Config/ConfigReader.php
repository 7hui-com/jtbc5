<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Config;
use Jtbc\Exception\NotExistException;
use Jtbc\Exception\NotSupportedException;

class ConfigReader
{
  private $configClassName;

  public function read(string $argName, $argDefaultValue = null)
  {
    $name = $argName;
    $result = $argDefaultValue;
    $configClassName = $this -> configClassName;
    if (is_string($configClassName))
    {
      $constantName = $configClassName . '::' . strtoupper($name);
      if (defined($constantName))
      {
        $result = constant($constantName);
      }
    }
    return $result;
  }

  public function __get($argName)
  {
    return $this -> read($argName);
  }

  public function __construct(string $argConfigClassName, bool $argStrictMode = true)
  {
    $strictMode = $argStrictMode;
    $configClassName = $argConfigClassName;
    if (str_contains($configClassName, '\\'))
    {
      if (!str_starts_with($configClassName, 'Config\\'))
      {
        throw new NotSupportedException('Class "' . $configClassName . '" is not supported', 50415);
      }
    }
    else
    {
      $tempArr = array_merge(['config'], explode('\\', str_replace('/', '\\', $configClassName)));
      foreach ($tempArr as $key => $value)
      {
        $tempArr[$key] = ucfirst($value);
      }
      $configClassName = implode('\\', $tempArr);
    }
    if (!class_exists($configClassName))
    {
      if ($strictMode === true)
      {
        throw new NotExistException('Class "' . $configClassName . '" does not exist', 50404);
      }
    }
    else
    {
      $this -> configClassName = $configClassName;
    }
  }
}