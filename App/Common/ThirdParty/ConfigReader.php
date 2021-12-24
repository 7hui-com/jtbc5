<?php
namespace App\Common\ThirdParty;
use Config\App\Common\ThirdParty\ThirdPartyConfig;

class ConfigReader
{
  public static function getBaseDir()
  {
    return ThirdPartyConfig::BASE_DIR;
  }
}