<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\DB\Schema;
use Jtbc\DB;
use Jtbc\Config;
use Jtbc\Facade\Cache;

class SchemaViewer
{
  private $db;
  private $cache;
  private $cachePrefix = 'db_structure_';

  public function getFieldInfo(string $argTable, string $argField)
  {
    $result = null;
    $table = $argTable;
    $field = $argField;
    $tableInfo = $this -> getTableInfo($table);
    if (!is_null($tableInfo))
    {
      foreach ($tableInfo as $item)
      {
        if ($item['field'] == $field)
        {
          $result = $item;
          break;
        }
      }
    }
    return $result;
  }

  public function getFields(string $argTable)
  {
    $result = [];
    $table = $argTable;
    $tableInfo = $this -> getTableInfo($table);
    if (!is_null($tableInfo))
    {
      foreach ($tableInfo as $item)
      {
        $result[] = $item['field'];
      }
    }
    return $result;
  }

  public function getTableInfo(string $argTable)
  {
    $table = $argTable;
    $tableInfo = null;
    $isCacheable = Config::get('DB', 'structure_is_cacheable', true);
    if ($isCacheable == true)
    {
      $cacheName = $this -> cachePrefix . $table;
      $tableInfo = $this -> cache -> get($cacheName);
      if (empty($tableInfo))
      {
        $tableInfo = $this -> db -> getTableInfo($table);
        $this -> cache -> put($cacheName, $tableInfo);
      }
    }
    else
    {
      $tableInfo = $this -> db -> getTableInfo($table);
    }
    return $tableInfo;
  }

  public function hasField(string $argTable, string $argField)
  {
    return in_array($argField, $this -> getFields($argTable))? true: false;
  }

  public function removeCache(string $argTable)
  {
    $table = $argTable;
    $cacheName = $this -> cachePrefix . $table;
    return $this -> cache -> remove($cacheName);
  }

  public function __construct(DB $db)
  {
    $this -> db = $db;
    $this -> cache = new Cache();
  }
}