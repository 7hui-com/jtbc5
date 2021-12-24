<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;

class Validator
{
  private $source;
  private $parent;

  public function between($argStart, $argEnd, bool $argEqual = true)
  {
    $bool = false;
    $start = $argStart;
    $end = $argEnd;
    $equal = $argEqual;
    $compareAble = false;
    $source = $this -> source;
    $startValue = $endValue = $sourceValue = null;
    if (is_numeric($source))
    {
      $compareAble = true;
      $startValue = intval($start);
      $endValue = intval($end);
      $sourceValue = intval($source);
      if (strpos($start, '.') !== false) $startValue = floatval($start);
      if (strpos($end, '.') !== false) $endValue = floatval($end);
      if (strpos($source, '.') !== false) $sourceValue = floatval($source);
    }
    else if (Validation::isDate($source))
    {
      if (Validation::isDate($start) && Validation::isDate($end))
      {
        $compareAble = true;
        $startValue = strtotime($start);
        $endValue = strtotime($end);
        $sourceValue = strtotime($source);
      }
    }
    else if (Validation::isDateTime($source))
    {
      if (Validation::isDateTime($start) && Validation::isDateTime($end))
      {
        $compareAble = true;
        $startValue = strtotime($start);
        $endValue = strtotime($end);
        $sourceValue = strtotime($source);
      }
    }
    if ($compareAble == true)
    {
      if (is_numeric($startValue) && is_numeric($endValue) && is_numeric($sourceValue))
      {
        if ($equal == true)
        {
          if ($sourceValue >= $startValue && $sourceValue <= $endValue) $bool = true;
        }
        else
        {
          if ($sourceValue > $startValue && $sourceValue < $endValue) $bool = true;
        }
      }
    }
    return $bool;
  }

  public function lengthBetween(int $argStart, int $argEnd, bool $argEqual = true)
  {
    $bool = false;
    $start = $argStart;
    $end = $argEnd;
    $equal = $argEqual;
    if ($this -> isScalar())
    {
      $source = $this -> source;
      $sourceLength = mb_strlen($source);
      if ($equal == true)
      {
        if ($sourceLength >= $start && $sourceLength <= $end) $bool = true;
      }
      else
      {
        if ($sourceLength > $start && $sourceLength < $end) $bool = true;
      }
    }
    return $bool;
  }

  public function max($argEnd, bool $argEqual = true)
  {
    $bool = false;
    $end = $argEnd;
    $equal = $argEqual;
    $compareAble = false;
    $source = $this -> source;
    $endValue = $sourceValue = null;
    if (is_numeric($source))
    {
      $compareAble = true;
      $endValue = intval($end);
      $sourceValue = intval($source);
      if (strpos($end, '.') !== false) $endValue = floatval($end);
      if (strpos($source, '.') !== false) $sourceValue = floatval($source);
    }
    else if (Validation::isDate($source))
    {
      if (Validation::isDate($end))
      {
        $compareAble = true;
        $endValue = strtotime($end);
        $sourceValue = strtotime($source);
      }
    }
    else if (Validation::isDateTime($end))
    {
      if (Validation::isDateTime($end))
      {
        $compareAble = true;
        $endValue = strtotime($end);
        $sourceValue = strtotime($source);
      }
    }
    if ($compareAble == true && is_numeric($endValue) && is_numeric($sourceValue))
    {
      if ($equal == true)
      {
        if ($sourceValue <= $endValue) $bool = true;
      }
      else
      {
        if ($sourceValue < $endValue) $bool = true;
      }
    }
    return $bool;
  }

  public function min($argStart, bool $argEqual = true)
  {
    $bool = false;
    $start = $argStart;
    $equal = $argEqual;
    $compareAble = false;
    $source = $this -> source;
    $startValue = $sourceValue = null;
    if (is_numeric($source))
    {
      $compareAble = true;
      $startValue = intval($start);
      $sourceValue = intval($source);
      if (strpos($start, '.') !== false) $startValue = floatval($start);
      if (strpos($source, '.') !== false) $sourceValue = floatval($source);
    }
    else if (Validation::isDate($source))
    {
      if (Validation::isDate($start))
      {
        $compareAble = true;
        $startValue = strtotime($start);
        $sourceValue = strtotime($source);
      }
    }
    else if (Validation::isDateTime($source))
    {
      if (Validation::isDateTime($start))
      {
        $compareAble = true;
        $startValue = strtotime($start);
        $sourceValue = strtotime($source);
      }
    }
    if ($compareAble == true && is_numeric($startValue) && is_numeric($sourceValue))
    {
      if ($equal == true)
      {
        if ($sourceValue >= $startValue) $bool = true;
      }
      else
      {
        if ($sourceValue > $startValue) $bool = true;
      }
    }
    return $bool;
  }

  public function in($argRepository)
  {
    $bool = false;
    $repository = $argRepository;
    $source = $this -> source;
    if (is_string($repository))
    {
      $repository = explode(',', $repository);
    }
    if (is_array($repository))
    {
      if (in_array($source, $repository)) $bool = true;
    }
    return $bool;
  }

  public function isArray()
  {
    $bool = false;
    if (is_array($this -> source)) $bool = true;
    return $bool;
  }

  public function isInt()
  {
    $bool = false;
    if (is_int($this -> source)) $bool = true;
    return $bool;
  }

  public function isNull()
  {
    $bool = false;
    if (is_null($this -> source)) $bool = true;
    return $bool;
  }

  public function isNumeric()
  {
    $bool = false;
    if (is_numeric($this -> source)) $bool = true;
    return $bool;
  }

  public function isObject()
  {
    $bool = false;
    if (is_object($this -> source)) $bool = true;
    return $bool;
  }

  public function isScalar()
  {
    $bool = false;
    if (is_scalar($this -> source)) $bool = true;
    return $bool;
  }

  public function isString()
  {
    $bool = false;
    if (is_string($this -> source)) $bool = true;
    return $bool;
  }

  public function greaterThan($argName, bool $argEqual = false)
  {
    $bool = false;
    $name = $argName;
    $equal = $argEqual;
    $parent = $this -> parent;
    if ($parent instanceof self)
    {
      if ($this -> min($parent -> {$name} -> value(), $equal)) $bool = true;
    }
    return $bool;
  }

  public function lessThan($argName, bool $argEqual = false)
  {
    $bool = false;
    $name = $argName;
    $equal = $argEqual;
    $parent = $this -> parent;
    if ($parent instanceof self)
    {
      if ($this -> max($parent -> {$name} -> value(), $equal)) $bool = true;
    }
    return $bool;
  }

  public function sameAs($argName)
  {
    $bool = false;
    $name = $argName;
    $parent = $this -> parent;
    if ($parent instanceof self)
    {
      if ($this -> source == $parent -> {$name} -> value()) $bool = true;
    }
    return $bool;
  }

  public function value()
  {
    return $this -> source;
  }

  public function __call($argName, $args) 
  {
    $result = false;
    $name = $argName;
    $class = Validation::class;
    if (is_callable([$class, $name]))
    {
      array_unshift($args, $this -> source);
      $result = call_user_func_array([$class, $name], $args);
    }
    return $result;
  }

  public function __get($argName)
  {
    $name = $argName;
    $source = $this -> source;
    $newSource = $source[$name] ?? null;
    $result = new self($newSource);
    $result -> parent = $this;
    return $result;
  }

  public function __construct($argSource)
  {
    $this -> source = $argSource;
  }
}