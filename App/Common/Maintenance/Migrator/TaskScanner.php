<?php
namespace App\Common\Maintenance\Migrator;
use Jtbc\Path;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\Jtbc\JtbcReader;
use Jtbc\Exception\FileException;

class TaskScanner
{
  private $meta;
  private $rootPath;
  private $taskFilePath;

  private function fileDiff($argFileList)
  {
    $result = [];
    $fileList = $argFileList;
    if (is_array($fileList))
    {
      $ss = new Substance($fileList);
      $createFiles = $ss -> create;
      $overwriteFiles = $ss -> overwrite;
      $deleteFiles = $ss -> delete;
      $diffedCreateFiles = $diffedOverwriteFiles = $diffedDeleteFiles = [];
      if (is_array($createFiles))
      {
        foreach ($createFiles as $item)
        {
          $file = new Substance($item);
          $filePath = $file -> path;
          $file -> diffed_status = is_file($this -> rootPath .  '/' . $filePath)? 1: 0;
          $diffedCreateFiles[] = $file -> all();
        }
      }
      if (is_array($overwriteFiles))
      {
        foreach ($overwriteFiles as $item)
        {
          $diffedStatus = 0;
          $file = new Substance($item);
          $filePath = $file -> path;
          $fullFilePath = $this -> rootPath .  '/' . $filePath;
          if (!is_file($fullFilePath))
          {
            $diffedStatus = 2;
          }
          else if (md5_file($fullFilePath) != $file -> hash_old)
          {
            $diffedStatus = 3;
          }
          $file -> diffed_status = $diffedStatus;
          $diffedOverwriteFiles[] = $file -> all();
        }
      }
      if (is_array($deleteFiles))
      {
        foreach ($deleteFiles as $item)
        {
          $diffedStatus = 0;
          $file = new Substance($item);
          $filePath = $file -> path;
          $fullFilePath = $this -> rootPath .  '/' . $filePath;
          if (!is_file($fullFilePath))
          {
            $diffedStatus = 2;
          }
          else if (md5_file($fullFilePath) != $file -> hash_old)
          {
            $diffedStatus = 3;
          }
          $file -> diffed_status = $diffedStatus;
          $diffedDeleteFiles[] = $file -> all();
        }
      }
      $result = [
        'create' => $diffedCreateFiles,
        'overwrite' => $diffedOverwriteFiles,
        'delete' => $diffedDeleteFiles,
      ];
    }
    return $result;
  }

  private function jtbcDiff($argJtbcList)
  {
    $result = [];
    $jtbcList = $argJtbcList;
    if (is_array($jtbcList))
    {
      $ss = new Substance($jtbcList);
      $createJtbcs = $ss -> create;
      $overwriteJtbcs = $ss -> overwrite;
      $deleteJtbcs = $ss -> delete;
      $diffedCreateJtbcs = $diffedOverwriteJtbcs = $diffedDeleteJtbcs = [];
      if (is_array($createJtbcs))
      {
        foreach ($createJtbcs as $item)
        {
          $diffedStatus = 0;
          $jtbc = new Substance($item);
          $jtbcPath = $jtbc -> path;
          $fullJtbcPath = $this -> rootPath .  '/' . $jtbcPath;
          if (!is_file($fullJtbcPath))
          {
            $diffedStatus = 2;
          }
          else
          {
            $jtbcData = JtbcReader::getData($fullJtbcPath, $jtbc -> type, $jtbc -> node_name);
            if (array_key_exists($jtbc -> node_key, $jtbcData))
            {
              $diffedStatus = 4;
            }
          }
          $jtbc -> diffed_status = $diffedStatus;
          $diffedCreateJtbcs[] = $jtbc -> all();
        }
      }
      if (is_array($overwriteJtbcs))
      {
        foreach ($overwriteJtbcs as $item)
        {
          $diffedStatus = 0;
          $jtbc = new Substance($item);
          $jtbcPath = $jtbc -> path;
          $fullJtbcPath = $this -> rootPath .  '/' . $jtbcPath;
          if (!is_file($fullJtbcPath))
          {
            $diffedStatus = 2;
          }
          else
          {
            $jtbcData = JtbcReader::getData($fullJtbcPath, $jtbc -> type, $jtbc -> node_name);
            if (!array_key_exists($jtbc -> node_key, $jtbcData))
            {
              $diffedStatus = 5;
            }
            else
            {
              $oldData = $jtbcData[$jtbc -> node_key];
              if ($oldData != $jtbc -> node_data_old)
              {
                $diffedStatus = 6;
              }
            }
          }
          $jtbc -> diffed_status = $diffedStatus;
          $diffedOverwriteJtbcs[] = $jtbc -> all();
        }
      }
      if (is_array($deleteJtbcs))
      {
        foreach ($deleteJtbcs as $item)
        {
          $diffedStatus = 0;
          $jtbc = new Substance($item);
          $jtbcPath = $jtbc -> path;
          $fullJtbcPath = $this -> rootPath .  '/' . $jtbcPath;
          if (!is_file($fullJtbcPath))
          {
            $diffedStatus = 2;
          }
          else
          {
            $jtbcData = JtbcReader::getData($fullJtbcPath, $jtbc -> type, $jtbc -> node_name);
            if (!array_key_exists($jtbc -> node_key, $jtbcData))
            {
              $diffedStatus = 5;
            }
            else
            {
              $oldData = $jtbcData[$jtbc -> node_key];
              if ($oldData != $jtbc -> node_data_old)
              {
                $diffedStatus = 6;
              }
            }
          }
          $jtbc -> diffed_status = $diffedStatus;
          $diffedDeleteJtbcs[] = $jtbc -> all();
        }
      }
      $result = [
        'create' => $diffedCreateJtbcs,
        'overwrite' => $diffedOverwriteJtbcs,
        'delete' => $diffedDeleteJtbcs,
      ];
    }
    return $result;
  }

  public function diff()
  {
    $ss = new Substance();
    $meta = new Substance($this -> meta);
    $fileList = $meta -> file;
    $jtbcList = $meta -> jtbc;
    if (!is_null($fileList))
    {
      $ss -> file = $this -> fileDiff($fileList);
    }
    if (!is_null($jtbcList))
    {
      $ss -> jtbc = $this -> jtbcDiff($jtbcList);
    }
    $result = $ss -> all();
    return $result;
  }

  public function getMetaTargetVersion()
  {
    return array_key_exists('meta_target_version', $this -> meta)? intval($this -> meta['meta_target_version']): null;
  }

  public function __construct(string $argTaskFilePath)
  {
    $this -> taskFilePath = $argTaskFilePath;
    $this -> meta = MetaReader::read($this -> taskFilePath);
    $this -> rootPath = realpath(Path::getActualRoute('./') . '../');
    if (is_null($this -> meta))
    {
      throw new FileException('Failed to read meta data from "' . $this -> taskFilePath . '"', 50404);
    }
  }
}