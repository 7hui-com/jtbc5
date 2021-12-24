<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\DAL;
use Jtbc\Validation;
use Jtbc\Exception\FormatException;
use Jtbc\Exception\OutOfRangeException;
use Jtbc\Exception\NotSupportedException;

class SQLFieldAssign
{
  private static function getGroupData($argGroupName, $argFieldLength)
  {
    $result = [];
    $groupName = $argGroupName;
    $fieldLength = $argFieldLength;
    if ($groupName == 'number')
    {
      $result = [
        'tinyint' => [-128, 127],
        'smallint' => [-32768, 32767],
        'int' => [-2147483648, 2147483647],
        'integer' => [-2147483648, 2147483647],
        'bigint' => [-9223372036854775808, 9223372036854775807],
      ];
    }
    else if ($groupName == 'string')
    {
      $result = [
        'varchar' => $fieldLength,
        'text' => 20000,
        'mediumtext' => 5000000,
        'longtext' => 1000000000,
      ];
    }
    return $result;
  }

  public static function assign($argItem, $argSource)
  {
    $result = null;
    $item = $argItem;
    $source = $argSource;
    $fieldName = $item['field'];
    $fieldType = $item['type'];
    $fieldLength = intval($item['length']);
    $numberGroup = self::getGroupData('number', $fieldLength);
    $stringGroup = self::getGroupData('string', $fieldLength);
    if (array_key_exists($fieldName, $source))
    {
      $fieldValue = $source[$fieldName];
      $formatedName = SQLFormatter::formatName($fieldName);
      $formatedValue = null;
      if (is_null($fieldValue)) $formatedValue = 'null';
      else if (is_array($fieldValue))
      {
        $isMatch = false;
        if (count($fieldValue) == 1)
        {
          if (array_key_exists($fieldType, $numberGroup))
          {
            $commandList = ['increase', 'decrease', 'reverse'];
            $key = array_key_first($fieldValue);
            if (in_array($key, $commandList))
            {
              $isMatch = true;
              $val = intval($fieldValue[$key]);
              switch ($key)
              {
                case 'increase':
                  $formatedValue = $formatedName . '+' . $val;
                  break;
                case 'decrease':
                  $formatedValue = $formatedName . '-' . $val;
                  break;
                case 'reverse':
                  $formatedValue = 'abs(' . $formatedName . '-' . $val . ')';
                  break;
              }
            }
          }
        }
        if ($isMatch == false)
        {
          throw new NotSupportedException('"' . $fieldType . '" is not supported', 50415);
        }
      }
      else
      {
        if (array_key_exists($fieldType, $numberGroup))
        {
          $formatedValue = intval($fieldValue);
          $rangeStart = $numberGroup[$fieldType][0];
          $rangeEnd = $numberGroup[$fieldType][1];
          if ($formatedValue < $rangeStart || $formatedValue > $rangeEnd)
          {
            throw new OutOfRangeException('"' . $fieldValue . '" is out of range', 50416);
          }
        }
        else if (array_key_exists($fieldType, $stringGroup))
        {
          $limitLength = $stringGroup[$fieldType];
          if (mb_strlen($fieldValue) > $limitLength)
          {
            throw new OutOfRangeException('String is too long', 50416);
          }
          else
          {
            $formatedValue = '\'' . addslashes($fieldValue) . '\'';
          }
        }
        else if ($fieldType == 'date')
        {
          if (!Validation::isDate($fieldValue))
          {
            throw new FormatException('"' . $fieldValue . '" must be a valid date', 50101);
          }
          else
          {
            $formatedValue = '\'' . $fieldValue . '\'';
          }
        }
        else if ($fieldType == 'datetime')
        {
          if (!Validation::isDateTime($fieldValue))
          {
            throw new FormatException('"' . $fieldValue . '" must be a valid datetime', 50101);
          }
          else
          {
            $formatedValue = '\'' . $fieldValue . '\'';
          }
        }
        else
        {
          throw new NotSupportedException('"' . $fieldType . '" is not supported', 50415);
        }
      }
      if (!is_null($formatedValue)) $result = [$formatedName, $formatedValue];
    }
    return $result;
  }
}