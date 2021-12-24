<?php
namespace App\Console\Cloud\CloudService\VersionDetector;
use App\Common\Module\ModuleRecognizer;
use App\Common\Official\OfficialCommunicator;

class ModuleVersionDetector
{
  private $appId;
  private $appSecret;
  private $genre;

  public function getNewVersionFromCloudServer()
  {
    $result = null;
    $moduleRecognizer = new ModuleRecognizer($this -> genre);
    $moduleId = $moduleRecognizer -> moduleId;
    $moduleVersion = $moduleRecognizer -> moduleVersion;
    if (is_int($moduleId) && is_int($moduleVersion))
    {
      $officialCommunicator = new OfficialCommunicator($this -> appId, $this -> appSecret);
      $officialCommunicator -> service_id = 'B0002';
      $officialCommunicator -> module_id = $moduleId;
      $officialCommunicator -> version = $moduleVersion;
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