<?php
namespace App\Common\Maintenance\Upgrader;
use App\Common\Maintenance\Upgrader;
use App\Common\Maintenance\StatusManager\ModuleStatusManager;

class ModuleUpgrader extends Upgrader
{
  use ModuleStatusManager;

  protected $genre;
  protected $moduleRecognizer;

  public function __construct(...$args)
  {
    $this -> moduleRecognizer = array_pop($args);
    parent::__construct(...$args);
    $this -> setType('module', $this -> moduleRecognizer -> moduleId);
    $this -> genre = $this -> moduleRecognizer -> genre;
  }
}