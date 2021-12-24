<?php
namespace App\Common\Maintenance\Downgrader;
use App\Common\Maintenance\Downgrader;
use App\Common\Maintenance\StatusManager\PackageStatusManager;

class PackageDowngrader extends Downgrader
{
  use PackageStatusManager;

  public function __construct(...$args)
  {
    $packageId = array_pop($args);
    parent::__construct(...$args);
    $this -> setType('package', $packageId);
  }
}