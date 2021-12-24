<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;

abstract class Service
{
  protected $di;

  abstract public function getInstance();

  public function __construct(DI $di)
  {
    $this -> di = $di;
  }
}