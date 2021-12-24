<?php
namespace App\Common\Maintenance\Downgrader;
use App\Common\Maintenance\Downgrader;
use App\Common\Maintenance\StatusManager\ModuleStatusManager;

class ModuleDowngrader extends Downgrader
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