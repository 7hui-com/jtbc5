<?php
namespace App\Console\Cloud\CloudService\Patch;

class KernelPatchDownloader extends PatchDownloader
{
  public function __construct(int $argVersion)
  {
    $this -> typeName = 'kernel';
    $this -> serviceId = 'C0000';
    parent::__construct($argVersion);
  }
}