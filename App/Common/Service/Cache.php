<?php
namespace App\Common\Service;
use Jtbc\Service;
use Jtbc\Cache\FileCache;
use Jtbc\Config\ConfigReader;
use Jtbc\Exception\NotExistException;
use App\Universal\Plugin\Plugin;
use Web\Universal\Plugin as WebPlugin;
use Config\App\Universal\Plugin as PluginConfig;

class Cache extends Service
{
  public function getInstance()
  {
    $pluginCache = null;
    $configReader = new ConfigReader(PluginConfig::class);
    $pluginCacheValue = $configReader -> cache;
    if (!is_null($pluginCacheValue))
    {
      $plugin = new Plugin($pluginCacheValue);
      if ($plugin -> isExists() && $plugin -> isEnabled())
      {
        $pluginCacheClass = WebPlugin::class . '\\' . $plugin -> getEntrance();
        if (class_exists($pluginCacheClass))
        {
          $pluginCache = new $pluginCacheClass();
        }
        else
        {
          throw new NotExistException('Class "' . $pluginCacheClass . '" does not exist', 50404);
        }
      }
    }
    return $pluginCache ?? new FileCache();
  }
}