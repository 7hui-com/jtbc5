<?php
namespace App\Universal\Plugin;
use Jtbc\Jtbc;
use Jtbc\Path;
use Jtbc\Validation;
use DirectoryIterator;

class PluginFinder
{
  private $folderName;
  private $plugins = null;
  private $allNames = null;

  public function getFolderPath()
  {
    return Path::getActualRoute($this -> folderName);
  }

  public function getAllNames()
  {
    $result = [];
    if (is_array($this -> allNames))
    {
      $result = $this -> allNames;
    }
    else
    {
      $allNames = [];
      $dir = new DirectoryIterator($this -> getFolderPath());
      foreach ($dir as $item)
      {
        if (!$item -> isDot() && $item -> isDir())
        {
          $allNames[] = $item -> getFilename();
        }
      }
      $result = $this -> allNames = $allNames;
    }
    return $result;
  }

  public function getEnabledPlugins()
  {
    $result = [];
    $plugins = $this -> getPlugins();
    foreach ($plugins as $plugin)
    {
      $pluginStatus = Jtbc::take('global.' . $this -> folderName . '/' . $plugin . ':plugin.enabled', 'cfg');
      if ($pluginStatus == 'true')
      {
        $result[] = $plugin;
      }
    }
    return $result;
  }

  public function getEnabledPluginsByPrefix(string $argPrefix)
  {
    $result = [];
    $prefix = $argPrefix;
    $enabledPlugins = $this -> getEnabledPlugins();
    foreach ($enabledPlugins as $plugin)
    {
      if (strpos($plugin, $prefix) === 0)
      {
        $result[] = $plugin;
      }
    }
    return $result;
  }

  public function getDisabledPlugins()
  {
    return array_diff($this -> getPlugins(), $this -> getEnabledPlugins());
  }

  public function getPlugins()
  {
    $result = [];
    if (is_array($this -> plugins))
    {
      $result = $this -> plugins;
    }
    else
    {
      $plugins = [];
      $allNames = $this -> getAllNames();
      foreach ($allNames as $name)
      {
        $pluginRecognizer = new PluginRecognizer($this -> folderName . '/' . $name);
        if ($pluginRecognizer -> isPremium === true)
        {
          $plugins[] = $name;
        }
      }
      $result = $this -> plugins = $plugins;
    }
    return $result;
  }

  public function getPluginsByGroup(string $argGroupName)
  {
    $result = [];
    $groupName = $argGroupName;
    if (!Validation::isEmpty($groupName))
    {
      $plugins = $this -> getPlugins();
      foreach ($plugins as $plugin)
      {
        $pluginGroup = Jtbc::take('global.' . $this -> folderName . '/' . $plugin . ':plugin.group', 'cfg');
        if (is_string($pluginGroup))
        {
          if (trim(strtolower($pluginGroup)) == trim(strtolower($groupName)))
          {
            $result[] = $plugin;
          }
        }
      }
    }
    return $result;
  }

  public function exists(string $argPulginName)
  {
    $result = false;
    $pulginName = $argPulginName;
    if (Validation::isNatural($pulginName))
    {
      $pulginFullPath = $this -> getFolderPath() . '/' . $pulginName;
      $result = is_dir($pulginFullPath)? true: false;
    }
    return $result;
  }

  public function isEnabledPlugin(string $argPulginName)
  {
    $result = false;
    $pulginName = $argPulginName;
    if ($this -> exists($pulginName))
    {
      $plugin = new Plugin($pulginName);
      $result = $plugin -> isEnabled();
    }
    return $result;
  }

  public function __construct()
  {
    $this -> folderName = PluginEnv::GENRE;
  }
}