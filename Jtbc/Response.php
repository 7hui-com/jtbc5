<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;

interface Response
{
  public function getStatusCode();
  public function setStatusCode(int $argStatusCode);
  public function send($argBody = null);
}