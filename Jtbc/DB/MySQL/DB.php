<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\DB\MySQL;
use PDO;
use PDOException;
use Jtbc\DB as DBInterface;

class DB implements DBInterface
{
  private $conn;
  private $dbHost;
  private $dbDatabase;
  private $dbUsername;
  private $dbPassword;
  private $dbCharset;
  private $loadedTableInfo = [];
  private $queryLog = [];
  public $errCode = 0;
  public $errMessage;
  public $lastInsertId;

  private function init()
  {
    try
    {
      $dsn = 'mysql:host=' . $this -> dbHost;
      if (!empty($this -> dbDatabase)) $dsn .= ';dbname=' . $this -> dbDatabase;
      $options = [
        PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES ' . $this -> dbCharset,
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION,
      ];
      $this -> conn = new PDO($dsn, $this -> dbUsername, $this -> dbPassword, $options);
    }
    catch (PDOException $e)
    {
      $this -> errCode = 40004;
      $this -> errMessage = $e -> getMessage();
    }
  }

  private function formatName($argName)
  {
    $name = $argName;
    if (is_numeric($name) || is_string($name))
    {
      $name = '`' . str_replace('`', '``', $name) . '`';
    }
    return $name;
  }

  public function fetch($argSQL)
  {
    $sql = $argSQL;
    $rq = $this -> query($sql);
    $rs = $rq -> fetch(PDO::FETCH_ASSOC);
    return $rs;
  }

  public function fetchAll($argSQL)
  {
    $sql = $argSQL;
    $rq = $this -> query($sql);
    $rsAll = $rq -> fetchAll(PDO::FETCH_ASSOC);
    return $rsAll;
  }

  public function query($argSQL)
  {
    $sql = $argSQL;
    $this -> queryLog[] = $sql;
    $query = $this -> conn -> query($sql);
    return $query;
  }

  public function exec($argSQL)
  {
    $sql = $argSQL;
    $this -> queryLog[] = $sql;
    $exec = $this -> conn -> exec($sql);
    if (substr($sql, 0, 6) == 'insert')
    {
      $this -> lastInsertId = $this -> conn -> lastInsertId();
    }
    return $exec;
  }

  public function transaction(array $argSQLList)
  {
    $bool = false;
    $sqlList = $argSQLList;
    if (!empty($sqlList))
    {
      $succeed = true;
      $this -> exec('START TRANSACTION');
      foreach ($sqlList as $sql)
      {
        if (!is_numeric($this -> exec($sql)))
        {
          $succeed = false;
          break;
        }
      }
      if ($succeed == true)
      {
        $bool = true;
        $this -> exec('COMMIT');
      }
      else
      {
        $this -> exec('ROLLBACK');
      }
    }
    return $bool;
  }

  public function cloneTable($argTable, $argTargetTable)
  {
    $bool = false;
    $table = $argTable;
    $targetTable = $argTargetTable;
    if ($this -> hasTable($table))
    {
      $exec = $this -> exec('create table ' . $this -> formatName($targetTable) . ' like ' . $this -> formatName($table));
      if (is_numeric($exec))
      {
        $bool = true;
      }
    }
    return $bool;
  }

  public function dropTable($argTable)
  {
    $bool = false;
    $table = $argTable;
    if ($this -> hasTable($table))
    {
      $exec = $this -> exec('drop table ' . $this -> formatName($table));
      if (is_numeric($exec))
      {
        $bool = true;
      }
    }
    return $bool;
  }

  public function hasTable($argTable)
  {
    $bool = false;
    $table = $argTable;
    if (is_string($table) && trim($table) != '')
    {
      $rs = $this -> fetch('show tables like \'' . addslashes($table) . '\'');
      if (is_array($rs)) $bool = true;
    }
    return $bool;
  }

  public function getTableInfo($argTable)
  {
    $table = $argTable;
    $tableInfo = null;
    if (array_key_exists($table, $this -> loadedTableInfo))
    {
      $tableInfo = $this -> loadedTableInfo[$table];
    }
    else
    {
      if ($this -> hasTable($table))
      {
        $tableInfo = $this -> fetchAll('show full columns from ' . $this -> formatName($table));
        foreach ($tableInfo as $i => $item)
        {
          $fieldType = $item['Type'];
          $fieldNewType = $fieldType;
          $fieldLength = null;
          $fieldBracketsPos1 = strpos($fieldType, '(');
          $fieldBracketsPos2 = strpos($fieldType, ')');
          if (is_numeric($fieldBracketsPos1) && is_numeric($fieldBracketsPos2))
          {
            $fieldNewType = substr($fieldType, 0, $fieldBracketsPos1);
            $fieldTempLength = substr($fieldType, $fieldBracketsPos1 + 1, $fieldBracketsPos2 - $fieldBracketsPos1 - 1);
            $fieldLength = is_numeric($fieldTempLength)? intval($fieldTempLength): null;
          }
          $item['Type'] = $fieldNewType;
          $item['Length'] = $fieldLength;
          $item['Original_Type'] = $fieldType;
          $tableInfo[$i] = array_change_key_case($item);
        }
        $this -> loadedTableInfo[$table] = $tableInfo;
      }
    }
    return $tableInfo;
  }

  public function getQueryLog()
  {
    return $this -> queryLog;
  }

  public function getQueryCount()
  {
    return count($this -> getQueryLog());
  }

  public function getVersion()
  {
    $result = null;
    $rs = $this -> fetch('select version() as version');
    if (is_array($rs))
    {
      $result = $rs['version'];
    }
    return $result;
  }

  public function errorCode()
  {
    return $this -> conn -> errorCode();
  }

  public function errorInfo()
  {
    return $this -> conn -> errorInfo();
  }

  public function __construct($argHost, $argDatabase, $argUsername, $argPassword, $argCharset = 'utf8mb4')
  {
    $this -> dbHost = $argHost;
    $this -> dbDatabase = $argDatabase;
    $this -> dbUsername = $argUsername;
    $this -> dbPassword = $argPassword;
    $this -> dbCharset = $argCharset;
    $this -> init();
  }
}