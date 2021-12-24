<?php
namespace App\Console\Cloud\CloudService\Patch;

class PackagePatchDownloader extends PatchDownloader
{
  public function __construct(int $argPackageId, int $argVersion)
  {
    $this -> typeName = 'package';
    $this -> serviceId = 'C0001';
    $this -> serialId = $argPackageId;
    parent::__construct($argVersion);
  }
}