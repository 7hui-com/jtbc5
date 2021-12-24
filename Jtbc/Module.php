<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;
use Jtbc\Jtbc\JtbcReader;
use Jtbc\Module\ModuleHelper;
use Jtbc\Module\ModuleFinder;
use Jtbc\String\StringHelper;
use DirectoryIterator;

class Module
{
  private $genre;
  private $folder;
  private $tableName;
  private $isCacheable;
  private $guideFileName;

  public function getName()
  {
    return $this -> genre;
  }

  public function getFolderName()
  {
    return $this -> folder;
  }

  public function getPath()
  {
    return Path::getActualRoute($this -> genre);
  }

  public function getTitle(bool $argForestage = true)
  {
    $result = null;
    $forestage = $argForestage;
    $currentGenre = $this -> genre;
    if (Validation::isEmpty($currentGenre))
    {
      $result = Jtbc::take('global.index.title', 'lng');
    }
    else
    {
      if ($forestage === true)
      {
        $result = Jtbc::take('global.' . $currentGenre . ':index.title', 'lng') ?? Jtbc::take('global.' . $currentGenre . ':guide.title', 'cfg');
      }
      else
      {
        $result = Jtbc::take('global.' . $currentGenre . ':guide.title', 'cfg') ?? Jtbc::take('global.' . $currentGenre . ':index.title', 'lng');
      }
    }
    return $result;
  }

  public function getChildGenreList(...$args)
  {
    $result = [];
    $currentGenre = $this -> genre;
    $moduleFinder = new ModuleFinder($this -> guideFileName, $this -> isCacheable);
    $genreArr = $moduleFinder -> getModules(...$args);
    foreach ($genreArr as $genre)
    {
      if (Validation::isEmpty($currentGenre) || str_starts_with($genre, $currentGenre . '/'))
      {
        $usefulGenre = Validation::isEmpty($currentGenre)? $genre: substr($genre, strlen($currentGenre . '/'));
        if (!str_contains($usefulGenre, '/'))
        {
          $result[] = $genre;
        }
      }
    }
    return $result;
  }

  public function getParentGenreList(bool $argIncludeSelf = false)
  {
    $result = [];
    $includeSelf = $argIncludeSelf;
    $currentGenre = $this -> genre;
    if (str_contains($currentGenre, '/'))
    {
      $pre = '';
      $folderList = explode('/', $currentGenre);
      foreach ($folderList as $folder)
      {
        $parentGenre = $pre . $folder;
        if ($includeSelf == true || $parentGenre != $currentGenre)
        {
          $result[] = $parentGenre;
          $pre = $parentGenre . '/';
        }
      }
    }
    else
    {
      if ($includeSelf == true)
      {
        $result[] = $currentGenre;
      }
    }
    return $result;
  }

  public function getFileList(string $argFileType = null)
  {
    $result = [];
    $fileType = $argFileType;
    $path = $this -> getPath() . '/common/';
    if (is_string($fileType))
    {
      $path .= $fileType . '/';
    }
    if (is_dir($path))
    {
      $fileList = [];
      $dirIterator = new DirectoryIterator($path);
      foreach ($dirIterator as $item)
      {
        $filename = $item -> getFilename();
        if (!$item -> isDot())
        {
          if ($item -> isFile())
          {
            $fileList[$filename] = ['filename' => $filename];
          }
        }
      }
      ksort($fileList);
      foreach ($fileList as $file)
      {
        $result[] = $file;
      }
    }
    return $result;
  }

  public function getTableName()
  {
    $tableName = $this -> tableName;
    if (is_null($tableName) && $this -> hasNoTable == false)
    {
      $currentGenre = $this -> genre;
      if (!Validation::isEmpty($currentGenre))
      {
        $tableName = $this -> tableName = $this -> config -> db_table ?? ModuleHelper::getTableNameByGenre($currentGenre);
      }
    }
    return $tableName;
  }

  public function getTableNameList()
  {
    $result = [];
    $tableName = $this -> getTableName();
    if (!is_null($tableName))
    {
      $result[] = $tableName;
      $currentGenre = $this -> genre;
      if (!Validation::isEmpty($currentGenre))
      {
        $config = $this -> config;
        if (Validation::isJSON($config -> db_subtable))
        {
          $subTable = JSON::decode($config -> db_subtable);
          foreach ($subTable as $item)
          {
            if (Validation::isNatural($item))
            {
              $result[] = $tableName . '-' . $item;
            }
          }
        }
        foreach ($config as $key => $val)
        {
          if (str_starts_with($key, 'db_table_') && !in_array($val, $result))
          {
            $result[] = $val;
          }
        }
      }
    }
    return $result;
  }

  public function getTableNameByKey(string $argKey)
  {
    $key = $argKey;
    $tableName = null;
    if ($this -> hasNoTable == false)
    {
      if (!Validation::isEmpty($this -> genre) && Validation::isNatural($key))
      {
        $config = $this -> config;
        if (Validation::isJSON($config -> db_subtable))
        {
          $subTable = JSON::decode($config -> db_subtable);
          if (in_array($key, $subTable))
          {
            $tableName = $this -> getTableName() . '-' . $key;
          }
        }
        if (is_null($tableName))
        {
          $tableName = $config['db_table_' . $key];
        }
      }
    }
    return $tableName;
  }

  public function isExists()
  {
    return is_dir($this -> getPath())? true: false;
  }

  public function __get($argName)
  {
    $result = null;
    $name = $argName;
    $preset = [
      'hasNoTable' => 'hasnotable',
      'isCloneAble' => 'cloneable',
      'isUninstallAble' => 'uninstallable',
      'isBatchUninstallAble' => 'batchuninstallable',
      'isSettingAble' => 'settingable',
      'isAnonymous' => 'anonymous',
    ];
    $currentGenre = $this -> genre;
    if (array_key_exists($name, $preset))
    {
      if (Validation::isEmpty($currentGenre)) $result = false;
      else
      {
        $key = $preset[$name];
        $result = trim(strtolower(strval($this -> config -> {$key}))) == 'true'? true: false;
      }
    }
    else if ($name == 'isParentModule')
    {
      $guideFilePath = $this -> getPath() . '/common/' . $this -> guideFileName . '.jtbc';
      $result = JtbcReader::getXMLAttr($guideFilePath, 'mode') == 'jtbcf'? true: false;
    }
    else
    {
      if (Validation::isNatural($name))
      {
        if (Validation::isEmpty($currentGenre))
        {
          $result = new Substance(Jtbc::take('global.' . $name . '.*', 'cfg'));
        }
        else
        {
          $result = new Substance(Jtbc::take('global.' . $currentGenre . ':' . $name . '.*', 'cfg'));
        }
      }
    }
    return $result;
  }

  public function __construct(string $argGenre = null, string $argGuideFileName = 'guide', bool $argIsCacheable = true)
  {
    $this -> genre = $argGenre ?? Path::getCurrentGenre();
    $this -> guideFileName = $argGuideFileName;
    $this -> isCacheable = $argIsCacheable;
    $this -> folder = str_contains($this -> genre, '/') === false? $this -> genre: StringHelper::getClipedString($this -> genre, '/', 'right');
  }
}