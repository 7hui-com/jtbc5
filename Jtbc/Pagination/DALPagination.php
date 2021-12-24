<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Pagination;
use Jtbc\DAL;

class DALPagination extends Pagination
{
  private $dal;
  public $pageNum = null;
  public $pageSize = null;
  public $pageCount = null;
  public $recordCount = null;

  public function selectAll(int $argPageNum = 1, int $argPageSize = 20, $argField = '*')
  {
    $pageNum = $argPageNum;
    $pageSize = $argPageSize;
    $field = $argField;
    if ($pageNum < 1) $pageNum = 1;
    if ($pageSize < 1) $pageSize = 1;
    $this -> pageNum = $pageNum;
    $this -> pageSize = $pageSize;
    $recordCount = $this -> recordCount = $this -> dal -> getRsCount();
    $pageCount = $this -> pageCount = ceil($recordCount / $pageSize);
    $this -> dal -> limit(($pageNum - 1) * $pageSize, $pageSize);
    $result = $this -> dal -> selectAll($field);
    return $result;
  }

  public function __construct(DAL $dal)
  {
    $this -> dal = $dal;
  }
}