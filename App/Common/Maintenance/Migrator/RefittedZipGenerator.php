<?php
namespace App\Common\Maintenance\Migrator;
use ZipArchive;
use DirectoryIterator;
use Jtbc\JSON;
use Jtbc\Validation;
use Jtbc\Module\ModuleHelper;
use Jtbc\Exception\FileException;

class RefittedZipGenerator
{
  private $meta;
  private $basePath;
  private $taskFilePath;
  private $lastErrorCode;
  private $refittedTaskFilePath;

  private function getRefittedFilePath(string $argGenre, string $argFilePath)
  {
    return 'Public/' . $argGenre . '/' . $argFilePath;
  }

  public function getRefittedTaskFilePath()
  {
    return $this -> refittedTaskFilePath;
  }

  public function getLastErrorCode()
  {
    return $this -> lastErrorCode;
  }

  public function getTaskFileExtractPath()
  {
    return $this -> basePath . '/' . basename($this -> taskFilePath, '.zip');
  }

  public function generate(string $argGenre, string $argTargetTaskFilePath = null)
  {
    $result = false;
    $genre = $argGenre;
    $targetTaskFilePath = $argTargetTaskFilePath;
    if (Validation::isDirPath($genre))
    {
      $this -> meta['meta_genre'] = $genre;
      if (is_null($targetTaskFilePath))
      {
        $targetTaskFilePath = pathinfo($this -> taskFilePath, PATHINFO_DIRNAME) . '/' . $genre . '/' . pathinfo($this -> taskFilePath, PATHINFO_BASENAME);
      }
      $this -> refittedTaskFilePath = $targetTaskFilePath;
      $targetTaskFileDir = pathinfo($targetTaskFilePath, PATHINFO_DIRNAME);
      if (!is_dir($targetTaskFileDir) && !@mkdir($targetTaskFileDir, 0777, true))
      {
        $this -> lastErrorCode = 1001;
      }
      else
      {
        $zipArchive = new ZipArchive();
        $newZipArchive = new ZipArchive();
        $opened = $zipArchive -> open($this -> taskFilePath);
        $newOpened = $newZipArchive -> open($targetTaskFilePath, ZipArchive::CREATE);
        if ($opened === true && $newOpened === true)
        {
          $taskFileExtractPath = $this -> getTaskFileExtractPath();
          $extracted = $zipArchive -> extractTo($taskFileExtractPath);
          if ($extracted === true)
          {
            $addFileResult = true;
            if (array_key_exists('file', $this -> meta))
            {
              $file = $this -> meta['file'];
              if (is_array($file))
              {
                $newCreateArr = [];
                $newOverwriteArr = [];
                $newDeleteArr = [];
                if (array_key_exists('create', $file))
                {
                  $createArr = $file['create'];
                  if (is_array($createArr))
                  {
                    foreach ($createArr as $item)
                    {
                      $itemPath = $item['path'];
                      $currentFullFilePath = $taskFileExtractPath . '/' . $itemPath;
                      $filePath = $this -> getRefittedFilePath($genre, $itemPath);
                      $item['path'] = $filePath;
                      $newCreateArr[] = $item;
                      $added = $newZipArchive -> addFile($currentFullFilePath, $filePath);
                      if ($added !== true)
                      {
                        $addFileResult = false;
                      }
                    }
                  }
                }
                if (array_key_exists('overwrite', $file))
                {
                  $overwriteArr = $file['overwrite'];
                  if (is_array($overwriteArr))
                  {
                    foreach ($overwriteArr as $item)
                    {
                      $itemPath = $item['path'];
                      $currentFullFilePath = $taskFileExtractPath . '/' . $itemPath;
                      $filePath = $this -> getRefittedFilePath($genre, $itemPath);
                      $item['path'] = $filePath;
                      $newOverwriteArr[] = $item;
                      $added = $newZipArchive -> addFile($currentFullFilePath, $filePath);
                      if ($added !== true)
                      {
                        $addFileResult = false;
                      }
                    }
                  }
                }
                if (array_key_exists('delete', $file))
                {
                  $deleteArr = $file['delete'];
                  if (is_array($deleteArr))
                  {
                    foreach ($deleteArr as $item)
                    {
                      $itemPath = $item['path'];
                      $item['path'] = $this -> getRefittedFilePath($genre, $itemPath);
                      $newDeleteArr[] = $item;
                    }
                  }
                }
                $this -> meta['file']['create'] = $newCreateArr;
                $this -> meta['file']['overwrite'] = $newOverwriteArr;
                $this -> meta['file']['delete'] = $newDeleteArr;
              }
            }
            if (array_key_exists('jtbc', $this -> meta))
            {
              $jtbc = $this -> meta['jtbc'];
              if (is_array($jtbc))
              {
                $newCreateArr = [];
                $newOverwriteArr = [];
                $newDeleteArr = [];
                if (array_key_exists('create', $file))
                {
                  $createArr = $jtbc['create'];
                  if (is_array($deleteArr))
                  {
                    foreach ($createArr as $item)
                    {
                      $itemPath = $item['path'];
                      $item['path'] = $this -> getRefittedFilePath($genre, $itemPath);
                      $newCreateArr[] = $item;
                    }
                  }
                }
                if (array_key_exists('overwrite', $file))
                {
                  $overwriteArr = $jtbc['delete'];
                  if (is_array($overwriteArr))
                  {
                    foreach ($overwriteArr as $item)
                    {
                      $itemPath = $item['path'];
                      $item['path'] = $this -> getRefittedFilePath($genre, $itemPath);
                      $newOverwriteArr[] = $item;
                    }
                  }
                }
                if (array_key_exists('delete', $file))
                {
                  $deleteArr = $jtbc['delete'];
                  if (is_array($deleteArr))
                  {
                    foreach ($deleteArr as $item)
                    {
                      $itemPath = $item['path'];
                      $item['path'] = $this -> getRefittedFilePath($genre, $itemPath);
                      $newDeleteArr[] = $item;
                    }
                  }
                }
                $this -> meta['jtbc']['create'] = $newCreateArr;
                $this -> meta['jtbc']['overwrite'] = $newOverwriteArr;
                $this -> meta['jtbc']['delete'] = $newDeleteArr;
              }
            }
            if (array_key_exists('sql', $this -> meta))
            {
              $sql = $this -> meta['sql'];
              if (is_array($sql))
              {
                if (array_key_exists('upgrade', $sql))
                {
                  $upgradeSQL = str_replace('{$tableName}', ModuleHelper::getTableNameByGenre($genre), $sql['upgrade']);
                  $this -> meta['sql']['upgrade'] = $upgradeSQL;
                }
                if (array_key_exists('downgrade', $sql))
                {
                  $downgradeSQL = str_replace('{$tableName}', ModuleHelper::getTableNameByGenre($genre), $sql['downgrade']);
                  $this -> meta['sql']['downgrade'] = $downgradeSQL;
                }
              }
            }
            if (array_key_exists('folder', $this -> meta))
            {
              $folder = $this -> meta['folder'];
              if (is_array($folder))
              {
                $newDeleteIfEmptyArr = [];
                if (array_key_exists('delete_if_empty', $folder))
                {
                  $deleteIfEmptyArr = $folder['delete_if_empty'];
                  if (is_array($deleteIfEmptyArr))
                  {
                    foreach ($deleteIfEmptyArr as $item)
                    {
                      $itemPath = $item['path'];
                      $item['path'] = $this -> getRefittedFilePath($genre, $itemPath);
                      $newDeleteIfEmptyArr[] = $item;
                    }
                  }
                }
                $this -> meta['folder']['delete_if_empty'] = $newDeleteIfEmptyArr;
              }
            }
            if ($addFileResult === true)
            {
              $added = $newZipArchive -> addFromString('meta.json', JSON::encode($this -> meta));
              if ($added === true)
              {
                $result = true;
              }
              else
              {
                $this -> lastErrorCode = 1011;
              }
            }
            else
            {
              $this -> lastErrorCode = 1010;
            }
          }
        }
        else
        {
          $this -> lastErrorCode = 1002;
        }
        $zipArchive -> close();
        $newZipArchive -> close();
      }
    }
    else
    {
      $this -> lastErrorCode = 1000;
    }
    return $result;
  }

  public function __construct(string $argTaskFilePath)
  {
    $this -> taskFilePath = $argTaskFilePath;
    $this -> meta = MetaReader::read($this -> taskFilePath);
    $this -> basePath = pathinfo($this -> taskFilePath, PATHINFO_DIRNAME);
    if (is_null($this -> meta))
    {
      throw new FileException('Failed to read meta data from "' . $this -> taskFilePath . '"', 50404);
    }
    else if (!array_key_exists('meta_type', $this -> meta) || $this -> meta['meta_type'] != 'module')
    {
      throw new FileException('The meta parameter: "meta_type" can only be "module"', 50404);
    }
  }
}