<?php
namespace App\Common\Maintenance;
use Throwable;
use ZipArchive;
use Jtbc\Path;
use Jtbc\Substance;
use Jtbc\DB\DBFactory;
use Jtbc\Jtbc\JtbcWriter;
use App\Common\Maintenance\Migrator\MetaReader;
use App\Common\Maintenance\Migrator\OperationGuider;
use App\Common\Maintenance\Migrator\DowngradeZipGenerator;

class Migrator
{
  private $meta;
  private $metaMode;
  private $diffed;
  private $taskFilePath;
  private $taskFileExtractPath;
  private $operationGuider;
  private $rootPath;
  private $sqlResult = [];
  private $dbLink;
  private $log = [];
  private $lastErrorCode;

  private function getTaskFileExtractPath()
  {
    $result = null;
    $zip = new ZipArchive();
    $opened = $zip -> open($this -> taskFilePath);
    if ($opened === true)
    {
      $taskFileExtractPath = pathinfo($this -> taskFilePath, PATHINFO_DIRNAME) . '/' . basename($this -> taskFilePath, '.zip');
      $extracted = $zip -> extractTo($taskFileExtractPath);
      if ($extracted === true)
      {
        $result = $taskFileExtractPath;
      }
    }
    $zip -> close();
    return $result;
  }

  private function fileMigrate()
  {
    $result = true;
    $fileList = $this -> diffed -> file;
    if (is_array($fileList))
    {
      $currentType = 'file';
      $ss = new Substance($fileList);
      $createFiles = $ss -> create ?? [];
      $overwriteFiles = $ss -> overwrite ?? [];
      $deleteFiles = $ss -> delete ?? [];
      foreach ($createFiles as $item)
      {
        $file = new Substance($item);
        $filePath = $file -> path;
        if ($file -> diffed_status == 0 || $this -> operationGuider -> isOverwriteOpinion($currentType, $file -> id))
        {
          $fileTargetPath = $this -> rootPath . '/' . $filePath;
          $fileExtractPath = $this -> taskFileExtractPath . '/' . $filePath;
          $fileTargetDirPath = pathinfo($fileTargetPath, PATHINFO_DIRNAME);
          if (is_dir($fileTargetDirPath) || @mkdir($fileTargetDirPath, 0777, true))
          {
            if (!@copy($fileExtractPath, $fileTargetPath))
            {
              $result = false;
              break;
            }
            else
            {
              $this -> log[] = ['file' => $fileExtractPath . '=>' . $fileTargetPath];
            }
          }
          else
          {
            $result = false;
            break;
          }
        }
      }
      if ($result !== false)
      {
        foreach ($overwriteFiles as $item)
        {
          $file = new Substance($item);
          $filePath = $file -> path;
          if ($file -> diffed_status == 0 || $this -> operationGuider -> isOverwriteOpinion($currentType, $file -> id))
          {
            $fileTargetPath = $this -> rootPath . '/' . $filePath;
            $fileExtractPath = $this -> taskFileExtractPath . '/' . $filePath;
            $fileTargetDirPath = pathinfo($fileTargetPath, PATHINFO_DIRNAME);
            if (is_dir($fileTargetDirPath) || @mkdir($fileTargetDirPath, 0777, true))
            {
              if (!@copy($fileExtractPath, $fileTargetPath))
              {
                $result = false;
                break;
              }
              else
              {
                $this -> log[] = ['file' => $fileExtractPath . '=>' . $fileTargetPath];
              }
            }
            else
            {
              $result = false;
              break;
            }
          }
        }
      }
      if ($result !== false)
      {
        foreach ($deleteFiles as $item)
        {
          $file = new Substance($item);
          $filePath = $file -> path;
          if ($file -> diffed_status == 0 || ($file -> diffed_status == 3 && $this -> operationGuider -> isDeleteOpinion($currentType, $file -> id)))
          {
            $fileTargetPath = $this -> rootPath . '/' . $filePath;
            if (!@unlink($fileTargetPath))
            {
              $result = false;
              break;
            }
            else
            {
              $this -> log[] = ['file' => 'delete:' . $fileTargetPath];
            }
          }
        }
      }
    }
    return $result;
  }

  private function jtbcMigrate()
  {
    $result = true;
    $jtbcList = $this -> diffed -> jtbc;
    if (is_array($jtbcList))
    {
      $currentType = 'jtbc';
      $ss = new Substance($jtbcList);
      $createJtbcs = $ss -> create ?? [];
      $overwriteJtbcs = $ss -> overwrite ?? [];
      $deleteJtbcs = $ss -> delete ?? [];
      foreach ($createJtbcs as $item)
      {
        $jtbc = new Substance($item);
        $jtbcTargetPath = $this -> rootPath . '/' . $jtbc -> path;
        if ($jtbc -> diffed_status == 0)
        {
          $updated = JtbcWriter::addNodeContent($jtbcTargetPath, $jtbc -> type, $jtbc -> node_key, $jtbc -> node_data, $jtbc -> node_name);
          if ($updated !== true)
          {
            $result = false;
            break;
          }
          else
          {
            $this -> log[] = ['jtbc' => $item, 'mode' => 'add'];
          }
        }
        else if ($jtbc -> diffed_status == 4 && $this -> operationGuider -> isOverwriteOpinion($currentType, $jtbc -> id))
        {
          $updated = JtbcWriter::putNodeContent($jtbcTargetPath, $jtbc -> type, $jtbc -> node_key, $jtbc -> node_data, $jtbc -> node_name);
          if ($updated !== true)
          {
            $result = false;
            break;
          }
          else
          {
            $this -> log[] = ['jtbc' => $item, 'mode' => 'put'];
          }
        }
      }
      if ($result !== false)
      {
        foreach ($overwriteJtbcs as $item)
        {
          $jtbc = new Substance($item);
          $jtbcTargetPath = $this -> rootPath . '/' . $jtbc -> path;
          if ($jtbc -> diffed_status == 0 || ($jtbc -> diffed_status == 6 && $this -> operationGuider -> isOverwriteOpinion($currentType, $jtbc -> id)))
          {
            $updated = JtbcWriter::putNodeContent($jtbcTargetPath, $jtbc -> type, $jtbc -> node_key, $jtbc -> node_data_new, $jtbc -> node_name);
            if ($updated !== true)
            {
              $result = false;
              break;
            }
            else
            {
              $this -> log[] = ['jtbc' => $item, 'mode' => 'put'];
            }
          }
          else if ($jtbc -> diffed_status == 5 && $this -> operationGuider -> isCreateOpinion($currentType, $jtbc -> id))
          {
            $updated = JtbcWriter::addNodeContent($jtbcTargetPath, $jtbc -> type, $jtbc -> node_key, $jtbc -> node_data_new, $jtbc -> node_name);
            if ($updated !== true)
            {
              $result = false;
              break;
            }
            else
            {
              $this -> log[] = ['jtbc' => $item, 'mode' => 'add'];
            }
          }
        }
      }
      if ($result !== false)
      {
        foreach ($deleteJtbcs as $item)
        {
          $jtbc = new Substance($item);
          $jtbcTargetPath = $this -> rootPath . '/' . $jtbc -> path;
          if ($jtbc -> diffed_status == 0 || ($jtbc -> diffed_status == 6 && $this -> operationGuider -> isDeleteOpinion($currentType, $jtbc -> id)))
          {
            $updated = JtbcWriter::deleteNode($jtbcTargetPath, $jtbc -> node_key);
            if ($updated !== true)
            {
              $result = false;
              break;
            }
            else
            {
              $this -> log[] = ['jtbc' => $item, 'mode' => 'delete'];
            }
          }
        }
      }
    }
    return $result;
  }

  private function sqlMigrate()
  {
    $result = true;
    $sqlList = $this -> meta -> sql;
    if (is_array($sqlList))
    {
      if (array_key_exists($this -> metaMode, $sqlList))
      {
        $hasError = false;
        $db = DBFactory::getInstance($this -> dbLink);
        $sqlQueue = $sqlList[$this -> metaMode];
        if (is_array($sqlQueue))
        {
          foreach ($sqlQueue as $sql)
          {
            try
            {
              $this -> sqlResult[] = [
                'sql' => $sql,
                'result' => $db -> exec($sql),
              ];
            }
            catch(Throwable $e)
            {
              $hasError = true;
              $this -> sqlResult[] = [
                'sql' => $sql,
                'result' => null,
                'message' => $e -> getMessage(),
              ];
            }
          }
        }
        if ($hasError === true)
        {
          $result = false;
          @file_put_contents($this -> taskFilePath . '.sqllog', json_encode($this -> sqlResult));
        }
      }
    }
    return $result;
  }

  private function folderMigrate()
  {
    $result = true;
    $folderList = $this -> meta -> folder;
    if (is_array($folderList))
    {
      if (array_key_exists('delete_if_empty', $folderList))
      {
        $deleteFolders = $folderList['delete_if_empty'];
        if (is_array($deleteFolders))
        {
          foreach ($deleteFolders as $item)
          {
            $folder = new Substance($item);
            $folderTargetPath = $this -> rootPath . '/' . $folder -> path;
            if (is_dir($folderTargetPath))
            {
              if (empty(array_diff(scandir($folderTargetPath), ['.', '..'])))
              {
                @rmdir($folderTargetPath);
              }
            }
          }
        }
      }
    }
    return $result;
  }

  public function getLastErrorCode()
  {
    return $this -> lastErrorCode;
  }

  public function getMetaType()
  {
    $result = [
      'type' => $this -> meta -> meta_type,
      'type_id' => $this -> meta -> meta_type_id,
    ];
    return new Substance($result);
  }

  public function getMetaGenre()
  {
    return $this -> meta -> meta_genre;
  }

  public function getMetaOriginalVersion()
  {
    return intval($this -> meta -> meta_original_version);
  }

  public function getMetaTargetVersion()
  {
    return intval($this -> meta -> meta_target_version);
  }

  public function getMetaUpdatePhars()
  {
    return $this -> meta -> meta_update_phars;
  }

  public function getMetaMinimumPHPVersion()
  {
    $result = null;
    if ($this -> meta -> exists('meta_minimum_php_version'))
    {
      $result = strval($this -> meta -> meta_minimum_php_version);
    }
    return $result;
  }

  public function getMetaMinimumKernelVersion()
  {
    return intval($this -> meta -> meta_minimum_kernel_version);
  }

  public function migrate()
  {
    $result = false;
    if ($this -> operationGuider -> isFullGuided())
    {
      $readyToMigrate = false;
      if ($this -> metaMode == 'downgrade')
      {
        $this -> taskFileExtractPath = $this -> getTaskFileExtractPath();
        if (!is_null($this -> taskFileExtractPath))
        {
          $readyToMigrate = true;
        }
      }
      else
      {
        $downgradeZipGenerator = new DowngradeZipGenerator($this -> taskFilePath);
        if ($downgradeZipGenerator -> generate() === true)
        {
          $readyToMigrate = true;
          $this -> taskFileExtractPath = $downgradeZipGenerator -> getTaskFileExtractPath();
        }
      }
      if ($readyToMigrate === true)
      {
        $this -> diffed = new Substance($this -> operationGuider -> getDiffed());
        if ($this -> fileMigrate() === true)
        {
          if ($this -> jtbcMigrate() === true)
          {
            $this -> sqlMigrate();
            $this -> folderMigrate();
            $result = true;
          }
          else
          {
            $this -> lastErrorCode = 1004;
          }
        }
        else
        {
          $this -> lastErrorCode = 1003;
        }
      }
      else
      {
        $this -> lastErrorCode = 1002;
      }
    }
    else
    {
      $this -> lastErrorCode = 1001;
    }
    return $result;
  }

  public function __construct(string $argTaskFilePath, array $argGuideMap, $argDBLink = null)
  {
    $this -> dbLink = $argDBLink;
    $this -> taskFilePath = $argTaskFilePath;
    $this -> operationGuider = new OperationGuider($this -> taskFilePath, $argGuideMap);
    $this -> rootPath = realpath(Path::getActualRoute('./') . '../');
    $this -> meta = new Substance(MetaReader::read($this -> taskFilePath));
    $this -> metaMode = $this -> meta -> meta_mode;
  }
}