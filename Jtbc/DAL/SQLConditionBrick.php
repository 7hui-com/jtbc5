<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\DAL;
use Jtbc\Substance;
use Jtbc\Exception\NotCallableException;

class SQLConditionBrick
{
  private $builder = null;
  public $name = null;
  public $value = null;
  public $condition = null;
  public $andOr = 'and';

  private function updateTobuilder()
  {
    $object = (object)[];
    $object -> name = $this -> name;
    $object -> value = $this -> value;
    $object -> condition = $this -> condition;
    return $this -> builder -> set($object, $this -> andOr);
  }

  public function __call($argName, $args)
  {
    $name = $argName;
    $methodToConditionMap = ['equal', 'unEqual', 'min', 'max', 'in', 'notIn', 'like', 'notLike', 'between', 'notBetween', 'greaterThan', 'lessThan', 'sameAs'];
    if (in_array($name, $methodToConditionMap))
    {
      $value = null;
      if (is_array($args))
      {
        $argsCount = count($args);
        if ($argsCount == 1)
        {
          $value = array_shift($args);
        }
        else if ($argsCount == 2)
        {
          $value1 = array_shift($args);
          $value2 = array_shift($args);
          if (in_array($name, ['between', 'notBetween']))
          {
            $value = [$value1, $value2];
          }
          else if (in_array($name, ['min', 'max', 'greaterThan', 'lessThan']))
          {
            $value = new Substance();
            $value -> value = $value1;
            $value -> equal = $value2;
          }
        }
      }
      $this -> value = $value;
      $this -> condition = $name;
      $this -> updateTobuilder();
    }
    else
    {
      throw new NotCallableException('Not callable', 50406);
    }
    return $this;
  }

  public function __get($argName)
  {
    $name = $argName;
    $result = $this;
    if ($name == 'or') $this -> andOr = 'or';
    else if ($name == 'and') $this -> andOr = 'and';
    else
    {
      $result = null;
    }
    return $result;
  }

  public function __construct(SQLConditionBuilder $builder, $argName)
  {
    $this -> builder = $builder;
    $this -> name = $argName;
  }
}