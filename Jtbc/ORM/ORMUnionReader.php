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
use Jtbc\Exception\EmptyException;
use Jtbc\Exception\ErrorException;
use Jtbc\Exception\NotExistException;
use Jtbc\Exception\UnexpectedException;

class ORMUnionReader
{
  private $db;
  private $orderBy = [];
  private $limitStart = null;
  private $limitLength = null;
  private $queue = [];
  protected $DBLink;
  public $pagination;
  public $pageNum = 0;
  public $pageSize = 0;

  private function getActualField(string $argField)
  {
    $result = $argField;
    if (str_contains(strtolower($result), ' as '))
    {
      $tempFieldString = str_ireplace(' as ', ' as ', $result);
      $result = trim(StringHelper::getClipedString($tempFieldString, ' as ', 'right+'));
    }
    return $result;
  }

  private function getActualFields(array $argFields)
  {
    $result = [];
    $fields = $argFields;
    if (!empty($fields))
    {
      foreach ($fields as $key => $field)
      {
        $result[$key] = $this -> getActualField($field);
      }
    }
    return $result;
  }

  private function isSameFields(array $argFields)
  {
    $result = false;
    $fields = $argFields;
    if (!empty($fields))
    {
      $result = true;
      $actualFields = $this -> getActualFields($fields);
      $actualFieldsCount = count($actualFields);
      foreach ($this -> queue as $item)
      {
        $itemFields = $item['fields'];
        if (!is_null($itemFields))
        {
          if (count($itemFields) == $actualFieldsCount)
          {
            foreach ($itemFields as $key => $itemField)
            {
              $itemActualField = $this -> getActualField($itemField);
              if (!(array_key_exists($key, $actualFields) && $actualFields[$key] == $itemActualField))
              {
                $result = false;
                break;
              }
            }
          }
          else
          {
            $result = false;
          }
          if ($result !== true)
          {
            break;
          }
        }
      }
    }
    return $result;
  }

  private function isValidFields(array $argFields)
  {
    $result = false;
    $fields = $argFields;
    if (Validation::isArrayList($fields))
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

  public function add(string $argName, ORM $ORM, array $argFields = null)
  {
    $this -> queue[$argName] = ['instance' => $ORM, 'fields' => $argFields];
    return $this;
  }

  public function get(array $argFields)
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

  public function getAll(array $argFields)
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

  public function getOne(array $argFields)
  {
    $result = [];
    $fields = $argFields;
    $rs = $this -> get($fields);
    if (!is_null($rs))
    {
      $result[] = $rs;
    }
    return $result;
  }

  public function getCount(array $argFields)
  {
    return DirectDB::getRsCount($this -> getQuery($argFields), $this -> DBLink);
  }

  public function getPage(array $argFields)
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

  public function getQuery(array $argFields)
  {
    $result = null;
    $fields = $argFields;
    $orderBy = $this -> orderBy;
    $limitStart = $this -> limitStart;
    $limitLength = $this -> limitLength;
    if (empty($this -> queue))
    {
      throw new EmptyException('Queue is empty', 50204);
    }
    else if (!$this -> isValidFields($fields))
    {
      throw new UnexpectedException('Unexpected argument(s)', 50801);
    }
    else if (!$this -> isSameFields($fields))
    {
      throw new ErrorException('Different column(s)', 50405);
    }
    else
    {
      $queryQueue = [];
      $actualFields = $this -> getActualFields($fields);
      foreach ($this -> queue as $name => $item)
      {
        $currentFields = $item['fields'];
        $currentInstance = $item['instance'];
        $currentQuery = $currentInstance -> getQuery($currentFields ?? $fields);
        if (!in_array('un_name', $actualFields))
        {
          $tempLeftString = StringHelper::getClipedString($currentQuery, chr(32), 'left');
          $tempRightString = StringHelper::getClipedString($currentQuery, chr(32), 'right+');
          if (strtolower($tempLeftString) == 'select')
          {
            $currentQuery = 'select \'' . addslashes($name) . '\' as ' . SQLFormatter::formatName('un_name') . ',' . $tempRightString;
          }
        }
        $queryQueue[] = $currentQuery;
      }
      $result = 'select * from (' . implode(' union all ', $queryQueue) . ') as jtbc_temp_union_table';
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
          else if (in_array($field, $actualFields))
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
    return $result;
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

  public function __construct(string $argDBLink = null)
  {
    $DBLink = $argDBLink;
    if (!is_null($DBLink))
    {
      $this -> DBLink = $DBLink;
    }
    $this -> db = DBFactory::getInstance($this -> DBLink);
  }
}