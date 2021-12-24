<?php
namespace App\Console\Cloud\CloudService\Patch;

class ModulePatchDownloader extends PatchDownloader
{
  public function __construct(int $argModuleId, int $argVersion)
  {
    $this -> typeName = 'module';
    $this -> serviceId = 'C0002';
    $this -> serialId = $argModuleId;
    parent::__construct($argVersion);
  }
}