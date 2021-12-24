<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\ORM;
use ArrayIterator;
use JsonSerializable;
use Jtbc\Substance;

class ActualRecord extends ArrayIterator implements JsonSerializable
{
  private $callback;

  public function toArray()
  {
    $result = [];
    $arrayCopy = $this -> getArrayCopy();
    foreach ($arrayCopy as $item)
    {
      $result[] = $item instanceof Substance? $item -> all(): $item;
    }
    return $result;
  }

  public function jsonSerialize(): mixed
  {
    return $this -> toArray();
  }

  public function current(): mixed
  {
    return is_null($this -> callback)? parent::current(): call_user_func($this -> callback, parent::current());
  }

  public function __construct($argArray, callable $callback = null)
  {
    parent::__construct($argArray);
    $this -> callback = $callback;
  }
}