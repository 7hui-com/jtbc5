<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Diplomatist;
use Jtbc\Config;

class IPManager
{
  public static function handle(callable $handler, $diplomat)
  {
    $result = function() use ($handler, $diplomat)
    {
      $ipAllow = true;
      $ipAddress = $diplomat -> getParam('ip_address');
      $allowIp = Config::read(__CLASS__, 'allow_ip');
      $denyIp = Config::read(__CLASS__, 'deny_ip');
      if (is_array($allowIp))
      {
        $ipAllow = false;
        if (in_array($ipAddress, $allowIp)) $ipAllow = true;
      }
      if (is_array($denyIp))
      {
        if (in_array($ipAddress, $denyIp)) $ipAllow = false;
      }
      if ($ipAllow == false)
      {
        $diplomat -> di -> response -> setStatusCode(403);
      }
      else
      {
        return call_user_func($handler);
      }
    };
    return $result;
  }
}