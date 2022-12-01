<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\DAL;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\Exception\FormatException;

class SQLQueryAssign
{
  public static function equal($argValue, $argFieldType, $argFieldLength) 
  {
    $result = null;
    $value = $argValue;
    $fieldType = $argFieldType;
    $fieldLength = $argFieldLength;
    if (is_null($value)) $result = ' is null';
    else if (is_integer($value) || is_float($value)) $result = ' = ' . $value;
    else if (is_string($value)) $result = ' = \'' . addslashes($value) . '\'';
    else
    {
      throw new FormatException('Value is not in the correct format', 50101);
    }
    return $result;
  }

  public static function unEqual($argValue, $argFieldType, $argFieldLength) 
  {
    $result = null;
    $value = $argValue;
    $fieldType = $argFieldType;
    $fieldLength = $argFieldLength;
    if (is_null($value)) $result = ' is not null';
    else if (is_integer($value) || is_float($value)) $result = ' != ' . $value;
    else if (is_string($value)) $result = ' != \'' . addslashes($value) . '\'';
    else
    {
      throw new FormatException('Value is not in the correct format', 50101);
    }
    return $result;
  }

  public static function min($argValue, $argFieldType, $argFieldLength)
  {
    $result = null;
    $value = $argValue;
    $fieldType = $argFieldType;
    $fieldLength = $argFieldLength;
    $equal = true;
    if ($value instanceof Substance)
    {
      $substance = $value;
      $value = $substance -> value;
      $equal = $substance -> equal;
    }
    $condition = $equal == true ? ' >= ' : ' > ';
    if (is_integer($value) || is_float($value)) $result = $condition . $value;
    else if (is_string($value) && $fieldType == 'varchar') $result = $condition . '\'' . addslashes($value) . '\'';
    else if (is_string($value) && $fieldType == 'date' && Validation::isDate($value)) $result = $condition . '\'' . addslashes($value) . '\'';
    else if (is_string($value) && $fieldType == 'datetime' && Validation::isDateTime($value)) $result = $condition . '\'' . addslashes($value) . '\'';
    else if (is_string($value) && $fieldType == 'time' && Validation::isTime($value)) $result = $condition . '\'' . addslashes($value) . '\'';
    else
    {
      throw new FormatException('Value is not in the correct format', 50101);
    }
    return $result;
  }

  public static function max($argValue, $argFieldType, $argFieldLength)
  {
    $result = null;
    $value = $argValue;
    $fieldType = $argFieldType;
    $fieldLength = $argFieldLength;
    $equal = true;
    if ($value instanceof Substance)
    {
      $substance = $value;
      $value = $substance -> value;
      $equal = $substance -> equal;
    }
    $condition = $equal == true ? ' <= ' : ' < ';
    if (is_integer($value) || is_float($value)) $result = $condition . $value;
    else if (is_string($value) && $fieldType == 'varchar') $result = $condition . '\'' . addslashes($value) . '\'';
    else if (is_string($value) && $fieldType == 'date' && Validation::isDate($value)) $result = $condition . '\'' . addslashes($value) . '\'';
    else if (is_string($value) && $fieldType == 'datetime' && Validation::isDateTime($value)) $result = $condition . '\'' . addslashes($value) . '\'';
    else if (is_string($value) && $fieldType == 'time' && Validation::isTime($value)) $result = $condition . '\'' . addslashes($value) . '\'';
    else
    {
      throw new FormatException('Value is not in the correct format', 50101);
    }
    return $result;
  }

  public static function in($argValue, $argFieldType, $argFieldLength) 
  {
    $result = null;
    $value = $argValue;
    $fieldType = $argFieldType;
    $fieldLength = $argFieldLength;
    if (is_integer($value) || is_float($value)) $result = ' in (' . $value . ')';
    else if (is_string($value) && Validation::isIntSeries($value)) $result = ' in (' . $value . ')';
    else if (is_array($value))
    {
      $filteredValue = array_map(fn($item) => is_string($item)? '\'' . addslashes($item) . '\'': $item, array_filter($value, fn($item) => is_integer($item) || is_float($item) || is_string($item)));
      if (!empty($filteredValue))
      {
        $result = ' in (' . implode(',', $filteredValue) . ')';
      }
      else
      {
        throw new FormatException('Value can not be empty', 50101);
      }
    }
    else
    {
      throw new FormatException('Value is not in the correct format', 50101);
    }
    return $result;
  }

  public static function notIn($argValue, $argFieldType, $argFieldLength) 
  {
    $result = null;
    $value = $argValue;
    $fieldType = $argFieldType;
    $fieldLength = $argFieldLength;
    if (is_integer($value) || is_float($value)) $result = ' not in (' . $value . ')';
    else if (is_string($value) && Validation::isIntSeries($value)) $result = ' not in (' . $value . ')';
    else if (is_array($value))
    {
      $filteredValue = array_map(fn($item) => is_string($item)? '\'' . addslashes($item) . '\'': $item, array_filter($value, fn($item) => is_integer($item) || is_float($item) || is_string($item)));
      if (!empty($filteredValue))
      {
        $result = ' not in (' . implode(',', $filteredValue) . ')';
      }
      else
      {
        throw new FormatException('Value can not be empty', 50101);
      }
    }
    else
    {
      throw new FormatException('Value is not in the correct format', 50101);
    }
    return $result;
  }

  public static function like($argValue, $argFieldType, $argFieldLength) 
  {
    $result = null;
    $value = $argValue;
    $fieldType = $argFieldType;
    $fieldLength = $argFieldLength;
    if (is_integer($value) || is_float($value)) $result = ' like ' . $value;
    else if (is_string($value)) $result = ' like \'' . addslashes($value) . '\'';
    else
    {
      throw new FormatException('Value is not in the correct format', 50101);
    }
    return $result;
  }

  public static function notLike($argValue, $argFieldType, $argFieldLength) 
  {
    $result = null;
    $value = $argValue;
    $fieldType = $argFieldType;
    $fieldLength = $argFieldLength;
    if (is_integer($value) || is_float($value)) $result = ' not like ' . $value;
    else if (is_string($value)) $result = ' not like \'' . addslashes($value) . '\'';
    else
    {
      throw new FormatException('Value is not in the correct format', 50101);
    }
    return $result;
  }

  public static function between($argValue, $argFieldType, $argFieldLength) 
  {
    $result = null;
    $value = $argValue;
    $fieldType = $argFieldType;
    $fieldLength = $argFieldLength;
    if (is_array($value) && count($value) == 2)
    {
      $firstValue = $value[0];
      $secondValue = $value[1];
      if (is_string($firstValue) && is_string($secondValue))
      {
        if ($fieldType == 'varchar')
        {
          $result = ' between \'' . addslashes($firstValue) . '\' and \'' . addslashes($secondValue) . '\'';
        }
        else if ($fieldType == 'date' && Validation::isDate($firstValue) && Validation::isDate($secondValue))
        {
          $result = ' between \'' . addslashes($firstValue) . '\' and \'' . addslashes($secondValue) . '\'';
        }
        else if ($fieldType == 'datetime' && Validation::isDateTime($firstValue) && Validation::isDateTime($secondValue))
        {
          $result = ' between \'' . addslashes($firstValue) . '\' and \'' . addslashes($secondValue) . '\'';
        }
        else if ($fieldType == 'time' && Validation::isTime($firstValue) && Validation::isTime($secondValue))
        {
          $result = ' between \'' . addslashes($firstValue) . '\' and \'' . addslashes($secondValue) . '\'';
        }
      }
      else if ((is_integer($firstValue) || is_float($firstValue)) && (is_integer($secondValue) || is_float($secondValue)))
      {
        $result = ' between ' . $firstValue . ' and ' . $secondValue;
      }
    }
    if (is_null($result))
    {
      throw new FormatException('Value is not in the correct format', 50101);
    }
    return $result;
  }

  public static function notBetween($argValue, $argFieldType, $argFieldLength) 
  {
    $result = null;
    $value = $argValue;
    $fieldType = $argFieldType;
    $fieldLength = $argFieldLength;
    if (is_array($value) && count($value) == 2)
    {
      $firstValue = $value[0];
      $secondValue = $value[1];
      if (is_string($firstValue) && is_string($secondValue))
      {
        if ($fieldType == 'varchar')
        {
          $result = ' not between \'' . addslashes($firstValue) . '\' and \'' . addslashes($secondValue) . '\'';
        }
        else if ($fieldType == 'date' && Validation::isDate($firstValue) && Validation::isDate($secondValue))
        {
          $result = ' not between \'' . addslashes($firstValue) . '\' and \'' . addslashes($secondValue) . '\'';
        }
        else if ($fieldType == 'datetime' && Validation::isDateTime($firstValue) && Validation::isDateTime($secondValue))
        {
          $result = ' not between \'' . addslashes($firstValue) . '\' and \'' . addslashes($secondValue) . '\'';
        }
        else if ($fieldType == 'time' && Validation::isTime($firstValue) && Validation::isTime($secondValue))
        {
          $result = ' not between \'' . addslashes($firstValue) . '\' and \'' . addslashes($secondValue) . '\'';
        }
      }
      else if ((is_integer($firstValue) || is_float($firstValue)) && (is_integer($secondValue) || is_float($secondValue)))
      {
        $result = ' not between ' . $firstValue . ' and ' . $secondValue;
      }
    }
    if (is_null($result))
    {
      throw new FormatException('Value is not in the correct format', 50101);
    }
    return $result;
  }

  public static function greaterThan($argValue, $argFieldType, $argFieldLength)
  {
    $result = null;
    $value = $argValue;
    $fieldType = $argFieldType;
    $fieldLength = $argFieldLength;
    $equal = false;
    if ($value instanceof Substance)
    {
      $substance = $value;
      $value = $substance -> value;
      $equal = $substance -> equal;
    }
    $condition = $equal == false ? ' > ' : ' >= ';
    $result = $condition . $value;
    return $result;
  }

  public static function lessThan($argValue, $argFieldType, $argFieldLength)
  {
    $result = null;
    $value = $argValue;
    $fieldType = $argFieldType;
    $fieldLength = $argFieldLength;
    $equal = false;
    if ($value instanceof Substance)
    {
      $substance = $value;
      $value = $substance -> value;
      $equal = $substance -> equal;
    }
    $condition = $equal == false ? ' < ' : ' <= ';
    $result = $condition . $value;
    return $result;
  }

  public static function sameAs($argValue, $argFieldType, $argFieldLength)
  {
    $result = null;
    $value = $argValue;
    $fieldType = $argFieldType;
    $fieldLength = $argFieldLength;
    $condition = ' = ';
    $result = $condition . $value;
    return $result;
  }
}