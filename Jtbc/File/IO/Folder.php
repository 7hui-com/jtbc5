<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\File\IO;
use DirectoryIterator;
use ZipArchive;

class Folder
{
  public static function copyTo(string $argDirPath, string $argTargetDirPath)
  {
    $result = false;
    $dirPath = $argDirPath;
    $targetDirPath = $argTargetDirPath;
    if (is_dir($dirPath))
    {
      if (!is_dir($targetDirPath))
      {
        @mkdir($targetDirPath, 0777, true);
      }
      if (is_dir($targetDirPath))
      {
        $dirIterator = new DirectoryIterator($dirPath);
        foreach ($dirIterator as $item)
        {
          $filename = $item -> getFilename();
          if (!$item -> isDot())
          {
            $itemResult = $item -> isDir()? self::copyTo($dirPath . '/' . $filename, $targetDirPath . '/' . $filename): @copy($dirPath . '/' . $filename, $targetDirPath . '/' . $filename);
            if ($itemResult == false)
            {
              $result = false;
              break;
            }
          }
        }
        $result = true;
      }
    }
    return $result;
  }

  public static function delete(string $argDirPath)
  {
    $result = false;
    $dirPath = $argDirPath;
    $isBroken = false;
    $dirIterator = new DirectoryIterator($dirPath);
    foreach ($dirIterator as $item)
    {
      $filename = $item -> getFilename();
      if (!$item -> isDot())
      {
        $itemResult = false;
        if ($item -> isDir())
        {
          $itemResult = self::delete($dirPath . '/' . $filename);
        }
        else
        {
          $itemResult = @unlink($dirPath . '/' . $filename);
        }
        if ($itemResult == false)
        {
          $result = false;
          $isBroken = true;
          break;
        }
      }
    }
    if ($isBroken != true)
    {
      $result = @rmdir($dirPath);
    }
    return $result;
  }

  public static function getSize(string $argDirPath)
  {
    $result = 0;
    $dirPath = $argDirPath;
    $dirIterator = new DirectoryIterator($dirPath);
    foreach ($dirIterator as $item)
    {
      $filename = $item -> getFilename();
      if (!$item -> isDot())
      {
        if ($item -> isDir())
        {
          $result += self::getSize($dirPath . '/' . $filename);
        }
        else
        {
          $result += $item -> getSize();
        }
      }
    }
    return $result;
  }

  public static function zip(string $argDirPath, string $argZipPath, array $argSpecialFolders = [])
  {
    $result = false;
    $dirPath = $argDirPath;
    $zipPath = $argZipPath;
    if (is_dir($dirPath) && !is_file($zipPath))
    {
      $zip = new ZipArchive();
      $opened = $zip -> open($zipPath, ZipArchive::CREATE);
      if ($opened === true)
      {
        $result = true;
        $addDir = function(string $argDirPath, int $argPrefixLength) use (&$zip, &$addDir, $argSpecialFolders)
        {
          $dirIterator = new DirectoryIterator($argDirPath);
          foreach ($dirIterator as $item)
          {
            $realPath = $item -> getRealPath();
            $localPath = str_replace(DIRECTORY_SEPARATOR, '/', substr($realPath, $argPrefixLength));
            if (!in_array($localPath, $argSpecialFolders))
            {
              if (!$item -> isDot())
              {
                if ($item -> isDir())
                {
                  $zip -> addEmptyDir($localPath);
                  $addDir($realPath, $argPrefixLength);
                }
                else
                {
                  $zip -> addFile($realPath, $localPath);
                }
              }
            }
          }
        };
        $addDir($dirPath, strlen(realpath($dirPath)) + 1);
        $zip -> close();
      }
    }
    return $result;
  }
}