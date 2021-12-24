<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\DAL;
use Jtbc\DB\DBFactory;

class DirectDB
{
  public static $lastInsertId;

  public static function exec($argSQL, $argDBLink = null)
  {
    $db = DBFactory::getInstance($argDBLink);
    $result = $db -> exec($argSQL);
    self::$lastInsertId = $db -> lastInsertId;
    return $result;
  }

  public static function getRsCount($argSQL, $argDBLink = null)
  {
    $result = -1;
    $db = DBFactory::getInstance($argDBLink);
    $rs = $db -> fetch('select count(*) as rs_count from (' . $argSQL . ') as jtbc_temp_table');
    if (is_array($rs))
    {
      $result = intval($rs['rs_count']);
    }
    return $result;
  }

  public static function select($argSQL, $argDBLink = null)
  {
    $db = DBFactory::getInstance($argDBLink);
    $result = $db -> fetch($argSQL);
    return $result;
  }

  public static function selectAll($argSQL, $argDBLink = null)
  {
    $db = DBFactory::getInstance($argDBLink);
    $result = $db -> fetchAll($argSQL);
    return $result;
  }

  public static function transaction(array $argSQLList, $argDBLink = null)
  {
    $db = DBFactory::getInstance($argDBLink);
    $result = $db -> transaction($argSQLList);
    return $result;
  }
}