<?php
namespace App\Common\Maintenance\Migrator;
use Jtbc\Path;

class ConfigReader
{
  public static function getBaseDir()
  {
    return Path::getRuntimeDirectory('Maintenance');
  }
}