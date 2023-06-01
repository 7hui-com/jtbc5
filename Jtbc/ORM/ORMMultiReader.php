<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\ORM;
use Jtbc\ORM;
use Jtbc\Pagination;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\DB\DBFactory;
use Jtbc\DAL\DirectDB;
use Jtbc\DAL\SQLFormatter;
use Jtbc\String\StringHelper;
use Jtbc\Exception\ErrorException;
use Jtbc\Exception\NotExistException;
use Jtbc\Exception\UnexpectedException;
use Jtbc\Exception\AmbiguousMatchException;

class ORMMultiReader
{
  private $db;
  private $leftORM;
  private $leftORMField;
  private $leftORMFields = [];
  private $rightORM;
  private $rightORMField;
  private $rightORMFields = [];
  private $mode = 'inner';
  private $modes = ['left', 'right', 'inner'];
  private $orderBy = [];
  private $limitStart = null;
  private $limitLength = null;
  protected $DBLink;
  public $pagination;
  public $pageNum = 0;
  public $pageSize = 0;

  private function isValidFields($argFields)
  {
    $result = false;
    $fields = $argFields;
    if ($fields == '*')
    {
      $result = true;
    }
    else if (Validation::isArrayList($fields))
    {
      $result = true;
      foreach ($fields as $field)
      {
        if (!is_string($field))
        {
          $result = false;
          break;
        }
      }
    }
    return $result;
  }

  public function get($argFields = '*')
  {
    $result = null;
    $fields = $argFields;
    $rs = $this -> db -> fetch($this -> getQuery($fields));
    if (is_array($rs))
    {
      $result = new Substance($rs);
    }
    return $result;
  }

  public function getAll($argFields = '*')
  {
    $result = [];
    $fields = $argFields;
    $rsa = $this -> db -> fetchAll($this -> getQuery($fields));
    if (is_array($rsa))
    {
      foreach ($rsa as $rs)
      {
        $result[] = new Substance($rs);
      }
    }
    return $result;
  }

  public function getOne($argFields = '*')
  {
    $result = [];
    $fields = $argFields;
    $rs = $this -> get($fields);
    if (!is_null($rs))
    {
      $result[] = new Substance($rs);
    }
    return $result;
  }

  public function getCount()
  {
    return DirectDB::getRsCount($this -> getQuery(), $this -> DBLink);
  }

  public function getPage($argFields = '*')
  {
    $result = [];
    $fields = $argFields;
    if ($this -> pageSize != 0)
    {
      $this -> pagination = new Pagination($this -> getQuery($fields), $this -> DBLink);
      $rsa = $this -> pagination -> selectAll($this -> pageNum, $this -> pageSize, $fields);
      if (is_array($rsa))
      {
        foreach ($rsa as $rs)
        {
          $result[] = new Substance($rs);
        }
      }
    }
    return $result;
  }

  public function getQuery($argFields = '*')
  {
    $result = null;
    $fields = $argFields;
    $orderBy = $this -> orderBy;
    $limitStart = $this -> limitStart;
    $limitLength = $this -> limitLength;
    if (!$this -> isValidFields($fields))
    {
      throw new UnexpectedException('Unexpected argument(s)', 50801);
    }
    else if (is_null($this -> leftORMField) || is_null($this -> rightORMField))
    {
      throw new ErrorException('Join condition is missing', 50405);
    }
    else
    {
      $selectedField = [];
      $realFieldsArr = [];
      $leftORMTableName = $this -> leftORM -> getTableName();
      $rightORMTableName = $this -> rightORM -> getTableName();
      if ($fields == '*')
      {
        $allLeftORMFields = $this -> leftORM -> table -> getFields();
        $allRightORMFields = $this -> rightORM -> table -> getFields();
        foreach ($allLeftORMFields as $field)
        {
          $selectedField[] = $field;
          $realFieldsArr[] = SQLFormatter::formatName($leftORMTableName) . '.' . SQLFormatter::formatName($field);
        }
        foreach ($allRightORMFields as $field)
        {
          if (!in_array($field, $selectedField))
          {
            $selectedField[] = $field;
            $realFieldsArr[] = SQLFormatter::formatName($rightORMTableName) . '.' . SQLFormatter::formatName($field);
          }
        }
      }
      else if (is_array($fields))
      {
        foreach ($fields as $field)
        {
          if (in_array($field, $this -> leftORMFields) && in_array($field, $this -> rightORMFields))
          {
            throw new AmbiguousMatchException('Column "' . $field . '" in field list is ambiguous', 50901);
            break;
          }
          else if (!in_array($field, $this -> leftORMFields) && !in_array($field, $this -> rightORMFields))
          {
            if (!str_contains($field, '.'))
            {
              throw new NotExistException('Column "' . $field . '" does not exist', 50404);
              break;
            }
            else
            {
              $isMatched = false;
              $as = null;
              $tableName = StringHelper::getClipedString($field, '.', 'left');
              $realField = StringHelper::getClipedString($field, '.', 'right+');
              if (str_contains(strtolower($realField), ' as '))
              {
                $tempFieldString = str_ireplace(' as ', ' as ', $realField);
                $as = trim(StringHelper::getClipedString($tempFieldString, ' as ', 'right+'));
                $realField = trim(StringHelper::getClipedString($tempFieldString, ' as ', 'left'));
              }
              if ($leftORMTableName == $tableName && in_array($realField, $this -> leftORMFields))
              {
                $isMatched = true;
              }
              else if ($rightORMTableName == $tableName && in_array($realField, $this -> rightORMFields))
              {
                $isMatched = true;
              }
              if ($isMatched === false)
              {
                throw new NotExistException('Column "' . $field . '" does not exist', 50404);
                break;
              }
              else
              {
                $currentField = $as ?? $realField;
                if (!in_array($currentField, $selectedField))
                {
                  $selectedField[] = $currentField;
                  if (is_null($as))
                  {
                    $realFieldsArr[] = SQLFormatter::formatName($tableName) . '.' . SQLFormatter::formatName($realField);
                  }
                  else
                  {
                    $realFieldsArr[] = SQLFormatter::formatName($tableName) . '.' . SQLFormatter::formatName($realField) . ' as ' . SQLFormatter::formatName($as);
                  }
                }
              }
            }
          }
          else
          {
            $selectedField[] = $field;
            $realFieldsArr[] = SQLFormatter::formatName($field);
          }
        }
      }
      if (empty($realFieldsArr))
      {
        throw new UnexpectedException('Unexpected argument(s)', 50801);
      }
      else
      {
        $result = 'select ' . implode(',', $realFieldsArr) . ' from (' . $this -> leftORM -> getQuery($this -> leftORMFields) . ') as ' . SQLFormatter::formatName($leftORMTableName) . ' ' . $this -> mode . ' join (' . $this -> rightORM -> getQuery($this -> rightORMFields) . ') as ' . SQLFormatter::formatName($rightORMTableName) . ' on ' . SQLFormatter::formatName($leftORMTableName) . '.' . SQLFormatter::formatName($this -> leftORMField) . '=' . SQLFormatter::formatName($rightORMTableName) . '.' . SQLFormatter::formatName($this -> rightORMField);
        if (!empty($orderBy))
        {
          $newOrderBy = [];
          foreach ($orderBy as $item)
          {
            list($field, $descOrAsc) = $item;
            if (strtolower($field) == 'rand()')
            {
              $newOrderBy[] = 'rand() ' . $descOrAsc;
            }
            else if (in_array($field, $selectedField))
            {
              $newOrderBy[] = SQLFormatter::formatName($field) . ' ' . $descOrAsc;
            }
            else
            {
              throw new NotExistException('Column "' . $field . '" does not exist', 50404);
            }
          }
          $result .= ' order by ' . implode(',', $newOrderBy);
        }
        if (!is_null($limitStart) && !is_null($limitLength))
        {
          $result .= ' limit ' . $limitStart . ',' . $limitLength;
        }
      }
    }
    return $result;
  }

  public function join(string $argLeftORMField, string $argRightORMField, $argLeftORMFields = '*', $argRightORMFields = '*')
  {
    $leftORMField = $argLeftORMField;
    $rightORMField = $argRightORMField;
    $leftORMFields = $argLeftORMFields;
    $rightORMFields = $argRightORMFields;
    if (Validation::isEmpty($leftORMField) || Validation::isEmpty($rightORMField))
    {
      throw new UnexpectedException('Unexpected argument(s)', 50801);
    }
    else if (!$this -> isValidFields($leftORMFields) || !$this -> isValidFields($rightORMFields))
    {
      throw new UnexpectedException('Unexpected argument(s)', 50801);
    }
    else
    {
      $realLeftORMFields = [];
      $realRightORMFields = [];
      $allLeftORMFields = $this -> leftORM -> table -> getFields();
      $allRightORMFields = $this -> rightORM -> table -> getFields();
      if ($leftORMFields == '*')
      {
        $realLeftORMFields = $allLeftORMFields;
      }
      else if (is_array($leftORMFields))
      {
        foreach ($leftORMFields as $field)
        {
          if (!in_array($field, $allLeftORMFields))
          {
            throw new NotExistException('Column "' . $field . '" does not exist', 50404);
            break;
          }
          else
          {
            $realLeftORMFields[] = $field;
          }
        }
      }
      else
      {
        throw new UnexpectedException('Unexpected argument(s)', 50801);
      }
      if ($rightORMFields == '*')
      {
        $realRightORMFields = $allRightORMFields;
      }
      else if (is_array($rightORMFields))
      {
        foreach ($rightORMFields as $field)
        {
          if (!in_array($field, $allRightORMFields))
          {
            throw new NotExistException('Column "' . $field . '" does not exist', 50404);
            break;
          }
          else
          {
            $realRightORMFields[] = $field;
          }
        }
      }
      else
      {
        throw new UnexpectedException('Unexpected argument(s)', 50801);
      }
      $this -> leftORMFields = $realLeftORMFields;
      $this -> rightORMFields = $realRightORMFields;
      if (!in_array($leftORMField, $this -> leftORMFields))
      {
        throw new NotExistException('Column "' . $leftORMField . '" does not exist', 50404);
      }
      else if (!in_array($rightORMField, $this -> rightORMFields))
      {
        throw new NotExistException('Column "' . $rightORMField . '" does not exist', 50404);
      }
      else
      {
        $this -> leftORMField = $leftORMField;
        $this -> rightORMField = $rightORMField;
      }
    }
    return $this;
  }

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

  public function orderBy($argField, $argDescOrAsc = 'desc')
  {
    $field = $argField;
    $descOrAsc = $argDescOrAsc;
    if (strtolower($descOrAsc) == 'asc') $descOrAsc = 'asc';
    $this -> orderBy[] = [$field, $descOrAsc];
    return $this;
  }

  public function __construct(ORM $leftORM, ORM $rightORM, string $argMode = 'inner', string $argDBLink = null)
  {
    $mode = $argMode;
    $DBLink = $argDBLink;
    $this -> leftORM = $leftORM;
    $this -> rightORM = $rightORM;
    if (!is_null($DBLink))
    {
      $this -> DBLink = $DBLink;
    }
    $this -> db = DBFactory::getInstance($this -> DBLink);
    if (in_array($mode, $this -> modes))
    {
      $this -> mode = $mode;
    }
    else
    {
      throw new UnexpectedException('Unexpected argument(s)', 50801);
    }
  }
}