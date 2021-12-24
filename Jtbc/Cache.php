<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;

interface Cache
{
  public function exists($argName);
  public function get($argName);
  public function getAll();
  public function put($argName, $argData, $argExpires = null);
  public function remove($argName);
  public function removeAll();
  public function removeByKey($argKey, $argMode = 0);
}