<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Config;
use ReflectionClass;
use Jtbc\Path;
use Jtbc\Encoder;
use Jtbc\Validation;
use Jtbc\String\StringHelper;
use Jtbc\Exception\NotExistException;
use Jtbc\Exception\NotSupportedException;
use Jtbc\Exception\UnexpectedException;

class ClassicConfigManager
{
  private $constants;
  private $configClassName;
  private $reflectionClass;
  private $createIfNotExists;

  private function isClassic()
  {
    $result = true;
    if (!is_null($this -> reflectionClass -> getConstructor()))
    {
      $result = false;
    }
    else if (count($this -> reflectionClass -> getMethods()) !== 0)
    {
      $result = false;
    }
    else if (count($this -> reflectionClass -> getProperties()) !== 0)
    {
      $result = false;
    }
    return $result;
  }

  private function loadConstants()
  {
    $this -> constants = $this -> reflectionClass -> getConstants();
  }

  private function getFullConfigPath()
  {
    return Path::getActualRoute('../' . str_replace('\\', '/', $this -> configClassName) . '.php');
  }

  private function convertArray2Code(array $argArray)
  {
    $result = '[';
    $array = $argArray;
    $isArrayList = Validation::isArrayList($array);
    foreach ($array as $key => $value)
    {
      if ($isArrayList !== true)
      {
        $result .= is_int($key)? $key: '\'' . Encoder::addslashes($key) . '\' => ';
      }
      if (is_int($value) || is_float($value))
      {
        $result .= $value . ',';
      }
      else if (is_string($value))
      {
        $result .= '\'' . Encoder::addslashes($value) . '\',';
      }
      else if (is_bool($value))
      {
        $result .= ($value === true? 'true': 'false') . ',';
      }
      else if (is_array($value))
      {
        $result .= $this ->  convertArray2Code($value) . ',';
      }
    }
    $result .= ']';
    return $result;
  }

  public function getConstants()
  {
    return $this -> constants;
  }

  public function isWritable()
  {
    return is_writable($this -> getFullConfigPath());
  }

  public function save()
  {
    $result = false;
    $configContent = [];
    $className = StringHelper::getClipedString($this -> configClassName, '\\', 'right');
    $nameSpace = StringHelper::getClipedString($this -> configClassName, '\\', 'left+');
    $configContent[] = '<?php';
    $configContent[] = '//******************************//';
    $configContent[] = '// JTBC Powered by jtbc.cn      //';
    $configContent[] = '//******************************//';
    $configContent[] = 'namespace ' . $nameSpace . ';';
    $configContent[] = '';
    $configContent[] = 'class ' . $className;
    $configContent[] = '{';
    foreach ($this -> constants as $key => $value)
    {
      if (is_int($value) || is_float($value))
      {
        $configContent[] = '  public const ' . $key . ' = ' . $value . ';';
      }
      else if (is_string($value))
      {
        $configContent[] = '  public const ' . $key . ' = \'' . Encoder::addslashes($value) . '\';';
      }
      else if (is_bool($value))
      {
        $configContent[] = '  public const ' . $key . ' = ' . $value === true? 'true': 'false' . ';';
      }
      else if (is_array($value))
      {
        $configContent[] = '  public const ' . $key . ' = ' . $this -> convertArray2Code($value) . ';';
      }
    }
    $configContent[] = '}';
    $fullConfigPath = $this -> getFullConfigPath();
    $fullConfigDirectory = StringHelper::getClippedString($fullConfigPath, '/', 'left+');
    if ($this -> createIfNotExists === true && !is_dir($fullConfigDirectory))
    {
      @mkdir($fullConfigDirectory, 0777, true);
    }
    if (@file_put_contents($fullConfigPath, implode(chr(13) . chr(10), $configContent)) !== false)
    {
      $result = true;
    }
    return $result;
  }

  public function __get($argName)
  {
    $result = null;
    $name = $argName;
    if (array_key_exists($name, $this -> constants))
    {
      $result = $this -> constants[$name];
    }
    return $result;
  }

  public function __set($argName, $argValue)
  {
    $name = $argName;
    $value = $argValue;
    if (!Validation::isConstantName($name))
    {
      throw new UnexpectedException('Unexpected constant name', 50801);
    }
    else
    {
      if (is_scalar($value) || Validation::isClassicArray($value))
      {
        $this -> constants[$name] = $value;
      }
      else
      {
        throw new UnexpectedException('Unexpected value type', 50801);
      }
    }
  }

  public function __construct(string $argConfigClassName, bool $argCreateIfNotExists = false)
  {
    $configClassName = $this -> configClassName = $argConfigClassName;
    $createIfNotExists = $this -> createIfNotExists = $argCreateIfNotExists;
    if (!str_starts_with($configClassName, 'Config\\'))
    {
      throw new NotSupportedException('Class "' . $configClassName . '" is not supported', 50415);
    }
    else if (!class_exists($configClassName))
    {
      if ($createIfNotExists === false)
      {
        throw new NotExistException('Class "' . $configClassName . '" does not exist', 50404);
      }
      else
      {
        $this -> constants = [];
      }
    }
    else
    {
      $this -> reflectionClass = new ReflectionClass($configClassName);
      if (!$this -> isClassic())
      {
        throw new NotSupportedException('Class "' . $configClassName . '" is not supported', 50415);
      }
      else
      {
        $this -> loadConstants();
      }
    }
  }
}