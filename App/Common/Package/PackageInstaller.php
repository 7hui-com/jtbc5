<?php
namespace App\Common\Package;
use Exception;
use ZipArchive;
use Jtbc\Path;
use Jtbc\Substance;
use Jtbc\DB\DBFactory;
use App\Common\Installer;
use App\Common\Module\ModuleHooksManager;

class PackageInstaller extends Installer
{
  private $rootPath;
  private $existedFolders = [];
  private $existedDBTables = [];

  public function getExistedFolders()
  {
    return $this -> existedFolders;
  }

  public function getExistedDBTables()
  {
    return $this -> existedDBTables;
  }

  public function hasExistedFolders(Substance $meta)
  {
    $result = false;
    $createFolders = $meta -> create_folders;
    if (is_array($createFolders))
    {
      foreach ($createFolders as $folder)
      {
        $fullPath = $this -> rootPath . $folder;
        if (is_dir($fullPath))
        {
          $result = true;
          $this -> existedFolders[] = realpath($fullPath);
        }
      }
    }
    return $result;
  }

  public function hasExistedDBTables(Substance $meta)
  {
    $result = false;
    $createDBTables = $meta -> create_db_tables;
    if (is_array($createDBTables))
    {
      $db = DBFactory::getInstance($this -> dbLink);
      foreach ($createDBTables as $dbTable)
      {
        if ($db -> hasTable($dbTable))
        {
          $result = true;
          $this -> existedDBTables[] = $dbTable;
        }
      }
    }
    return $result;
  }

  public function install()
  {
    $result = false;
    $packageRecognizer = new PackageRecognizer();
    if (!is_file($this -> zipFilePath))
    {
      $this -> lastErrorCode = 1000;
    }
    else if ($packageRecognizer -> hasPackage())
    {
      $this -> lastErrorCode = 1001;
    }
    else
    {
      $zipArchive = new ZipArchive();
      $opened = $zipArchive -> open($this -> zipFilePath);
      if ($opened === true)
      {
        $meta = $this -> getMetaData($zipArchive);
        if ($this -> hasExistedFolders($meta))
        {
          $this -> lastErrorCode = 1020;
        }
        else if ($this -> hasExistedDBTables($meta))
        {
          $this -> lastErrorCode = 1021;
        }
        else if (!$this -> updatePhars($meta))
        {
          $this -> lastErrorCode = 1026;
        }
        else
        {
          $rootPath = $this -> rootPath;
          $extracted = $zipArchive -> extractTo($rootPath);
          if ($extracted === true)
          {
            $packageFilePath = $rootPath . '/common/package.jtbc';
            if ($this -> writePremiumSignToFile($packageFilePath) !== false)
            {
              $result = true;
              //*****************************************************************************//
              $sqlPath = $rootPath . '/_package.sql';
              if (is_file($sqlPath))
              {
                $execResult = false;
                $db = DBFactory::getInstance($this -> dbLink);
                try
                {
                  $execResult = $db -> exec(file_get_contents($sqlPath));
                }
                catch(Exception $e)
                {
                  $execResult = false;
                }
                if (!is_numeric($execResult))
                {
                  $this -> lastErrorCode = 1144;
                }
              }
              //*****************************************************************************//
              $metaRegisterHooks = $meta -> register_hooks;
              if (is_array($metaRegisterHooks))
              {
                foreach ($metaRegisterHooks as $registerHook)
                {
                  if (is_array($registerHook))
                  {
                    if (array_key_exists('module', $registerHook))
                    {
                      $moduleHooksManager = new ModuleHooksManager($registerHook['module']);
                      $moduleHooksManager -> registerIfNotExists();
                    }
                  }
                }
              }
              //*****************************************************************************//
            }
            else
            {
              $this -> lastErrorCode = 1444;
            }
            $this -> clean($rootPath);
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
    $this -> rootPath = Path::getActualRoute('./');
  }
}