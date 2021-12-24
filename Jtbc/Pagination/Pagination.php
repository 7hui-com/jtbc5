<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Pagination;

abstract class Pagination
{
  public $pageNum;
  public $pageSize;
  public $pageCount;
  public $recordCount;

  public function getVars()
  {
    return [
      'pagination-page-num' => $this -> pageNum,
      'pagination-page-size' => $this -> pageSize,
      'pagination-page-count' => $this -> pageCount,
      'pagination-record-count' => $this -> recordCount,
    ];
  }
}