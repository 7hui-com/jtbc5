<?php
namespace App\Common\Maintenance\Migrator;
use Config\App\Common\Maintenance\Migrator as Config;

class ConfigReader
{
  public static function getBaseDir()
  {
    return Config::BASE_DIR;
  }
}