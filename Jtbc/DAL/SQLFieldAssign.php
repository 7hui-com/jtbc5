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
  public static function assign($argItem, $argSource)
  {
    $result = null;
    $item = $argItem;
    $source = $argSource;
    $fieldType = strval($item['type']);
    $fieldName = strval($item['field']);
    $fieldLength = intval($item['length']);
    $numberGroup = FieldsHelper::getRangeOfNumericFields();
    $stringGroup = FieldsHelper::getMaxLengthOfStringFields($fieldType == 'varchar'? $fieldLength: null);
    if (array_key_exists($fieldName, $source))
    {
      $formatedValue = null;
      $fieldValue = $source[$fieldName];
      $formatedName = SQLFormatter::formatName($fieldName);
      if (is_null($fieldValue))
      {
        $formatedValue = 'null';
      }
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
            throw new OutOfRangeException('Out of range value for column "' . $fieldName . '"', 50416);
          }
        }
        else if (array_key_exists($fieldType, $stringGroup))
        {
          $limitLength = $stringGroup[$fieldType];
          if (mb_strlen($fieldValue) > $limitLength)
          {
            throw new OutOfRangeException('Data too long for column "' . $fieldName . '"', 50416);
          }
          else
          {
            $formatedValue = '\'' . addslashes($fieldValue) . '\'';
          }
        }
        else if ($fieldType == 'date')
        {
          if (Validation::isEmpty($fieldValue))
          {
            $formatedValue = 'null';
          }
          else if (!Validation::isDate($fieldValue))
          {
            throw new FormatException('Incorrect date value: "' . $fieldValue . '" for column "' . $fieldName . '"', 50101);
          }
          else
          {
            $formatedValue = '\'' . addslashes($fieldValue) . '\'';
          }
        }
        else if ($fieldType == 'datetime')
        {
          if (Validation::isEmpty($fieldValue))
          {
            $formatedValue = 'null';
          }
          else if (!Validation::isDateTime($fieldValue))
          {
            throw new FormatException('Incorrect datetime value: "' . $fieldValue . '" for column "' . $fieldName . '"', 50101);
          }
          else
          {
            $formatedValue = '\'' . addslashes($fieldValue) . '\'';
          }
        }
        else if ($fieldType == 'time')
        {
          if (Validation::isEmpty($fieldValue))
          {
            $formatedValue = 'null';
          }
          else if (!Validation::isTime($fieldValue))
          {
            throw new FormatException('Incorrect time value: "' . $fieldValue . '" for column "' . $fieldName . '"', 50101);
          }
          else
          {
            $formatedValue = '\'' . addslashes($fieldValue) . '\'';
          }
        }
        else
        {
          throw new NotSupportedException('"' . $fieldType . '" is not supported', 50415);
        }
      }
      if (!is_null($formatedValue))
      {
        $result = [$formatedName, $formatedValue];
      }
      else
      {
        throw new NotSupportedException('"' . $fieldType . '" is not supported', 50415);
      }
    }
    return $result;
  }
}