<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Service;
use Jtbc\Config;

class AutoProvider
{
  public static function getClass($argServiceName)
  {
    $result = null;
    $serviceName = $argServiceName;
    $namespace = Config::get('Service/AutoProvider', 'namespace');
    if (is_string($namespace))
    {
      if (is_string($serviceName) && !str_contains($serviceName, chr(92)))
      {
        $serviceClass = $namespace . chr(92) . ucfirst($serviceName);
        if (class_exists($serviceClass))
        {
          $result = $serviceClass;
        }
      }
    }
    return $result;
  }
}