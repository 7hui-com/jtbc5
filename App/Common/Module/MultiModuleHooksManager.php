<?php
namespace App\Common\Module;
use Jtbc\Jtbc;
use Jtbc\Path;
use App\Common\Hook\HooksGeneralManager;

class MultiModuleHooksManager
{
  private $genres;
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

  public function __construct(array $argGenres)
  {
    $this -> genres = $argGenres;
    if (!empty($this -> genres))
    {
      $this -> manager = new HooksGeneralManager();
      foreach ($this -> genres as $genre)
      {
        $folderPath = Path::getActualRoute($genre);
        if (is_dir($folderPath))
        {
          $globalHookHandle = Jtbc::take('global.' . $genre . ':module.global_hook_handle', 'cfg');
          $forestageHookHandle = Jtbc::take('global.' . $genre . ':module.forestage_hook_handle', 'cfg');
          $backstageHookHandle = Jtbc::take('global.' . $genre . ':module.backstage_hook_handle', 'cfg');
          if (is_string($globalHookHandle) || is_string($forestageHookHandle) || is_string($backstageHookHandle))
          {
            $this -> hasHookHandle = true;
            $this -> manager -> batchAddFromModule($genre, $globalHookHandle, $forestageHookHandle, $backstageHookHandle);
          }
        }
      }
    }
  }
}