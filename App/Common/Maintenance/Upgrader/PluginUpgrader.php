<?php
namespace App\Common\Maintenance\Upgrader;
use App\Common\Maintenance\Upgrader;
use App\Common\Maintenance\StatusManager\PluginStatusManager;

class PluginUpgrader extends Upgrader
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