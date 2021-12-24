<?php
namespace App\Common\Module;
use Jtbc\Jtbc;
use Jtbc\Path;
use App\Common\Hook\HooksGeneralManager;

class ModuleHooksManager
{
  private $genre;
  private $folderPath;
  private $manager;
  private $hasHookHandle = false;

  public function hasHookHandle()
  {
    return $this -> hasHookHandle;
  }

  public function cancel(...$args)
  {
    $result = false;
    if (!is_null($this -> manager))
    {
      $result = $this -> manager -> cancel(...$args);
    }
    return $result;
  }

  public function registerIfNotExists(...$args)
  {
    $result = false;
    if (!is_null($this -> manager))
    {
      $result = $this -> manager -> registerIfNotExists(...$args);
    }
    return $result;
  }

  public function __construct(string $argGenre)
  {
    $this -> genre = $argGenre;
    $this -> folderPath = Path::getActualRoute($this -> genre);
    if (is_dir($this -> folderPath))
    {
      $globalHookHandle = Jtbc::take('global.' . $this -> genre . ':module.global_hook_handle', 'cfg');
      $forestageHookHandle = Jtbc::take('global.' . $this -> genre . ':module.forestage_hook_handle', 'cfg');
      $backstageHookHandle = Jtbc::take('global.' . $this -> genre . ':module.backstage_hook_handle', 'cfg');
      if (is_string($globalHookHandle) || is_string($forestageHookHandle) || is_string($backstageHookHandle))
      {
        $this -> hasHookHandle = true;
        $this -> manager = new HooksGeneralManager();
        $this -> manager -> batchAddFromModule($this -> genre, $globalHookHandle, $forestageHookHandle, $backstageHookHandle);
      }
    }
  }
}