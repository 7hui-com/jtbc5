<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\File\IO;
use DirectoryIterator;

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
}