<?php
namespace App\Console\Cloud\CloudService\VersionDetector;
use App\Common\Official\OfficialCommunicator;
use App\Universal\Plugin\PluginRecognizer;

class PluginVersionDetector
{
  private $appId;
  private $appSecret;
  private $genre;

  public function getNewVersionFromCloudServer()
  {
    $result = null;
    $pluginRecognizer = new PluginRecognizer($this -> genre);
    $pluginId = $pluginRecognizer -> pluginId;
    $pluginVersion = $pluginRecognizer -> pluginVersion;
    if (is_int($pluginId) && is_int($pluginVersion))
    {
      $officialCommunicator = new OfficialCommunicator($this -> appId, $this -> appSecret);
      $officialCommunicator -> service_id = 'B0003';
      $officialCommunicator -> plugin_id = $pluginId;
      $officialCommunicator -> version = $pluginVersion;
      $apiResult = $officialCommunicator -> getApiResult();
      if (!is_null($apiResult))
      {
        if ($apiResult -> code == 1)
        {
          $result = $apiResult -> new_version;
        }
      }
    }
    return $result;
  }

  public function __construct(int $argAppId, string $argAppSecret, string $argGenre)
  {
    $this -> appId = $argAppId;
    $this -> appSecret = $argAppSecret;
    $this -> genre = $argGenre;
  }
}