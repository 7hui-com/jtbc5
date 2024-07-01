<?php
namespace App\Common\Service;
use Jtbc\Service;
use Jtbc\Config\ConfigReader;
use Jtbc\Exception\NotExistException;
use App\Universal\Plugin\Plugin;
use Web\Universal\Plugin as WebPlugin;
use Config\App\Universal\Plugin as PluginConfig;

class SMS extends Service
{
  public function getInstance()
  {
    $result = null;
    $configReader = new ConfigReader(PluginConfig::class);
    $pluginSMSProviderValue = $configReader -> sms_provider;
    if (!is_null($pluginSMSProviderValue))
    {
      $plugin = new Plugin($pluginSMSProviderValue);
      if ($plugin -> isExists() && $plugin -> isEnabled())
      {
        $pluginSMSProvider = WebPlugin::class . '\\' . $plugin -> getEntrance();
        if (class_exists($pluginSMSProvider))
        {
          $result = new $pluginSMSProvider();
        }
        else
        {
          throw new NotExistException('Class "' . $pluginSMSProvider . '" does not exist', 50404);
        }
      }
    }
    return $result;
  }
}