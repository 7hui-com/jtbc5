<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\DAL;
use Jtbc\DB;
use Jtbc\DB\Schema\SchemaViewer;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\Exception\NotExistException;
use Jtbc\Exception\UnexpectedException;

class SQLQueryBuilder extends SQLConditionBuilder
{
  private $db;
  private $table;
  private $groupBy = [];
  private $having = [];
  private $orderBy = [];
  private $limitStart = null;
  private $limitLength = null;
  private $autoFilter = true;

  public function limit(...$args)
  {
    $start = 0;
    $length = 1;
    $argsCount = count($args);
    if ($argsCount == 1)
    {
      $length = intval($args[0]);
    }
    else if ($argsCount == 2)
    {
      $start = intval($args[0]);
      $length = intval($args[1]);
    }
    if ($start < 0) $start = 0;
    if ($length < 1) $length = 1;
    $this -> limitStart = $start;
    $this -> limitLength = $length;
    return $this;
  }

  public function groupBy($argField)
  {
    $field = $argField;
    $this -> groupBy[] = $field;
    return $this;
  }

  public function having($argField, $argValue)
  {
    $field = $argField;
    $value = $argValue;
    $this -> having[] = [$field, $value];
    return $this;
  }

  public function orderBy($argField, $argValue = 'desc')
  {
    $field = $argField;
    $value = $argValue;
    if (is_array($value))
    {
      $this -> orderBy[] = [$field, $value];
    }
    else if (is_string($value))
    {
      $this -> orderBy[] = [$field, (strtolower($value) == 'asc'? 'asc': 'desc')];
    }
    return $this;
  }

  public function getWhere()
  {
    $result = ' where 1=1';
    $db = $this -> db;
    $table = $this -> table;
    $pocket = $this -> pocket;
    $additionalSQL = $this -> additionalSQL;
    $schemaViewer = new SchemaViewer($db);
    if ($this -> autoFilter === true && $schemaViewer -> hasField($table, 'deleted'))
    {
      $result = ' where ' . SQLFormatter::formatName('deleted') . ' = 0';
    }
    $formatPocketResult = function($argPocket, $argAdditionalSQL, $argInnerMode = false) use ($schemaViewer, $table, &$formatPocketResult)
    {
      $pocketResult = '';
      $pocket = $argPocket;
      $additionalSQL = $argAdditionalSQL;
      $innerMode = $argInnerMode;
      if (is_array($pocket))
      {
        $conditionIndex = 0;
        foreach ($pocket as $condition)
        {
          $conditionIndex += 1;
          $andOr = $condition['andor'];
          $conditionBrick = $condition['brick'];
          $conditionBrickResult = '';
          if (($conditionBrick instanceof SQLConditionBuilder))
          {
            $conditionBrickResult = '(' . $formatPocketResult($conditionBrick -> pocket, $conditionBrick -> additionalSQL, true) . ')';
          }
          else if (is_object($conditionBrick))
          {
            $name = $conditionBrick -> name;
            $value = $conditionBrick -> value;
            $condition = $conditionBrick -> condition;
            $fieldInfo = $schemaViewer -> getFieldInfo($table, $name);
            if (is_array($fieldInfo))
            {
              $fieldType = $fieldInfo['type'];
              $fieldLength = intval($fieldInfo['length']);
              if (!in_array($condition, ['greaterThan', 'lessThan', 'sameAs']))
              {
                $formatResult = call_user_func_array([SQLQueryAssign::class, $condition], [$value, $fieldType, $fieldLength, $name]);
                $conditionBrickResult = SQLFormatter::formatName($name) . $formatResult;
              }
              else
              {
                $actualValue = $value;
                if ($value instanceof Substance) $actualValue = $value -> value;
                if (!$schemaViewer -> hasField($table, $actualValue))
                {
                  throw new NotExistException('Column "' . $actualValue . '" does not exist', 50404);
                }
                else
                {
                  $newValue = null;
                  if (is_string($value)) $newValue = SQLFormatter::formatName($actualValue);
                  else if ($value instanceof Substance)
                  {
                    $newValue = new Substance();
                    $newValue -> value = SQLFormatter::formatName($actualValue);
                    $newValue -> equal = $value -> equal;
                  }
                  if (!is_null($newValue))
                  {
                    $formatResult = call_user_func_array([SQLQueryAssign::class, $condition], [$newValue, $fieldType, $fieldLength, $name]);
                    $conditionBrickResult = SQLFormatter::formatName($name) . $formatResult;
                  }
                }
              }
            }
            else
            {
              throw new NotExistException('Column "' . $name . '" does not exist', 50404);
            }
          }
          if ($innerMode != true || $conditionIndex != 1) $conditionBrickResult = ' ' . $andOr . ' ' . $conditionBrickResult;
          $pocketResult .= $conditionBrickResult;
        }
      }
      if (!is_null($additionalSQL)) $pocketResult .= $additionalSQL;
      return $pocketResult;
    };
    $result .= $formatPocketResult($pocket, $additionalSQL);
    return $result;
  }

  public function getTail($argVirtualFields = [])
  {
    $result = '';
    $virtualFields = $argVirtualFields;
    $db = $this -> db;
    $table = $this -> table;
    $schemaViewer = new SchemaViewer($db);
    $groupBy = $this -> groupBy;
    $having = $this -> having;
    $orderBy = $this -> orderBy;
    $limitStart = $this -> limitStart;
    $limitLength = $this -> limitLength;
    if (!empty($groupBy))
    {
      $newGroupBy = [];
      foreach ($groupBy as $field)
      {
        if ($schemaViewer -> hasField($table, $field))
        {
          $newGroupBy[] = SQLFormatter::formatName($field);
        }
        else
        {
          throw new NotExistException('Column "' . $field . '" does not exist', 50404);
        }
      }
      $result .= ' group by ' . implode(',', $newGroupBy);
    }
    if (!empty($having))
    {
      $newHaving = [];
      foreach ($having as $item)
      {
        list($field, $value) = $item;
        if ($schemaViewer -> hasField($table, $field) || in_array($field, $virtualFields))
        {
          if (is_int($value))
          {
            $newHaving[] = SQLFormatter::formatName($field) . ' = ' . $value;
          }
          else if (is_string($value))
          {
            $newHaving[] = SQLFormatter::formatName($field) . ' = \'' . addslashes($value) . '\'';
          }
          else if (is_array($value) && Validation::isArrayList($value) && count($value) == 2)
          {
            list($value1, $value2) = $value;
            if (is_int($value1) && is_null($value2))
            {
              $newHaving[] = SQLFormatter::formatName($field) . ' >= ' . $value1;
            }
            else if (is_null($value1) && is_int($value2))
            {
              $newHaving[] = SQLFormatter::formatName($field) . ' <= ' . $value2;
            }
            else if (is_int($value1) && is_int($value2))
            {
              $newHaving[] = SQLFormatter::formatName($field) . ' between ' . $value1 . ' and ' . $value2;
            }
            else if (is_string($value1) && is_null($value2))
            {
              $newHaving[] = SQLFormatter::formatName($field) . ' >= \'' . addslashes($value1) . '\'';
            }
            else if (is_null($value1) && is_string($value2))
            {
              $newHaving[] = SQLFormatter::formatName($field) . ' <= \'' . addslashes($value2) . '\'';
            }
            else if (is_string($value1) && is_string($value2))
            {
              $newHaving[] = SQLFormatter::formatName($field) . ' between \'' . addslashes($value1) . '\' and \'' . addslashes($value2) . '\'';
            }
            else
            {
              throw new UnexpectedException('Unexpected value type', 50801);
            }
          }
          else
          {
            throw new UnexpectedException('Unexpected value type', 50801);
          }
        }
        else
        {
          throw new NotExistException('Column "' . $field . '" does not exist', 50404);
        }
      }
      $result .= ' having ' . implode(' and ', $newHaving);
    }
    if (!empty($orderBy))
    {
      $newOrderBy = [];
      foreach ($orderBy as $item)
      {
        list($field, $value) = $item;
        if (is_array($value))
        {
          if ($schemaViewer -> hasField($table, $field) || in_array($field, $virtualFields))
          {
            $getValues = function(array $value)
            {
              $result = 'null';
              if (!empty($value) && Validation::isArrayList($value))
              {
                $tempArr = [];
                foreach ($value as $item)
                {
                  if (is_int($item) || is_float($item))
                  {
                    $tempArr[] = $item;
                  }
                  else if (is_string($item))
                  {
                    $tempArr[] = '\'' . addslashes($item) . '\'';
                  }
                }
                $result = empty($tempArr)? 'null': implode(',', $tempArr);
              }
              return $result;
            };
            $newOrderBy[] = 'field(' . SQLFormatter::formatName($field) . ',' . $getValues($value). ')';
          }
          else
          {
            throw new NotExistException('Column "' . $field . '" does not exist', 50404);
          }
        }
        else if (is_string($value) && in_array($value, ['asc', 'desc']))
        {
          if (strtolower($field) == 'rand()')
          {
            $newOrderBy[] = 'rand() ' . $value;
          }
          else if ($schemaViewer -> hasField($table, $field) || in_array($field, $virtualFields))
          {
            $newOrderBy[] = SQLFormatter::formatName($field) . ' ' . $value;
          }
          else
          {
            throw new NotExistException('Column "' . $field . '" does not exist', 50404);
          }
        }
        else
        {
          throw new UnexpectedException('Unexpected value type', 50801);
        }
      }
      $result .= ' order by ' . implode(',', $newOrderBy);
    }
    if (!is_null($limitStart) && !is_null($limitLength))
    {
      $result .= ' limit ' . $limitStart . ',' . $limitLength;
    }
    return $result;
  }

  public function hasNothing()
  {
    $bool = true;
    if (!is_null($this -> limitStart))
    {
      $bool = false;
    }
    else if (!is_null($this -> limitLength))
    {
      $bool = false;
    }
    else if (!empty($this -> pocket))
    {
      $bool = false;
    }
    else if (!is_null($this -> additionalSQL))
    {
      $bool = false;
    }
    else if (!empty($this -> orderBy))
    {
      $bool = false;
    }
    else if (!empty($this -> groupBy))
    {
      $bool = false;
    }
    return $bool;
  }

  public function __construct(DB $db, $argTable, $argAutoFilter = true)
  {
    $this -> db = $db;
    $this -> table = $argTable;
    $this -> autoFilter = $argAutoFilter;
  }
}