<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;
use Jtbc\Pagination\DALPagination;
use Jtbc\Pagination\SQLPagination;
use Jtbc\Exception\NotSupportedException;

class Pagination
{
  private $instance;

  public function __get($argName)
  {
    $name = $argName;
    return $this -> instance -> {$name};
  }

  public function __call($argName, $args) 
  {
    $result = null;
    $name = $argName;
    if (is_callable([$this -> instance, $name]))
    {
      $result = call_user_func_array([$this -> instance, $name], $args);
    }
    return $result;
  }

  public function __construct($argDALOrSQL, $argSQLModeDBLink = null)
  {
    $DALOrSQL = $argDALOrSQL;
    $SQLModeDBLink = $argSQLModeDBLink;
    if (is_string($DALOrSQL))
    {
      $SQL = $DALOrSQL;
      $this -> instance = new SQLPagination($SQL, $SQLModeDBLink);
    }
    else if ($DALOrSQL instanceof DAL)
    {
      $DAL = $DALOrSQL;
      $this -> instance = new DALPagination($DAL);
    }
    else
    {
      throw new NotSupportedException('Parameter is not supported', 50415);
    }
  }
}