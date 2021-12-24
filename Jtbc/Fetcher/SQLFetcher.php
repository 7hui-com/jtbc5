<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Fetcher;
use Jtbc\Jtbc;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\DAL\DirectDB;

class SQLFetcher
{
  public static function fetch(array $argParam)
  {
    $result = [];
    $param = $argParam;
    $ss = new Substance($param);
    $sql = $ss -> sql;
    if (!Validation::isEmpty($sql))
    {
      $result = DirectDB::selectAll($sql, $ss -> DBLink);
    }
    return $result;
  }
}