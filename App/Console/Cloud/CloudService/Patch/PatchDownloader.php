<?php
namespace App\Console\Cloud\CloudService\Patch;
use Jtbc\Path;
use Jtbc\Substance;
use Jtbc\HTTP\SimpleCURL;
use App\Common\Official\OfficialCommunicator;
use App\Common\Premium\PremiumAccountLoader;
use App\Common\Maintenance\Migrator\ConfigReader;

abstract class PatchDownloader
{
  private $version;
  protected $typeName;
  protected $serialId;
  protected $serviceId;

  public function download()
  {
    $code = 0;
    $zipPath = null;
    $premiumAccount = PremiumAccountLoader::getInstance();
    if ($premiumAccount -> isValidCertificate())
    {
      $appId = $premiumAccount -> certificate -> getAppId();
      $appSecret = $premiumAccount -> certificate -> getAppSecret();
      if ($premiumAccount -> certificate -> isExpired())
      {
        $code = 4002;
      }
      else
      {
        $currentVersion = $this -> version;
        $officialCommunicator = new OfficialCommunicator($appId, $appSecret);
        $officialCommunicator -> service_id = $this -> serviceId;
        if (is_int($this -> serialId))
        {
          $officialCommunicator -> serial_id = $this -> serialId;
        }
        $officialCommunicator -> version = $currentVersion;
        $apiResult = $officialCommunicator -> getApiResult();
        if (!is_null($apiResult))
        {
          if ($apiResult -> code == 1)
          {
            $newVersion = $apiResult -> new_version;
            $downloadURL = $apiResult -> download_url;
            $zipPath = $this -> typeName;
            if (is_int($this -> serialId))
            {
              $zipPath .= '/' . $this -> serialId;
            }
            $zipPath .= '/' . $currentVersion . 'to' . $newVersion . '.zip';
            $zipFullPath = ConfigReader::getBaseDir() . '/' . $zipPath;
            $targetPath = Path::getActualRoute($zipFullPath);
            $targetFolderPath = pathinfo($targetPath, PATHINFO_DIRNAME);
            if (!is_dir($targetFolderPath) && !@mkdir($targetFolderPath, 0777, true))
            {
              $code = 4012;
            }
            else
            {
              $simpleCURL = new SimpleCURL($downloadURL, 120);
              $curlResult = $simpleCURL -> get();
              if ($curlResult -> is_succeed)
              {
                if (@file_put_contents($targetPath, $curlResult -> content))
                {
                  $code = 1;
                }
                else
                {
                  $code = 4014;
                }
              }
              else
              {
                $code = 4013;
              }
            }
          }
          else
          {
            $code = 4011;
          }
        }
        else
        {
          $code = 4444;
        }
      }
    }
    else
    {
      $code = 4001;
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> zip_path = $zipPath;
    return $ss;
  }

  public function __construct(int $argVersion)
  {
    $this -> version = $argVersion;
  }
}