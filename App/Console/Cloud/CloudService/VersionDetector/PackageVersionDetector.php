<?php
namespace App\Console\Cloud\CloudService\VersionDetector;
use App\Common\Package\PackageRecognizer;
use App\Common\Official\OfficialCommunicator;
use App\Console\Cloud\Model;

class PackageVersionDetector
{
  private $appId;
  private $appSecret;
  private $newVersion;

  public function checkForNewVersion()
  {
    $result = false;
    $model = new Model('detect');
    $model -> where -> appid = $this -> appId;
    $rs = $model -> get();
    if (is_null($rs))
    {
      $newModel = new Model('detect');
      $newModel -> pocket -> appid = $this -> appId;
      $re = $newModel -> save();
      if (is_numeric($re))
      {
        $result = $this -> checkForNewVersionFromCloudServer();
      }
    }
    else
    {
      $detectedAt = intval($rs -> package_detected_at);
      if (time() - $detectedAt < 24 * 60 * 60)
      {
        $newVersion = intval($rs -> has_new_version_for_package);
        if ($newVersion == 0)
        {
          $result = false;
        }
        else
        {
          $result = true;
          $this -> newVersion = $newVersion;
        }
      }
      else
      {
        $result = $this -> checkForNewVersionFromCloudServer();
      }
    }
    return $result;
  }

  public function checkForNewVersionFromCloudServer()
  {
    $result = false;
    $model = new Model('detect');
    $model -> where -> appid = $this -> appId;
    $rs = $model -> get();
    if (!is_null($rs))
    {
      $model -> pocket -> package_detected_at = time();
      $newVersion = $this -> getNewVersionFromCloudServer();
      if (!is_null($newVersion))
      {
        $result = true;
        $this -> newVersion = $newVersion;
        $model -> pocket -> has_new_version_for_package = $newVersion;
      }
      $model -> save();
    }
    return $result;
  }

  public function getNewVersion()
  {
    return $this -> newVersion;
  }

  public function getNewVersionFromCloudServer()
  {
    $result = null;
    $packageRecognizer = new PackageRecognizer();
    if ($packageRecognizer -> hasPackage())
    {
      $packageId = $packageRecognizer -> packageId;
      $packageVersion = $packageRecognizer -> packageVersion;
      if (is_int($packageId) && is_int($packageVersion))
      {
        $officialCommunicator = new OfficialCommunicator($this -> appId, $this -> appSecret);
        $officialCommunicator -> service_id = 'B0001';
        $officialCommunicator -> package_id = $packageId;
        $officialCommunicator -> version = $packageVersion;
        $apiResult = $officialCommunicator -> getApiResult();
        if (!is_null($apiResult))
        {
          if ($apiResult -> code == 1)
          {
            $result = $apiResult -> new_version;
          }
        }
      }
    }
    return $result;
  }

  public function reset()
  {
    $model = new Model('detect');
    $model -> where -> appid = $this -> appId;
    $model -> pocket -> package_detected_at = 0;
    $model -> pocket -> has_new_version_for_package = 0;
    return $model -> save();
  }

  public function __construct(int $argAppId, string $argAppSecret)
  {
    $this -> appId = $argAppId;
    $this -> appSecret = $argAppSecret;
  }
}