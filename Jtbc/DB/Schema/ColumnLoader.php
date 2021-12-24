<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\DB\Schema;
use Jtbc\DB;
use Jtbc\Substance;
use Jtbc\Validation;

class ColumnLoader
{
  private $column;
  private $columnInfo;

  public function get()
  {
    return $this -> column;
  }

  public function setComment(...$args)
  {
    return $this -> column -> setComment(...$args);
  }

  public function setDataType(...$args)
  {
    return $this -> column -> setDataType(...$args);
  }

  public function setDefaultValue(...$args)
  {
    return $this -> column -> setDefaultValue(...$args);
  }

  public function toString()
  {
    return $this -> column -> toString();
  }

  public function load()
  {
    $columnInfo = $this -> columnInfo;
    $name = $columnInfo -> field;
    $nullAble = $columnInfo['null'] == 'YES'? true: false;
    $isAutoIncrement = $columnInfo -> extra == 'auto_increment'? true: false;
    $column = new Column($name, $nullAble, $isAutoIncrement);
    $column -> setDataType($columnInfo -> type, $columnInfo -> length);
    if (!is_null($columnInfo -> default)) $column -> setDefaultValue($columnInfo -> default);
    if (!Validation::isEmpty($columnInfo -> comment))
    {
      $column -> setComment($columnInfo -> comment);
    }
    $this -> column = $column;
  }

  public function __construct(Substance $columnInfo)
  {
    $this -> columnInfo = $columnInfo;
    $this -> load();
  }
}