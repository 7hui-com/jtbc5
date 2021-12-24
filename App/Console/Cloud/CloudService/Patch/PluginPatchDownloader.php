<?php
namespace App\Console\Cloud\CloudService\Patch;

class PluginPatchDownloader extends PatchDownloader
{
  public function __construct(int $argPluginId, int $argVersion)
  {
    $this -> typeName = 'plugin';
    $this -> serviceId = 'C0003';
    $this -> serialId = $argPluginId;
    parent::__construct($argVersion);
  }
}