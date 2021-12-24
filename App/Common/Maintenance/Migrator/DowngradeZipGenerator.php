<?php
namespace App\Common\Maintenance\Migrator;
use ZipArchive;
use Jtbc\Path;
use Jtbc\Substance;
use Jtbc\Jtbc\JtbcReader;
use Jtbc\Exception\FileException;
use Jtbc\Exception\NotSupportedException;

class DowngradeZipGenerator
{
  private $meta;

  private $basePath;
  private $rootPath;
  private $taskFilePath;
  private $metaOriginalVersion;
  private $metaType;
  private $metaTypeId;
  private $metaTargetVersion;
  private $newMeta;

  private function getTargetPath()
  {
    return $this -> basePath . '/' . $this -> metaTargetVersion . 'to' . $this -> metaOriginalVersion . '.zip';
  }

  private function getNewMeta()
  {
    return $this -> newMeta -> toJSON();
  }

  private function addFileToDowngradeZip(ZipArchive $zip)
  {
    $result = null;
    $bool = true;
    $meta = new Substance($this -> meta);
    $fileList = new Substance($meta -> file);
    $createFiles = $fileList -> create;
    $overwriteFiles = $fileList -> overwrite;
    $deleteFiles = $fileList -> delete;
    $taskFileExtractPath = $this -> getTaskFileExtractPath();
    $addedCreateFiles = $addedOverwriteFiles = $addedDeleteFiles = [];
    foreach ($createFiles as $item)
    {
      $file = new Substance($item);
      $filePath = $file -> path;
      $fullFilePath = $taskFileExtractPath . '/' . $filePath;
      if (!is_file($fullFilePath))
      {
        $bool = false;
        break;
      }
      else
      {
        $addedDeleteFiles[] = [
          'id' => $file -> id,
          'path' => $filePath,
          'hash_old' => md5_file($fullFilePath),
        ];
      }
    }
    if ($bool === true)
    {
      foreach ($overwriteFiles as $item)
      {
        $file = new Substance($item);
        $filePath = $file -> path;
        $fullFilePath = $taskFileExtractPath . '/' . $filePath;
        $currentFullFilePath = $this -> rootPath . '/' . $filePath;
        if (is_file($currentFullFilePath))
        {
          $addedOverwriteFiles[] = [
            'id' => $file -> id,
            'path' => $filePath,
            'hash_old' => $file -> hash_new,
            'has_new' => md5_file($currentFullFilePath),
          ];
          $added = $zip -> addFile($currentFullFilePath, $filePath);
          if ($added !== true)
          {
            $bool = false;
            break;
          }
        }
      }
    }
    if ($bool === true)
    {
      foreach ($deleteFiles as $item)
      {
        $file = new Substance($item);
        $filePath = $file -> path;
        $fullFilePath = $taskFileExtractPath . '/' . $filePath;
        $currentFullFilePath = $this -> rootPath . '/' . $filePath;
        if (is_file($currentFullFilePath))
        {
          $addedCreateFiles[] = [
            'id' => $file -> id,
            'path' => $filePath,
            'hash' => md5_file($currentFullFilePath),
          ];
          $added = $zip -> addFile($currentFullFilePath, $filePath);
          if ($added !== true)
          {
            $bool = false;
            break;
          }
        }
      }
    }
    $this -> newMeta -> file = [
      'create' => $addedCreateFiles,
      'overwrite' => $addedOverwriteFiles,
      'delete' => $addedDeleteFiles,
    ];
    $result = $bool === true? true: false;
    return $result;
  }

  private function addJtbcToNewMeta()
  {
    $meta = new Substance($this -> meta);
    $jtbcList = new Substance($meta -> jtbc);
    $createJtbcs = $jtbcList -> create;
    $overwriteJtbcs = $jtbcList -> overwrite;
    $deleteJtbcs = $jtbcList -> delete;
    $newCreateJtbcs = $newOverwriteJtbcs = $newDeleteJtbcs = [];
    foreach ($createJtbcs as $item)
    {
      $jtbc = new Substance($item);
      $jtbcPath = $jtbc -> path;
      $currentFullJtbcPath = $this -> rootPath . '/' . $jtbcPath;
      if (is_file($currentFullJtbcPath))
      {
        $newDeleteJtbcs[] = [
          'id' => $jtbc -> id,
          'path' => $jtbcPath,
          'type' => $jtbc -> type,
          'node_key' => $jtbc -> node_key,
          'node_data_old' => $jtbc -> node_data,
        ];
      }
    }
    foreach ($overwriteJtbcs as $item)
    {
      $jtbc = new Substance($item);
      $jtbcPath = $jtbc -> path;
      $currentFullJtbcPath = $this -> rootPath . '/' . $jtbcPath;
      if (is_file($currentFullJtbcPath))
      {
        $jtbcData = JtbcReader::getData($currentFullJtbcPath, $jtbc -> type, $jtbc -> node_name);
        if (array_key_exists($jtbc -> node_key, $jtbcData))
        {
          $newOverwriteJtbcs[] = [
            'id' => $jtbc -> id,
            'path' => $jtbcPath,
            'type' => $jtbc -> type,
            'node_key' => $jtbc -> node_key,
            'node_data_new' => $jtbcData[$jtbc -> node_key],
            'node_data_old' => $jtbc -> node_data_new,
            'node_name' => $jtbc -> node_name,
          ];
        }
      }
    }
    foreach ($deleteJtbcs as $item)
    {
      $jtbc = new Substance($item);
      $jtbcPath = $jtbc -> path;
      $currentFullJtbcPath = $this -> rootPath . '/' . $jtbcPath;
      if (is_file($currentFullJtbcPath))
      {
        $jtbcData = JtbcReader::getData($currentFullJtbcPath, $jtbc -> type, $jtbc -> node_name);
        if (array_key_exists($jtbc -> node_key, $jtbcData))
        {
          $newCreateJtbcs[] = [
            'id' => $jtbc -> id,
            'path' => $jtbcPath,
            'type' => $jtbc -> type,
            'node_key' => $jtbc -> node_key,
            'node_data' => $jtbcData[$jtbc -> node_key],
            'node_name' => $jtbc -> node_name,
          ];
        }
      }
    }
    $this -> newMeta -> jtbc = [
      'create' => $newCreateJtbcs,
      'overwrite' => $newOverwriteJtbcs,
      'delete' => $newDeleteJtbcs,
    ];
  }

  public function getTaskFileExtractPath()
  {
    return $this -> basePath . '/' . basename($this -> taskFilePath, '.zip');
  }

  public function generate()
  {
    $result = null;
    $zip = new ZipArchive();
    $opened = $zip -> open($this -> taskFilePath);
    if ($opened === true)
    {
      $extracted = $zip -> extractTo($this -> getTaskFileExtractPath());
      if ($extracted === true)
      {
        $downgradeZip = new ZipArchive();
        $newOpened = $downgradeZip -> open($this -> getTargetPath(), ZipArchive::CREATE);
        if ($newOpened === true)
        {
          $added = $this -> addFileToDowngradeZip($downgradeZip);
          if ($added === true)
          {
            $this -> addJtbcToNewMeta();
            $result = $downgradeZip -> addFromString('meta.json', $this -> getNewMeta())? true: false;
          }
        }
        $downgradeZip -> close();
      }
    }
    $zip -> close();
    return $result;
  }

  public function __construct(string $argTaskFilePath)
  {
    $this -> taskFilePath = $argTaskFilePath;
    $this -> meta = MetaReader::read($this -> taskFilePath);
    $this -> basePath = pathinfo($this -> taskFilePath, PATHINFO_DIRNAME);
    $this -> rootPath = realpath(Path::getActualRoute('./') . '../');
    $this -> newMeta = new Substance();
    if (is_null($this -> meta))
    {
      throw new FileException('Failed to read meta data from "' . $this -> taskFilePath . '"', 50404);
    }
    else
    {
      $meta = new Substance($this -> meta);
      $this -> metaType = $meta -> meta_type;
      $this -> metaTypeId = intval($meta -> meta_type_id);
      $this -> metaOriginalVersion = intval($meta -> meta_original_version);
      $this -> metaTargetVersion = intval($meta -> meta_target_version);
      $this -> newMeta -> meta_type = $this -> metaType;
      $this -> newMeta -> meta_type_id = $this -> metaTypeId;
      $this -> newMeta -> meta_original_version = $this -> metaTargetVersion;
      $this -> newMeta -> meta_target_version = $this -> metaOriginalVersion;
      $this -> newMeta -> meta_mode = 'downgrade';
      $this -> newMeta -> meta_genre = $meta -> meta_genre;
      if (!is_null($meta -> sql))
      {
        $this -> newMeta -> sql = $meta -> sql;
      }
      if (!in_array($this -> metaType, ['kernel', 'package', 'module', 'plugin']))
      {
        throw new NotSupportedException('"' . $this -> metaType . '" is not supported', 50415);
      }
      else if ($meta -> meta_mode != 'upgrade')
      {
        throw new NotSupportedException('This file\'s meta mode is not supported', 50415);
      }
    }
  }
}