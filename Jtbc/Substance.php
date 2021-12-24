<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;
use ArrayAccess;
use Countable;
use Iterator;
use JsonSerializable;

class Substance implements ArrayAccess, Iterator, Countable, JsonSerializable
{
  private $body = [];
  private $keys = [];
  private $position = 0;
  private $recursiveMode = false;

  private function resetKeys()
  {
    if (is_array($this -> body))
    {
      $this -> keys = array_keys($this -> body);
    }
  }

  public function all()
  {
    return $this -> body;
  }

  public function count(): int
  {
    return count($this -> keys);
  }

  public function exists($argName)
  {
    $bool = false;
    $name = $argName;
    if (array_key_exists($name, $this -> body)) $bool = true;
    return $bool;
  }

  public function isEmpty()
  {
    return empty($this -> body);
  }

  public function toArray()
  {
    $result = $this -> body;
    foreach ($result as $key => $value)
    {
      if ($value instanceof self)
      {
        $result[$key] = $value -> toArray();
      }
    }
    return $result;
  }

  public function rewind(): void
  {
    $this -> position = 0;
  }

  public function current(): mixed
  {
    return $this -> body[$this -> keys[$this -> position]];
  }

  public function key(): mixed
  {
    return $this -> keys[$this -> position];
  }

  public function next(): void
  {
    $this -> position += 1;
  }

  public function valid(): bool
  {
    return isset($this -> keys[$this -> position]);
  }

  public function offsetExists($argName): bool
  {
    return $this -> exists($argName);
  }

  public function offsetSet($argName, $argValue): void
  {
    $name = $argName;
    $value = $argValue;
    if (is_null($name))
    {
      $this -> body[] = $value;
    }
    else
    {
      $this -> body[$name] = $value;
    }
    $this -> resetKeys();
  }

  public function offsetGet($argName): mixed
  {
    $result = null;
    $name = $argName;
    if ($this -> recursiveMode === true)
    {
      if (!array_key_exists($name, $this -> body))
      {
        $result = $this -> body[$name] = new self([], true);
      }
      else
      {
        $value = $this -> body[$name];
        if (!is_array($value))
        {
          $result = $value;
        }
        else
        {
          $result = $this -> body[$name] = new self($value, true);
        }
      }
    }
    else
    {
      if (array_key_exists($name, $this -> body))
      {
        $result = $this -> body[$name];
      }
    }
    return $result;
  }

  public function offsetUnset($argName): void
  {
    $name = $argName;
    unset($this -> body[$name]);
    $this -> resetKeys();
  }

  public function toJSON(): string
  {
    return JSON::encode($this -> toArray());
  }

  public function jsonSerialize(): mixed
  {
    return $this -> toArray();
  }

  public function __get($argName)
  {
    $name = $argName;
    return $this -> offsetGet($name);
  }

  public function __set($argName, $argValue)
  {
    $name = $argName;
    $value = $argValue;
    $this -> offsetSet($name, $value);
  }

  public function __toString(): string
  {
    return $this -> toJSON();
  }

  public function __construct($argBody = null, bool $argRecursiveMode = false)
  {
    $body = $argBody;
    $this -> recursiveMode = $argRecursiveMode;
    if (is_array($body)) $this -> body = $body;
    else if (is_string($body)) $this -> body = JSON::decode($body);
    $this -> resetKeys();
  }
}