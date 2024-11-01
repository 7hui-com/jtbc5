<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;

interface Request
{
  public function get($argName = null);
  public function post($argName = null);
  public function files($argName = null);
  public function server($argName = null);
  public function isHTTPS();
  public function getPathInfo();
  public function getIPAddress(bool $argIPv4Only = false);
  public function getRealScriptName();
}