<?php
namespace App\Universal\Plugin;
use Jtbc\File\IO\Folder;
use App\Common\Uninstaller;

class PluginUninstaller extends Uninstaller
{
  private $plugin;
  private $pluginName;

  public function uninstall()
  {
    $result = false;
    if (!$this -> plugin -> isExists())
    {
      $this -> lastErrorCode = 1401;
    }
    else if ($this -> plugin -> isLocked())
    {
      $this -> lastErrorCode = 1402;
    }
    else
    {
      $pluginFullPath = $this -> plugin -> getFullPath();
      $pluginConfigFullPath = $this -> plugin -> getFullConfigPath();
      if (Folder::delete($pluginFullPath))
      {
        $result = true;
        if (is_file($pluginConfigFullPath))
        {
          @unlink($pluginConfigFullPath);
        }
      }
    }
    return $result;
  }

  public function __construct(string $argPluginName)
  {
    $this -> pluginName = $argPluginName;
    $this -> plugin = new Plugin($this -> pluginName);
  }
}