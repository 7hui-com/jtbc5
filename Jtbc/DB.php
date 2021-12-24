<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;

interface DB
{
  public function fetch($argSQL);
  public function fetchAll($argSQL);
  public function query($argSQL);
  public function exec($argSQL);
  public function transaction(array $argSQLList);
  public function cloneTable($argTable, $argTargetTable);
  public function dropTable($argTable);
  public function hasTable($argTable);
  public function getTableInfo($argTable);
  public function getQueryLog();
  public function getQueryCount();
  public function getVersion();
  public function errorCode();
  public function errorInfo();
}