<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\DAL;

class FieldsHelper
{
  public static function getMaxLengthOfStringFields(?int $argVarcharLength = null)
  {
    return [
      'text' => 20000,
      'mediumtext' => 5000000,
      'longtext' => 1000000000,
      'varchar' => $argVarcharLength ?? 255,
    ];
  }

  public static function getRangeOfNumericFields()
  {
    return [
      'tinyint' => [-128, 127],
      'smallint' => [-32768, 32767],
      'int' => [-2147483648, 2147483647],
      'integer' => [-2147483648, 2147483647],
      'bigint' => [-9223372036854775808, 9223372036854775807],
    ];
  }

  public static function isOutOfLength(string $argFieldType, int $argStringLength, ?int $argVarcharLength = null)
  {
    $result = false;
    $fieldType = $argFieldType;
    $stringLength = $argStringLength;
    $maxLengthOfStringFields = self::getMaxLengthOfStringFields($argVarcharLength);
    if (array_key_exists($fieldType, $maxLengthOfStringFields))
    {
      $maxLength = $maxLengthOfStringFields[$fieldType];
      if ($stringLength > $maxLength)
      {
        $result = true;
      }
    }
    return $result;
  }

  public static function isOutOfRange(string $argFieldType, int $argFieldValue)
  {
    $result = false;
    $fieldType = $argFieldType;
    $fieldValue = $argFieldValue;
    $rangeOfNumericFields = self::getRangeOfNumericFields();
    if (array_key_exists($fieldType, $rangeOfNumericFields))
    {
      $range = $rangeOfNumericFields[$fieldType];
      if ($fieldValue < $range[0] || $fieldValue > $range[1])
      {
        $result = true;
      }
    }
    return $result;
  }
}