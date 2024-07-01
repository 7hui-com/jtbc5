<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;
use ArrayAccess;
use Countable;
use Iterator;
use JsonSerializable;
use Jtbc\Exception\UnexpectedException;

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

  public function convertToInt(...$args)
  {
    $result = 0;
    foreach ($args as $item)
    {
      if ($this -> exists($item))
      {
        $result += 1;
        $this -> offsetSet($item, intval($this -> offsetGet($item)));
      }
    }
    return $result;
  }

  public function count(): int
  {
    return count($this -> keys);
  }

  public function delete($argName)
  {
    $bool = false;
    $name = $argName;
    if ($this -> exists($name))
    {
      $bool = true;
      $this -> offsetUnset($name);
    }
    return $bool;
  }

  public function each(callable $func)
  {
    return array_walk($this -> body, $func);
  }

  public function exists($argName)
  {
    $bool = false;
    $name = $argName;
    if (array_key_exists($name, $this -> body)) $bool = true;
    return $bool;
  }

  public function filter(callable $func)
  {
    return new Substance(array_filter($this -> body, $func, ARRAY_FILTER_USE_BOTH));
  }

  public function first($argMode = 'value')
  {
    $result = null;
    if (!empty($this -> body))
    {
      $key = array_key_first($this -> body);
      $value = $this -> body[$key];
      $result = match($argMode)
      {
        'key' => $key,
        'value' => $value,
        'substance' => new Substance(['key' => $key, 'value' => $value]),
      };
    }
    return $result;
  }

  public function isEmpty()
  {
    return empty($this -> body);
  }

  public function keys()
  {
    return array_keys($this -> body);
  }

  public function krsort()
  {
    krsort($this -> body);
    return $this;
  }

  public function ksort()
  {
    ksort($this -> body);
    return $this;
  }

  public function last($argMode = 'value')
  {
    $result = null;
    if (!empty($this -> body))
    {
      $key = array_key_last($this -> body);
      $value = $this -> body[$key];
      $result = match($argMode)
      {
        'key' => $key,
        'value' => $value,
        'substance' => new Substance(['key' => $key, 'value' => $value]),
      };
    }
    return $result;
  }

  public function merge(Substance ...$substance)
  {
    $arrays = [];
    foreach ($substance as $ss)
    {
      $arrays[] = $ss -> toArray();
    }
    $this -> body = array_merge($this -> toArray(), ...$arrays);
    $this -> resetKeys();
    return $this;
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

  public function truncate(...$args)
  {
    $result = false;
    if (empty($args))
    {
      $result = true;
      $this -> body = [];
      $this -> keys = [];
    }
    else
    {
      $result = 0;
      foreach ($args as $item)
      {
        if ($this -> delete($item))
        {
          $result += 1;
        }
      }
    }
    return $result;
  }

  public function values()
  {
    return array_values($this -> body);
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
    if (is_array($body))
    {
      $this -> body = $body;
    }
    else if (is_string($body))
    {
      $newBody = JSON::decode($body);
      if (is_array($newBody))
      {
        $this -> body = $newBody;
      }
      else
      {
        throw new UnexpectedException('Unexpected argument(s)', 50801);
      }
    }
    $this -> resetKeys();
  }
}