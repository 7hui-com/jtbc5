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
    $namespace = Config::read(__CLASS__, 'namespace');
    if (is_string($namespace))
    {
      if (is_string($serviceName) && !str_contains($serviceName, chr(92)))
      {
        $priorServiceClass = $namespace . chr(92) . ucfirst($serviceName);
        $minorServiceClass = $namespace . chr(92) . strtoupper($serviceName);
        if (class_exists($priorServiceClass))
        {
          $result = $priorServiceClass;
        }
        else if (class_exists($minorServiceClass))
        {
          $result = $minorServiceClass;
        }
      }
    }
    return $result;
  }
}