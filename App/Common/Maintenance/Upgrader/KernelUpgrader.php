<?php
namespace App\Common\Maintenance\Upgrader;
use App\Common\Maintenance\Upgrader;
use App\Common\Maintenance\StatusManager\KernelStatusManager;

class KernelUpgrader extends Upgrader
{
  use KernelStatusManager;

  public function __construct(...$args)
  {
    parent::__construct(...$args);
    $this -> setType('kernel');
  }
}