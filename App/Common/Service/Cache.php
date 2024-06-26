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
    $result = null;
    $configReader = new ConfigReader(PluginConfig::class);
    $pluginCacheValue = $configReader -> cache;
    if (!is_null($pluginCacheValue))
    {
      $plugin = new Plugin($pluginCacheValue);
      if ($plugin -> isExists() && $plugin -> isEnabled())
      {
        $pluginCache = WebPlugin::class . '\\' . $plugin -> getEntrance();
        if (class_exists($pluginCache))
        {
          $result = new $pluginCache();
        }
        else
        {
          throw new NotExistException('Class "' . $pluginCache . '" does not exist', 50404);
        }
      }
    }
    return $result ?? new FileCache();
  }
}