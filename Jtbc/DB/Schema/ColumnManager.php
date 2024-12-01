<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\DB\Schema;
use Throwable;
use Jtbc\DB;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\DAL\SQLFormatter;
use Jtbc\Exception\NotExistException;
use Jtbc\Exception\AlreadyExistsException;

class ColumnManager
{
  private $db;
  private $tableName;
  private $tableInfo;
  public $lastErrorCode;
  public $lastErrorInfo;

  private function getAfterColumnString(?string $argAfterColumnName = null)
  {
    $result = '';
    $afterColumnName = $argAfterColumnName;
    if (!is_null($afterColumnName))
    {
      if (Validation::isEmpty($afterColumnName))
      {
        $result = ' FIRST';
      }
      else
      {
        if ($this -> hasColumn($afterColumnName))
        {
          $result = ' AFTER ' . SQLFormatter::formatName($afterColumnName);
        }
        else
        {
          throw new NotExistException('Column "' . $afterColumnName . '" does not exist', 50404);
        }
      }
    }
    return $result;
  }

  public function addColumn(Column $column, ?string $argAfterColumnName = null)
  {
    $result = null;
    $afterColumnName = $argAfterColumnName;
    $sql = 'alter table ' . SQLFormatter::formatName($this -> tableName) . ' add column ' . $column -> toString() . $this -> getAfterColumnString($afterColumnName);
    try
    {
      $result = $this -> db -> exec($sql);
      if ($result === false)
      {
        $this -> lastErrorCode = $this -> db -> errorCode();
        $this -> lastErrorInfo = $this -> db -> errorInfo();
      }
    }
    catch(Throwable $e)
    {
      $this -> lastErrorCode = $e -> getCode();
      $this -> lastErrorInfo = $e -> getMessage();
    }
    return $result;
  }

  public function dropColumn(string $argColumnName)
  {
    $result = null;
    $columnName = $argColumnName;
    if ($this -> hasColumn($columnName))
    {
      $sql = 'alter table ' . SQLFormatter::formatName($this -> tableName) . ' drop column ' . SQLFormatter::formatName($columnName);
      try
      {
        $result = $this -> db -> exec($sql);
        if ($result === false)
        {
          $this -> lastErrorCode = $this -> db -> errorCode();
          $this -> lastErrorInfo = $this -> db -> errorInfo();
        }
      }
      catch(Throwable $e)
      {
        $this -> lastErrorCode = $e -> getCode();
        $this -> lastErrorInfo = $e -> getMessage();
      }
    }
    return $result;
  }

  public function changeColumn(Column $column, string $argNewColumnName, ?string $argAfterColumnName = null)
  {
    $result = null;
    $newColumnName = $argNewColumnName;
    $afterColumnName = $argAfterColumnName;
    $oldColumnName = $column -> getName();
    if ($newColumnName == $oldColumnName)
    {
      $sql = 'alter table ' . SQLFormatter::formatName($this -> tableName) . ' modify column ' . $column -> toString() . $this -> getAfterColumnString($afterColumnName);
    }
    else
    {
      if ($this -> hasColumn($newColumnName))
      {
        throw new AlreadyExistsException('"' . $newColumnName . '" is already exists', 50505);
      }
      else
      {
        $sql = 'alter table ' . SQLFormatter::formatName($this -> tableName) . ' change column ' . SQLFormatter::formatName($oldColumnName) . ' ' . SQLFormatter::formatName($newColumnName) . ' ' . $column -> toString(false) . $this -> getAfterColumnString($afterColumnName);
      }
    }
    try
    {
      $result = $this -> db -> exec($sql);
      if ($result === false)
      {
        $this -> lastErrorCode = $this -> db -> errorCode();
        $this -> lastErrorInfo = $this -> db -> errorInfo();
      }
    }
    catch(Throwable $e)
    {
      $this -> lastErrorCode = $e -> getCode();
      $this -> lastErrorInfo = $e -> getMessage();
    }
    return $result;
  }

  public function modifyColumn(Column $column, ?string $argAfterColumnName = null)
  {
    $result = null;
    $afterColumnName = $argAfterColumnName;
    $sql = 'alter table ' . SQLFormatter::formatName($this -> tableName) . ' modify column ' . $column -> toString() . $this -> getAfterColumnString($afterColumnName);
    try
    {
      $result = $this -> db -> exec($sql);
      if ($result === false)
      {
        $this -> lastErrorCode = $this -> db -> errorCode();
        $this -> lastErrorInfo = $this -> db -> errorInfo();
      }
    }
    catch(Throwable $e)
    {
      $this -> lastErrorCode = $e -> getCode();
      $this -> lastErrorInfo = $e -> getMessage();
    }
    return $result;
  }

  public function modifyColumnComment(string $argColumnName, string $argComment)
  {
    $result = null;
    $columnName = $argColumnName;
    $comment = $argComment;
    $columnInfo = $this -> getColumnInfo($columnName);
    if (!is_null($columnInfo))
    {
      $columnLoader = new ColumnLoader($columnInfo);
      $columnLoader -> setComment($comment);
      $result = $this -> modifyColumn($columnLoader -> get());
    }
    return $result;
  }

  public function hasColumn(string $argColumnName)
  {
    $columnName = $argColumnName;
    return is_null($this -> getColumnInfo($columnName))? false: true;
  }

  public function getColumnInfo(string $argColumnName)
  {
    $columnInfo = null;
    $tableInfo = $this -> tableInfo;
    $columnName = $argColumnName;
    if (is_array($tableInfo))
    {
      foreach ($tableInfo as $item)
      {
        if ($item['field'] == $columnName)
        {
          $columnInfo = new Substance($item);
          break;
        }
      }
    }
    return $columnInfo;
  }

  public function reloadTableInfo()
  {
    $this -> tableInfo = $this -> db -> getTableInfo($this -> tableName);
  }

  public function __construct(DB $db, string $argTableName)
  {
    $this -> db = $db;
    $this -> tableName = $tableName = $argTableName;
    if (!$this -> db -> hasTable($tableName))
    {
      throw new NotExistException('Table name "' . $tableName . '" does not exist', 50404);
    }
    else
    {
      $this -> tableInfo = $this -> db -> getTableInfo($tableName);
    }
  }
}