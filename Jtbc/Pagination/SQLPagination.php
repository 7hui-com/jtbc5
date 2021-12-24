<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Pagination;
use Jtbc\DAL\DirectDB;

class SQLPagination extends Pagination
{
  private $sql;
  private $DBLink;
  public $pageNum = null;
  public $pageSize = null;
  public $pageCount = null;
  public $recordCount = null;

  public function selectAll(int $argPageNum = 1, int $argPageSize = 20)
  {
    $pageNum = $argPageNum;
    $pageSize = $argPageSize;
    if ($pageNum < 1) $pageNum = 1;
    if ($pageSize < 1) $pageSize = 1;
    $this -> pageNum = $pageNum;
    $this -> pageSize = $pageSize;
    $recordCount = $this -> recordCount = DirectDB::getRsCount($this -> sql, $this -> DBLink);
    $pageCount = $this -> pageCount = ceil($recordCount / $pageSize);
    $newSQL = $this -> sql . ' limit ' . ($pageNum - 1) * $pageSize . ',' . $pageSize;
    $result = DirectDB::selectAll($newSQL, $this -> DBLink);
    return $result;
  }

  public function __construct(string $argSQL, $argDBLink = null)
  {
    $this -> sql = $argSQL;
    $this -> DBLink = $argDBLink;
  }
}