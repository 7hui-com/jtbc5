<?php
namespace App\Common\Official;
use Config\App\Common\Official\OfficialConfig;

class ConfigReader
{
  public static function getPublicKeyPath()
  {
    return OfficialConfig::JTBC_PUBLIC_KEY_PATH;
  }

  public static function getCloudServiceURL()
  {
    return OfficialConfig::OFFICIAL_CLOUD_SERVICE_URL;
  }
}