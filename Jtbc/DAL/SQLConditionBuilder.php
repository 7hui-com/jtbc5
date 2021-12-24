<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\DAL;
use Jtbc\Exception\UnexpectedException;

class SQLConditionBuilder
{
  public $pocket = [];
  public $additionalSQL = null;

  private function getBrickInstance($argName)
  {
    $name = $argName;
    $instance = new SQLConditionBrick($this, $name);
    return $instance;
  }

  public function and($argBrick)
  {
    $brick = $argBrick;
    if (is_callable($brick))
    {
      $selfInstance = new self();
      $this -> and($brick($selfInstance) ?? $selfInstance);
    }
    else
    {
      $this -> set($brick, 'and');
    }
  }

  public function or($argBrick)
  {
    $brick = $argBrick;
    if (is_callable($brick))
    {
      $selfInstance = new self();
      $this -> or($brick($selfInstance) ?? $selfInstance);
    }
    else
    {
      $this -> set($brick, 'or');
    }
  }

  public function set($argBrick, string $argAndOr = 'and')
  {
    $brick = $argBrick;
    $andOr = $argAndOr;
    if (!is_null($brick))
    {
      if (in_array($andOr, ['and', 'or']))
      {
        $this -> pocket[] = ['brick' => $brick, 'andor' => $andOr];
      }
      else
      {
        throw new UnexpectedException('Unexpected argument(s)', 50801);
      }
    }
    return $this;
  }

  public function setFuzzyLike($argName, array $argKeywords, string $argAndOr = 'and')
  {
    $name = $argName;
    $keywords = $argKeywords;
    $andOr = $argAndOr;
    $self = new self();
    foreach ($keywords as $keyword)
    {
      $self -> {$name} -> like('%' . $keyword . '%');
    }
    $this -> set($self, $andOr);
    return $this;
  }

  public function setAdditionalSQL($argAdditionalSQL)
  {
    $this -> additionalSQL = $argAdditionalSQL;
    return $this;
  }

  public function isEmptyCondition()
  {
    $bool = true;
    if (!empty($this -> pocket)) $bool = false;
    return $bool;
  }

  public function __set($argName, $argValue)
  {
    $name = $argName;
    $value = $argValue;
    $this -> getBrickInstance($name) -> equal($value);
  }

  public function __get($argName)
  {
    $name = $argName;
    return $this -> getBrickInstance($name);
  }
}