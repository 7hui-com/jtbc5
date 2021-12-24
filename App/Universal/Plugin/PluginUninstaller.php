<?php
namespace App\Universal\Plugin;
use Jtbc\File\IO\Folder;
use App\Common\Uninstaller;

class PluginUninstaller extends Uninstaller
{
  private $pulgin;
  private $pulginName;

  public function uninstall()
  {
    $result = false;
    if (!$this -> pulgin -> isExists())
    {
      $this -> lastErrorCode = 1401;
    }
    else if ($this -> pulgin -> isLocked())
    {
      $this -> lastErrorCode = 1402;
    }
    else
    {
      $pulginFullPath = $this -> pulgin -> getFullPath();
      $pulginConfigFullPath = $this -> pulgin -> getFullConfigPath();
      if (Folder::delete($pulginFullPath))
      {
        $result = true;
        if (is_file($pulginConfigFullPath))
        {
          @unlink($pulginConfigFullPath);
        }
      }
    }
    return $result;
  }

  public function __construct(string $argPulginName)
  {
    $this -> pulginName = $argPulginName;
    $this -> pulgin = new Plugin($this -> pulginName);
  }
}