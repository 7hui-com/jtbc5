<?php
namespace Jtbc\Module;
use Jtbc\Path;
use Jtbc\Config;
use Jtbc\Validation;
use Jtbc\Facade\Cache;
use Jtbc\Jtbc\JtbcReader;
use DirectoryIterator;

class ModuleFinder
{
  private $cache;
  private $isCacheable;
  private $guideFileName;

  private function getCacheName()
  {
    return 'modules-' . $this -> guideFileName;
  }

  public function getModules(string $argPrefixFolderName = '')
  {
    $result = [];
    $hasGot = false;
    $prefixFolderName = $argPrefixFolderName;
    $cacheName = $this -> getCacheName();
    $guideFileName = $this -> guideFileName;
    $isRoot = Validation::isEmpty($prefixFolderName)? true: false;
    if ($isRoot == true && $this -> isCacheable == true)
    {
      $cacheResult = $this -> cache -> get($cacheName);
      if (is_array($cacheResult))
      {
        $hasGot = true;
        $result = $cacheResult;
      }
    }
    if ($hasGot == false)
    {
      $order = null;
      $path = Path::getActualRoute('./');
      $extension = chr(46) . chr(106) . chr(116) . chr(98) . chr(99);
      if (!Validation::isEmpty($prefixFolderName)) $path .= $prefixFolderName;
      $dir = new DirectoryIterator($path);
      $defaultGuidePath = $path . '/common/guide' . $extension;
      $guidePath = $path . '/common/' . $guideFileName . $extension;
      if (is_file($guidePath))
      {
        $order = JtbcReader::getConfigure($guidePath, 'order');
        if (is_null($order) && is_file($defaultGuidePath))
        {
          $order = JtbcReader::getConfigure($defaultGuidePath, 'order');
        }
      }
      else if (is_file($defaultGuidePath))
      {
        $order = JtbcReader::getConfigure($defaultGuidePath, 'order');
      }
      foreach ($dir as $item)
      {
        if (!$item -> isDot() && $item -> isDir())
        {
          $folder = $item -> getFilename();
          if (!is_string($order) || !in_array($folder, explode(',', $order)))
          {
            $order .= ',' . $folder;
          }
        }
      }
      $orderArr = is_null($order)? null: explode(',', $order);
      if (is_array($orderArr))
      {
        $hasChildMode = strtolower(chr(74) . chr(84) . chr(66) . chr(67) . chr(70));
        foreach($orderArr as $key => $val)
        {
          if (!Validation::isEmpty($val))
          {
            $filename = $path . $val . '/common/' . $guideFileName . $extension;
            if (is_file($filename))
            {
              $result[] = $prefixFolderName . $val;
              if (JtbcReader::getXMLAttr($filename, 'mode') == $hasChildMode)
              {
                $result = array_merge($result, $this -> getModules($prefixFolderName . $val . '/'));
              }
            }
          }
        }
      }
      if ($isRoot == true && $this -> isCacheable == true)
      {
        $cacheTimeout = Config::get('Module/ModuleFinder', 'cache_timeout', 60);
        $this -> cache -> put($cacheName, $result, time() + intval($cacheTimeout));
      }
    }
    return $result;
  }

  public function removeCache()
  {
    return $this -> cache -> remove($this -> getCacheName());
  }

  public function __construct(string $argGuideFileName = 'guide', bool $argIsCacheable = true)
  {
    $this -> cache = new Cache();
    $this -> isCacheable = $argIsCacheable;
    $this -> guideFileName = $argGuideFileName;
  }
}