<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Cache;
use DirectoryIterator;
use Jtbc\Cache;
use Jtbc\Config;
use Jtbc\Path;
use Jtbc\JSON;
use Jtbc\Validation;
use Jtbc\Exception\FileException;

class FileCache implements Cache
{
  private $filename;
  private $expires;
  private $suffix = '.cache';

  private function getCacheDir()
  {
    return Path::getActualRoute(Path::getRuntimeDirectory('Cache'));
  }

  private function getFileData()
  {
    $fileData = null;
    $fileContent = file_get_contents($this -> filename);
    if (!Validation::isEmpty($fileContent))
    {
      $fileContentArray = JSON::decode($fileContent);
      if (is_array($fileContentArray))
      {
        if (array_key_exists('expires', $fileContentArray) && array_key_exists('data', $fileContentArray))
        {
          $currentExpires = $fileContentArray['expires'];
          $currentData = $fileContentArray['data'];
          if (is_null($currentExpires) || (is_numeric($currentExpires) && $currentExpires > time())) $fileData = $currentData;
        }
      }
    }
    return $fileData;
  }

  private function putFileData($argData)
  {
    $data = $argData;
    $fileData = [];
    $fileData['expires'] = $this -> expires;
    $fileData['data'] = $data;
    $bool = file_put_contents($this -> filename, JSON::encode($fileData));
    return $bool;
  }

  public function exists($argName)
  {
    $bool = false;
    $name = $argName;
    $dir = $this -> getCacheDir();
    $cacheFilename = $dir . '/' . $name . $this -> suffix;
    if (is_file($cacheFilename)) $bool = true;
    return $bool;
  }

  public function get($argName)
  {
    $result = null;
    $name = $argName;
    if ($this -> exists($name))
    {
      $dir = $this -> getCacheDir();
      $this -> filename = $dir . '/' . $name . $this -> suffix;
      $result = $this -> getFileData();
    }
    return $result;
  }

  public function getAll()
  {
    $result = [];
    $dir = new DirectoryIterator($this -> getCacheDir());
    foreach ($dir as $item)
    {
      if ($item -> isFile())
      {
        $extension = $item -> getExtension();
        if (strpos($this -> suffix, $extension) === 1)
        {
          $result[] = ['title' => $item -> getBasename($this -> suffix), 'last_timestamp' => $item -> getMTime(), 'size' => $item -> getSize()];
        }
      }
    }
    return $result;
  }

  public function put($argName, $argData, $argExpires = null)
  {
    $bool = false;
    $name = $argName;
    $data = $argData;
    $expires = $argExpires;
    $dir = $this -> getCacheDir();
    if (!is_dir($dir)) throw new FileException('Could not find the folder "' . $dir . '"', 50404);
    else
    {
      $this -> filename = $dir . '/' . $name . $this -> suffix;
      $this -> expires = $expires;
      $bool = $this -> putFileData($data);
    }
    return $bool;
  }

  public function remove($argName)
  {
    $name = $argName;
    $bool = false;
    $dir = $this -> getCacheDir();
    if (!Validation::isEmpty($name))
    {
      $cacheFilename = $dir . '/' . $name . $this -> suffix;
      $bool = @unlink($cacheFilename);
    }
    return $bool;
  }

  public function removeAll()
  {
    $bool = false;
    $all = $this -> getAll();
    foreach ($all as $item)
    {
      $bool = $this -> remove($item['title']);
    }
    return $bool;
  }

  public function removeByKey($argKey, $argMode = 0)
  {
    $bool = false;
    $key = $argKey;
    $mode = $argMode;
    $all = $this -> getAll();
    foreach ($all as $item)
    {
      $title = strval($item['title']);
      if ($mode == 0 && str_starts_with($title, $key))
      {
        $bool = $this -> remove($title);
      }
      else if ($mode == 1 && str_contains($title, $key))
      {
        $bool = $this -> remove($title);
      }
    }
    return $bool;
  }
}