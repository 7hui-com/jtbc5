<?php
namespace App\Universal\Plugin;
use ZipArchive;
use App\Common\Installer;

class PluginInstaller extends Installer
{
  private $pluginFinder;

  public function install()
  {
    $result = false;
    if (!is_file($this -> zipFilePath))
    {
      $this -> lastErrorCode = 1000;
    }
    else
    {
      $zipArchive = new ZipArchive();
      $opened = $zipArchive -> open($this -> zipFilePath);
      if ($opened === true)
      {
        $meta = $this -> getMetaData($zipArchive);
        $pulginName = $meta -> name;
        if (!is_string($pulginName))
        {
          $this -> lastErrorCode = 1024;
        }
        else if ($this -> pluginFinder -> exists($pulginName))
        {
          $this -> lastErrorCode = 1025;
        }
        else if (!$this -> updatePhars($meta))
        {
          $this -> lastErrorCode = 1026;
        }
        else
        {
          $fullPluginPath = $this -> pluginFinder -> getFolderPath() . '/' . $pulginName;
          $extracted = $zipArchive -> extractTo($fullPluginPath);
          if ($extracted === true)
          {
            $pluginFilePath = $fullPluginPath . '/common/plugin.jtbc';
            if ($this -> writePremiumSignToFile($pluginFilePath) !== false)
            {
              $result = true;
            }
            else
            {
              $this -> lastErrorCode = 1444;
            }
            $this -> clean($fullPluginPath);
          }
          else
          {
            $this -> lastErrorCode = 1030;
          }
        }
      }
      else
      {
        $this -> lastErrorCode = 1010;
      }
      $zipArchive -> close();
    }
    return $result;
  }

  public function __construct(...$args)
  {
    parent::__construct(...$args);
    $this -> pluginFinder = new PluginFinder();
  }
}