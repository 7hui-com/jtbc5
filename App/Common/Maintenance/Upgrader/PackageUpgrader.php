<?php
namespace App\Common\Maintenance\Upgrader;
use App\Common\Maintenance\Upgrader;
use App\Common\Maintenance\StatusManager\PackageStatusManager;

class PackageUpgrader extends Upgrader
{
  use PackageStatusManager;

  public function __construct(...$args)
  {
    $packageId = array_pop($args);
    parent::__construct(...$args);
    $this -> setType('package', $packageId);
  }
}