<?php
namespace App\Common\Module;
use Jtbc\Path;
use Jtbc\Module;
use Jtbc\Module\ModuleFinder;
use Jtbc\File\IO\Folder;
use App\Common\Uninstaller;

class BatchModuleUninstaller extends Uninstaller
{
  private $dbLink;
  private $packageFilePath;
  private $packageAssetsFolderPath;
  private $lastErrorGenre = null;

  public function getLastErrorGenre()
  {
    return $this -> lastErrorGenre;
  }

  public function getBatchUninstallAbleModules(bool $argDetailMode = false)
  {
    $result = [];
    $detailMode = $argDetailMode;
    $hasUnkown = false;
    $moduleFinder = new ModuleFinder('config', false);
    $modules = $moduleFinder -> getModules();
    foreach ($modules as $genre)
    {
      $item = ['genre' => $genre];
      $module = new Module($genre, 'config', false);
      if ($module -> isAnonymous !== true)
      {
        if ($module -> isParentModule === true)
        {
          $hasUnkown = true;
          $item['isParentModule'] = true;
          $item['batchUninstallAble'] = null;
        }
        else
        {
          $item['isParentModule'] = false;
          $item['batchUninstallAble'] = $module -> isBatchUninstallAble === true? true: false;
        }
        if ($detailMode === true)
        {
          $dbTables = [];
          $tableNameList = $module -> getTableNameList();
          foreach ($tableNameList as $tableName)
          {
            $dbTables[] = ['tableName' => $tableName];
          }
          $item['title'] = $module -> getTitle(false);
          $item['db_tables'] = $dbTables;
          $item['is_hide_mode'] = is_null($module -> guide -> link)? true: false;
        }
        $result[] = $item;
      }
    }
    $redetect = function($genre) use (&$result)
    {
      $outcome = true;
      foreach ($result as $item)
      {
        $currentGenre = $item['genre'];
        $currentBatchUninstallAble = $item['batchUninstallAble'];
        if (str_starts_with($currentGenre, $genre . '/'))
        {
          if (is_null($currentBatchUninstallAble))
          {
            $outcome = null;
            break;
          }
          else if ($currentBatchUninstallAble === false)
          {
            $outcome = false;
          }
        }
      }
      return $outcome;
    };
    while ($hasUnkown === true)
    {
      $hasUnkown = false;
      foreach ($result as $key => $item)
      {
        $isParentModule = $item['isParentModule'];
        $batchUninstallAble = $item['batchUninstallAble'];
        if ($isParentModule === true && is_null($batchUninstallAble))
        {
          $batchUninstallAble = $item['batchUninstallAble'] = $redetect($item['genre']);
          if (is_null($batchUninstallAble))
          {
            $hasUnkown = true;
          }
          else
          {
            $result[$key] = $item;
          }
        }
      }
    }
    return $result;
  }

  public function uninstall()
  {
    $result = false;
    if (is_file($this -> packageFilePath) && !is_writable($this -> packageFilePath))
    {
      $this -> lastErrorCode = 1701;
    }
    else
    {
      $modules = $this -> getBatchUninstallAbleModules();
      if (is_array($modules))
      {
        $result = true;
        $parentModules = [];
        foreach ($modules as $item)
        {
          $genre = $item['genre'];
          $isParentModule = $item['isParentModule'];
          $batchUninstallAble = $item['batchUninstallAble'];
          if ($batchUninstallAble === true)
          {
            if ($isParentModule === false)
            {
              $moduleUninstaller = new ModuleUninstaller($genre, $this -> dbLink);
              $uninstalled = $moduleUninstaller -> uninstall();
              if ($uninstalled !== true)
              {
                $result = false;
                $this -> lastErrorGenre = $genre;
                $this -> lastErrorCode = $moduleUninstaller -> getLastErrorCode();
                break;
              }
            }
            else
            {
              $parentModules[] = $item;
            }
          }
        }
        if ($result === true)
        {
          while (count($parentModules) != 0)
          {
            $deepestGenre = null;
            $deepestGenreKey = null;
            foreach ($parentModules as $key => $item)
            {
              $currentGenre = $item['genre'];
              if (is_null($deepestGenre))
              {
                $deepestGenreKey = $key;
                $deepestGenre = $currentGenre;
              }
              else if (substr_count($deepestGenre, '/') < substr_count($currentGenre, '/'))
              {
                $deepestGenreKey = $key;
                $deepestGenre = $currentGenre;
              }
            }
            if (!is_null($deepestGenre) && !is_null($deepestGenreKey))
            {
              $moduleUninstaller = new ModuleUninstaller($deepestGenre, $this -> dbLink);
              $uninstalled = $moduleUninstaller -> uninstall();
              if ($uninstalled !== true)
              {
                $result = false;
                $parentModules = [];
                $this -> lastErrorGenre = $deepestGenre;
                $this -> lastErrorCode = $moduleUninstaller -> getLastErrorCode();
                break;
              }
              else
              {
                unset($parentModules[$deepestGenreKey]);
              }
            }
          }
          if (is_file($this -> packageFilePath))
          {
            @unlink($this -> packageFilePath);
          }
          if (is_dir($this -> packageAssetsFolderPath))
          {
            @Folder::delete($this -> packageAssetsFolderPath);
          }
        }
      }
    }
    return $result;
  }

  public function __construct($argDBLink = null)
  {
    $this -> dbLink = $argDBLink;
    $this -> packageFilePath = Path::getActualRoute('common/package.jtbc');
    $this -> packageAssetsFolderPath = Path::getActualRoute('common/assets/package/');
  }
}