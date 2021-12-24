<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;
use Jtbc\DB\DBFactory;
use Jtbc\DAL\SQLBuilder;
use Jtbc\Exception\EmptyException;

class DAL
{
  private $db;
  private $table;
  private $SQLBuilder;
  public $lastInsertId;

  public function getRsCount()
  {
    $rsCount = -1;
    $rs = $this -> select('count(*) as rs_count');
    if (is_array($rs)) $rsCount = intval($rs['rs_count']);
    return $rsCount;
  }

  public function select($argFields = '*')
  {
    $result = null;
    $fields = $argFields;
    $db = $this -> db;
    $selectSQL = $this -> SQLBuilder -> getSelectSQL($fields);
    $result = $db -> fetch($selectSQL);
    return $result;
  }

  public function selectAll($argFields = '*')
  {
    $result = null;
    $fields = $argFields;
    $db = $this -> db;
    $selectSQL = $this -> SQLBuilder -> getSelectSQL($fields);
    $result = $db -> fetchAll($selectSQL);
    return $result;
  }

  public function insert($argSource)
  {
    $result = false;
    $source = $argSource;
    $db = $this -> db;
    $insertSQL = $this -> SQLBuilder -> getInsertSQL($source);
    if (!Validation::isEmpty($insertSQL))
    {
      $result = $db -> exec($insertSQL);
      $this -> lastInsertId = $db -> lastInsertId;
    }
    return $result;
  }

  public function update($argSource)
  {
    $result = false;
    $source = $argSource;
    $db = $this -> db;
    $updateSQL = $this -> SQLBuilder -> getUpdateSQL($source);
    if (!Validation::isEmpty($updateSQL)) $result = $db -> exec($updateSQL);
    return $result;
  }

  public function delete(bool $argPhysically = false)
  {
    $result = false;
    $physically = $argPhysically;
    $db = $this -> db;
    if ($physically == true)
    {
      $deleteSQL = $this -> SQLBuilder -> getDeleteSQL();
      if (!Validation::isEmpty($deleteSQL)) $result = $db -> exec($deleteSQL);
    }
    else
    {
      $updateSQL = $this -> SQLBuilder -> getUpdateSQL(['deleted' => 1]);
      if (!Validation::isEmpty($updateSQL)) $result = $db -> exec($updateSQL);
    }
    return $result;
  }

  public function truncate(bool $argAreYouSure = false)
  {
    $result = false;
    $areYouSure = $argAreYouSure;
    if ($areYouSure == true)
    {
      $db = $this -> db;
      $truncateSQL = $this -> SQLBuilder -> getTruncateSQL();
      if (!Validation::isEmpty($truncateSQL)) $result = $db -> exec($truncateSQL);
    }
    return $result;
  }

  public function __call($argName, $args) 
  {
    $result = null;
    $name = $argName;
    if (is_callable([$this -> SQLBuilder, $name]))
    {
      $result = call_user_func_array([$this -> SQLBuilder, $name], $args);
    }
    return $result;
  }

  public function __get($argName)
  {
    $name = $argName;
    return $this -> SQLBuilder -> {$name};
  }

  public function __set($argName, $argValue)
  {
    $name = $argName;
    $value = $argValue;
    $this -> SQLBuilder -> {$name} = $value;
  }

  public function __construct(string $argTable, string $argDBLink = null, bool $argAutoFilter = true)
  {
    $table = $argTable;
    $DBLink = $argDBLink;
    $autoFilter = $argAutoFilter;
    $this -> db = DBFactory::getInstance($DBLink);
    if (Validation::isEmpty($table))
    {
      throw new EmptyException('Table can not be empty', 50204);
    }
    else
    {
      $this -> table = $table;
      $this -> SQLBuilder = new SQLBuilder($this -> db, $this -> table, $autoFilter);
    }
  }
}