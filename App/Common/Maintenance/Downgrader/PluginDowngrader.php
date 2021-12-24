<?php
namespace App\Common\Maintenance\Downgrader;
use App\Common\Maintenance\Downgrader;
use App\Common\Maintenance\StatusManager\PluginStatusManager;

class PluginDowngrader extends Downgrader
{
  use PluginStatusManager;

  protected $genre;
  protected $pluginRecognizer;

  public function __construct(...$args)
  {
    $this -> pluginRecognizer = array_pop($args);
    parent::__construct(...$args);
    $this -> setType('plugin', $this -> pluginRecognizer -> pluginId);
    $this -> genre = $this -> pluginRecognizer -> genre;
  }
}