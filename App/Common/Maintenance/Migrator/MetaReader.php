<?php
namespace App\Common\Maintenance\Migrator;
use ZipArchive;
use Jtbc\JSON;
use Jtbc\Validation;

class MetaReader
{
  public static function read(string $argZipFilePath)
  {
    $result = null;
    $zipFilePath = $argZipFilePath;
    $zipArchive = new ZipArchive();
    $opened = $zipArchive -> open($zipFilePath);
    if ($opened === true)
    {
      $data = $zipArchive -> getFromName('meta.json');
      if (Validation::isJSON($data))
      {
        $result = JSON::decode($data);
      }
    }
    $zipArchive -> close();
    return $result;
  }
}