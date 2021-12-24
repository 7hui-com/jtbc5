<?php
namespace App\Console\Cloud\CloudService\VersionDetector;
use Jtbc\Jtbc;
use Jtbc\Kernel;
use Jtbc\Converter;
use Jtbc\Exception\OutOfRangeException;
use App\Common\Official\OfficialCommunicator;
use App\Console\Cloud\Model;

class KernelVersionDetector
{
  private $appId;
  private $appSecret;
  private $version;
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
      $detectedAt = intval($rs -> kernel_detected_at);
      if (time() - $detectedAt < 24 * 60 * 60)
      {
        $newVersion = intval($rs -> has_new_version_for_kernel);
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
      $model -> pocket -> kernel_detected_at = time();
      $newVersion = $this -> getNewVersionFromCloudServer();
      if (!is_null($newVersion))
      {
        $result = true;
        $this -> newVersion = $newVersion;
        $model -> pocket -> has_new_version_for_kernel = $newVersion;
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
    $officialCommunicator = new OfficialCommunicator($this -> appId, $this -> appSecret);
    $officialCommunicator -> service_id = 'B0000';
    $officialCommunicator -> version = $this -> version;
    $apiResult = $officialCommunicator -> getApiResult();
    if (!is_null($apiResult))
    {
      if ($apiResult -> code == 1)
      {
        $result = $apiResult -> new_version;
      }
    }
    return $result;
  }

  public function reset()
  {
    $model = new Model('detect');
    $model -> where -> appid = $this -> appId;
    $model -> pocket -> kernel_detected_at = 0;
    $model -> pocket -> has_new_version_for_kernel = 0;
    return $model -> save();
  }

  public function __construct(int $argAppId, string $argAppSecret)
  {
    $this -> appId = $argAppId;
    $this -> appSecret = $argAppSecret;
    $this -> version = Kernel::getVersion();
    if ($this -> version < 5000)
    {
      throw new OutOfRangeException('Current version "' . Converter::convertToVersionString($this -> version) . '" is out of range', 50416);
    }
  }
}