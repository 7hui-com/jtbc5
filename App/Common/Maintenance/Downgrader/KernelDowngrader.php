<?php
namespace App\Common\Maintenance\Downgrader;
use App\Common\Maintenance\Downgrader;
use App\Common\Maintenance\StatusManager\KernelStatusManager;

class KernelDowngrader extends Downgrader
{
  use KernelStatusManager;

  public function __construct(...$args)
  {
    parent::__construct(...$args);
    $this -> setType('kernel');
  }
}