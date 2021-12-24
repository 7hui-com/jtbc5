<?php
namespace App\Universal\Upload;
use Jtbc\DI;
use Jtbc\Config\ConfigReader;
use Jtbc\Exception\NotExistException;
use App\Universal\Plugin\Plugin;
use App\Universal\Upload\LocalUploader\LocalUploader;
use Web\Universal\Plugin as WebPlugin;
use Config\App\Universal\Plugin as PluginConfig;

class UploaderFactory
{
  public static function getInstance(DI $di, string $argGenre, $argNeedUploadId = true)
  {
    $genre = $argGenre;
    $needUploadId = $argNeedUploadId;
    $pluginUploader = null;
    $configReader = new ConfigReader(PluginConfig::class);
    $pluginUploaderValue = $configReader -> uploader;
    if (!is_null($pluginUploaderValue))
    {
      $plugin = new Plugin($pluginUploaderValue);
      if ($plugin -> isExists() && $plugin -> isEnabled())
      {
        $pluginUploaderClass = WebPlugin::class . '\\' . $plugin -> getEntrance();
        if (class_exists($pluginUploaderClass))
        {
          $pluginUploader = new $pluginUploaderClass($di, $genre, $needUploadId);
        }
        else
        {
          throw new NotExistException('Class "' . $pluginUploaderClass . '" does not exist', 50404);
        }
      }
    }
    return $pluginUploader ?? new LocalUploader($di, $genre, $needUploadId);
  }
}