<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\DB\Schema;
use Jtbc\DB;
use Jtbc\Substance;
use Jtbc\DAL\SQLFormatter;
use Jtbc\Exception\NotSupportedException;

class Column
{
  private $comment;
  private $dataType;
  private $defaultValue;
  private $isAutoIncrement;
  private $name;
  private $nullAble;
  private $size;
  private $limitedDataType = [
    'tinyint',
    'smallint',
    'int',
    'integer',
    'bigint',
    'varchar',
    'text',
    'mediumtext',
    'longtext',
    'date',
    'datetime',
    'time',
  ];

  public function getName()
  {
    return $this -> name;
  }

  public function setComment(string $argComment)
  {
    $this -> comment = $argComment;
  }

  public function setDataType(string $argDataType, ?int $argSize = null)
  {
    $dataType = $argDataType;
    $size = $argSize;
    if (in_array($dataType, $this -> limitedDataType))
    {
      $this -> dataType = $dataType;
      $this -> size = $size;
    }
    else
    {
      throw new NotSupportedException('"' . $dataType . '" is not supported', 50415);
    }
  }

  public function setDefaultValue($argDefaultValue)
  {
    $defaultValue = $argDefaultValue;
    if (is_int($defaultValue) || is_string($defaultValue))
    {
      $this -> defaultValue = $defaultValue;
    }
    else
    {
      throw new NotSupportedException('"' . gettype($defaultValue) . '" is not supported', 50415);
    }
  }

  public function toString(bool $argWithName = true)
  {
    $items = [];
    $withName = $argWithName;
    if ($withName == true)
    {
      $items[] = SQLFormatter::formatName($this -> name);
    }
    if (is_null($this -> size))
    {
      $items[] = $this -> dataType;
    }
    else
    {
      $items[] = $this -> dataType . '(' . $this -> size . ')';
    }
    $items[] = $this -> nullAble === true? 'NULL': 'NOT NULL';
    if ($this -> isAutoIncrement === true)
    {
      $items[] = 'AUTO_INCREMENT';
    }
    if (!is_null($this -> defaultValue))
    {
      $defaultValue = $this -> defaultValue;
      if (is_int($defaultValue))
      {
        $items[] = 'DEFAULT ' . $defaultValue;
      }
      else if (is_string($defaultValue))
      {
        $items[] = 'DEFAULT \'' . addslashes($defaultValue) . '\'';
      }
    }
    if (!is_null($this -> comment))
    {
      $items[] = 'COMMENT \'' . addslashes($this -> comment) . '\'';
    }
    return implode(' ', $items);
  }

  public function __construct(string $argName, bool $argNullAble = true, bool $argIsAutoIncrement = false)
  {
    $this -> name = $argName;
    $this -> nullAble = $argNullAble;
    $this -> isAutoIncrement = $argIsAutoIncrement;
  }
}