<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\DAL;
use Jtbc\DB;
use Jtbc\Validation;
use Jtbc\DB\Schema\SchemaViewer;
use Jtbc\String\StringHelper;
use Jtbc\Exception\ErrorException;
use Jtbc\Exception\NotExistException;
use Jtbc\Exception\UnexpectedException;

class SQLBuilder
{
  private $db;
  private $table;
  private $SQLQueryBuilder;

  public function getSelectSQL($argFields = '*')
  {
    $selectSQL = '';
    $fields = $argFields;
    $virtualFields = [];
    $db = $this -> db;
    $table = $this -> table;
    $schemaViewer = new SchemaViewer($db);
    if (is_null($fields))
    {
      $fields = '*';
    }
    else if (is_string($fields))
    {
      if (Validation::isEmpty($fields))
      {
        $fields = '*';
      }
      else if ($fields == '~')
      {
        $tempFields = [];
        $briefFields = $schemaViewer -> getFields($table, true);
        foreach ($briefFields as $briefField)
        {
          $tempFields[] = SQLFormatter::formatName($briefField);
        }
        if (!empty($tempFields))
        {
          $fields = implode(',', $tempFields);
        }
        else
        {
          throw new UnexpectedException('Unexpected argument(s)', 50801);
        }
      }
    }
    else if (is_array($fields))
    {
      $tempFields = [];
      foreach ($fields as $field)
      {
        if (is_string($field))
        {
          $isMatched = false;
          if ($schemaViewer -> hasField($table, $field))
          {
            $isMatched = true;
            $tempFields[] = SQLFormatter::formatName($field);
          }
          else
          {
            $as = null;
            $realField = $field;
            if (str_contains(strtolower($field), ' as '))
            {
              $as = trim(StringHelper::getClipedString(str_ireplace(' as ', ' as ', $field), ' as ', 'right+'));
              $realField = trim(StringHelper::getClipedString(str_ireplace(' as ', ' as ', $field), ' as ', 'left'));
            }
            if (str_contains($realField, '(') && str_contains($realField, ')'))
            {
              $func = strtolower(StringHelper::getClipedString($realField, '(', 'left'));
              $realField = StringHelper::getClipedString(StringHelper::getClipedString($realField, '(', 'right+'), ')', 'left+');
              if (in_array($func, ['avg', 'count', 'max', 'min', 'sum']) && $schemaViewer -> hasField($table, $realField))
              {
                $isMatched = true;
                $tempFieldItem = $func . '(' . SQLFormatter::formatName($realField) . ')';
                if (!Validation::isEmpty($as))
                {
                  $virtualFields[] = $as;
                  $tempFieldItem .= ' as ' . SQLFormatter::formatName($as);
                }
                $tempFields[] =  $tempFieldItem;
              }
            }
            else if (!Validation::isEmpty($as) && $schemaViewer -> hasField($table, $realField))
            {
              $isMatched = true;
              $virtualFields[] = $as;
              $tempFields[] = SQLFormatter::formatName($realField) . ' as ' . SQLFormatter::formatName($as);
            }
          }
          if ($isMatched === false)
          {
            throw new NotExistException('Column "' . $field . '" does not exist', 50404);
          }
        }
        else
        {
          throw new UnexpectedException('Unexpected argument(s)', 50801);
        }
      }
      if (!empty($tempFields))
      {
        $fields = implode(',', $tempFields);
      }
      else
      {
        throw new UnexpectedException('Unexpected argument(s)', 50801);
      }
    }
    else
    {
      throw new UnexpectedException('Unexpected argument(s)', 50801);
    }
    $selectSQL = 'select ' . $fields . ' from ' . SQLFormatter::formatName($table) . $this -> SQLQueryBuilder -> getWhere() . $this -> SQLQueryBuilder -> getTail($virtualFields);
    return $selectSQL;
  }

  public function getInsertSQL($argSource)
  {
    $insertSQL = '';
    $source = $argSource;
    $db = $this -> db;
    $table = $this -> table;
    $schemaViewer = new SchemaViewer($db);
    $tableInfo = $schemaViewer -> getTableInfo($table);
    if (is_array($source) && is_array($tableInfo))
    {
      $fieldName = [];
      $fieldValue = [];
      $assignResult = [];
      foreach ($tableInfo as $item)
      {
        $tempAssignResult = SQLFieldAssign::assign($item, $source);
        if (!is_null($tempAssignResult)) $assignResult[] = $tempAssignResult;
      }
      foreach ($assignResult as $item)
      {
        $fieldName[] = $item[0];
        $fieldValue[] = $item[1];
      }
      if (!empty($fieldName) && !empty($fieldValue))
      {
        $insertSQL = 'insert into ' . SQLFormatter::formatName($table) . ' (' . implode(',', $fieldName) . ') values (' . implode(',', $fieldValue) . ')';
      }
    }
    return $insertSQL;
  }

  public function getUpdateSQL($argSource)
  {
    $updateSQL = '';
    $source = $argSource;
    $db = $this -> db;
    $table = $this -> table;
    $schemaViewer = new SchemaViewer($db);
    $tableInfo = $schemaViewer -> getTableInfo($table);
    if (is_array($source) && is_array($tableInfo))
    {
      $assignResult = [];
      foreach ($tableInfo as $item)
      {
        $tempAssignResult = SQLFieldAssign::assign($item, $source);
        if (!is_null($tempAssignResult)) $assignResult[] = $tempAssignResult;
      }
      if (!empty($assignResult))
      {
        $updateFieldItem = [];
        foreach ($assignResult as $item)
        {
          $updateFieldItem[] = $item[0] . '=' . $item[1];
        }
        $updateSQL = 'update ' . SQLFormatter::formatName($table) . ' set ' . implode(',', $updateFieldItem) . $this -> SQLQueryBuilder -> getWhere();
      }
    }
    return $updateSQL;
  }

  public function getDeleteSQL()
  {
    $table = $this -> table;
    $deleteSQL = 'delete from ' . SQLFormatter::formatName($table) . $this -> SQLQueryBuilder -> getWhere();
    return $deleteSQL;
  }

  public function getTruncateSQL()
  {
    $truncateSQL = null;
    if ($this -> hasNothing())
    {
      $table = $this -> table;
      $truncateSQL = 'truncate table ' . SQLFormatter::formatName($table);
    }
    else
    {
      throw new ErrorException('Bad condition', 50405);
    }
    return $truncateSQL;
  }

  public function __call($argName, $args) 
  {
    $result = null;
    $name = $argName;
    if (is_callable([$this -> SQLQueryBuilder, $name]))
    {
      $result = call_user_func_array([$this -> SQLQueryBuilder, $name], $args);
    }
    return $result;
  }

  public function __get($argName)
  {
    $name = $argName;
    return $this -> SQLQueryBuilder -> {$name};
  }

  public function __set($argName, $argValue)
  {
    $name = $argName;
    $value = $argValue;
    $this -> SQLQueryBuilder -> {$name} = $value;
  }

  public function __construct(DB $db, $argTable, $argAutoFilter = true)
  {
    $table = $argTable;
    $autoFilter = $argAutoFilter;
    $this -> db = $db;
    $this -> table = $table;
    $this -> SQLQueryBuilder = new SQLQueryBuilder($this -> db, $this -> table, $autoFilter);
  }
}