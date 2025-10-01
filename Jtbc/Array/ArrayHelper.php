<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Array;
use Jtbc\Validation;

class ArrayHelper
{
  public static function getValue(array $argArray, string $argKey, $argDefaultValue = null)
  {
    $key = $argKey;
    $array = $argArray;
    $result = $argDefaultValue;
    if (!Validation::isEmpty($key) && !empty($array))
    {
      foreach (explode('.', $key) as $currentKey)
      {
        if (is_array($array) && array_key_exists($currentKey, $array))
        {
          $result = $array = $array[$currentKey];
        }
        else
        {
          $result = $argDefaultValue;
          break;
        }
      }
    }
    return $result;
  }

  public static function hasKeys(array $argArray, array $argKeys)
  {
    $result = false;
    $keys = $argKeys;
    $array = $argArray;
    if (!empty($keys))
    {
      $result = true;
      foreach ($keys as $key)
      {
        if (!is_scalar($key))
        {
          $result = false;
          break;
        }
        else if (!array_key_exists($key, $array))
        {
          $result = false;
          break;
        }
      }
    }
    return $result;
  }

  public static function reorder1DArray(array $argArray, array $argRules)
  {
    $rules = $argRules;
    $result = $argArray;
    if (Validation::isArrayList($result) && Validation::isArrayList($rules))
    {
      foreach (array_reverse($rules) as $item)
      {
        foreach ($result as $key => $value)
        {
          if ($value == $item)
          {
            unset($result[$key]);
            array_unshift($result, $value);
          }
        }
      }
    }
    return $result;
  }

  public static function reorder2DArray(array $argArray, array $argRules)
  {
    $rules = $argRules;
    $result = $argArray;
    if (Validation::isArrayList($result))
    {
      foreach (array_reverse($rules) as $k => $v)
      {
        if (is_string($k) && Validation::isArrayList($v))
        {
          foreach (array_reverse($v) as $t)
          {
            foreach ($result as $key => $value)
            {
              if (is_array($value) && array_key_exists($k, $value))
              {
                if ($value[$k] == $t)
                {
                  unset($result[$key]);
                  array_unshift($result, $value);
                }
              }
            }
          }
        }
      }
    }
    return $result;
  }

  public static function setValue(array &$array, string $argKey, $argValue)
  {
    $result = false;
    $key = $argKey;
    $value = $argValue;
    if (!Validation::isEmpty($key))
    {
      $settable = true;
      $target = &$array;
      foreach (explode('.', $key) as $currentKey)
      {
        if (is_array($target))
        {
          if (array_key_exists($currentKey, $target))
          {
            $target = &$target[$currentKey];
          }
          else
          {
            $target[$currentKey] = [];
            $target = &$target[$currentKey];
          }
        }
        else
        {
          $settable = false;
          break;
        }
      }
      if ($settable === true)
      {
        $result = true;
        $target = $value;
      }
    }
    return $result;
  }
}