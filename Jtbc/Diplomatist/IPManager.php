<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Diplomatist;
use Config\Diplomatist\IPManager as Config;

class IPManager
{
  public static function handle(callable $handler, $diplomat)
  {
    $result = function() use ($handler, $diplomat)
    {
      $ipAllow = true;
      $ipAddress = $diplomat -> getParam('ip_address');
      if (is_array(Config::ALLOW_IP))
      {
        $ipAllow = false;
        if (in_array($ipAddress, Config::ALLOW_IP)) $ipAllow = true;
      }
      if (is_array(Config::DENY_IP))
      {
        if (in_array($ipAddress, Config::DENY_IP)) $ipAllow = false;
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