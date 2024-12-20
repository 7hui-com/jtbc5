<?php
namespace App\Universal\Category;
use Jtbc\Jtbc;
use Jtbc\Module;
use Jtbc\Substance;
use Jtbc\Facade\Cache;
use Jtbc\Model\TinyModel;

class Category
{
  private $genre;
  private $lang;
  private $published;
  private $table;
  private $module;
  private $dbList;
  private $cache;
  private $cacheName;
  private $cacheTimeout;
  private $namePrefix;

  public function getAllId()
  {
    $result = [];
    $list = $this -> getList();
    foreach ($list as $item)
    {
      $result[] = intval($item['id']);
    }
    return $result;
  }

  public function getTitleById(int $argId)
  {
    return strval($this -> getRecordById($argId, 'title'));
  }

  public function getChildIdById(int $argId, bool $argIncludeSelf = false)
  {
    $id = $argId;
    $includeSelf = $argIncludeSelf;
    $result = [];
    if ($id != 0)
    {
      $getResultFromTree = function($argTree, $argGot = false) use (&$getResultFromTree, $id, $includeSelf)
      {
        $result = [];
        $got = $argGot;
        $tree = $argTree;
        foreach ($tree as $item)
        {
          $currentGot = $got;
          $children = $item['children'];
          $currentId = intval($item['id']);
          if ($got == true)
          {
            $result[] = $currentId;
          }
          else if ($currentId == $id)
          {
            $currentGot = true;
            if ($includeSelf == true)
            {
              $result[] = $currentId;
            }
          }
          if (!empty($children))
          {
            $result = array_merge($result, $getResultFromTree($children, $currentGot));
          }
        }
        return $result;
      };
      $result = $getResultFromTree($this -> getTree());
    }
    return $result;
  }

  public function getFatherGroupById(int $argId, bool $argIncludeSelf = false)
  {
    $id = $argId;
    $includeSelf = $argIncludeSelf;
    $list = $this -> getList();
    $getFatherInfo = function(int $argId) use (&$getFatherInfo, $id, $includeSelf, $list)
    {
      $result = [];
      $currentId = $argId;
      foreach ($list as $item)
      {
        $itemId = intval($item['id']);
        $itemTitle = $item['title'];
        $itemFatherId = $item['father_id'];
        if ($itemId == $currentId)
        {
          if ($itemId == $id && $includeSelf == false)
          {
            $result = $getFatherInfo($itemFatherId);
          }
          else
          {
            $result = [['id' => $itemId, 'title' => $itemTitle]];
            $result = array_merge($result, $getFatherInfo($itemFatherId));
          }
          break;
        }
      }
      return $result;
    };
    $result = array_reverse($getFatherInfo($id));
    return $result;
  }

  public function getList(array $argFilters = [])
  {
    $result = [];
    $filters = $argFilters;
    $tempResult = [];
    $cacheName = $this -> cacheName;
    if ($this -> cacheTimeout == 0)
    {
      $tempResult = $this -> getDBList();
    }
    else
    {
      $cacheResult = $this -> cache -> get($cacheName);
      if (is_array($cacheResult))
      {
        $tempResult = $cacheResult;
      }
      else
      {
        $tempResult = $this -> getDBList();
        $this -> cache -> put($cacheName, $tempResult, time() + $this -> cacheTimeout);
      }
    }
    if (empty($filters))
    {
      $result = $tempResult;
    }
    else
    {
      foreach ($tempResult as $item)
      {
        $currentId = intval($item['id']);
        if (in_array($currentId, $filters))
        {
          $result[] = $item;
        }
      }
    }
    return $result;
  }

  public function getOptions()
  {
    $getResultFromTree = function($argTree) use (&$getResultFromTree)
    {
      $result = [];
      $tree = $argTree;
      if (is_array($tree))
      {
        foreach ($tree as $item)
        {
          $children = $item['children'];
          $result[] = ['text' => str_repeat($this -> namePrefix, $item['rank']) . $item['title'], 'value' => intval($item['id'])];
          if (!empty($children))
          {
            $result = array_merge($result, $getResultFromTree($children));
          }
        }
      }
      return $result;
    };
    return $getResultFromTree($this -> getTree());
  }

  public function getRecordById(int $argId, ?string $argFieldName = null)
  {
    $result = null;
    $id = $argId;
    $fieldName = $argFieldName;
    $list = $this -> getList();
    foreach ($list as $item)
    {
      $currentId = intval($item['id']);
      if ($currentId == $id)
      {
        if (is_null($fieldName))
        {
          $result = new Substance($item);
        }
        else
        {
          if (array_key_exists($fieldName, $item))
          {
            $result = $item[$fieldName];
          }
        }
        break;
      }
    }
    return $result;
  }

  public function getTree()
  {
    $result = null;
    $list = $this -> getList();
    if (!is_null($list))
    {
      $getTree = function(int $argFatherId = 0, int $argRank = 0) use (&$getTree, $list)
      {
        $result = [];
        $fatherId = $argFatherId;
        $rank = $argRank;
        foreach ($list as $item)
        {
          $currentId = intval($item['id']);
          $currentFatherId = intval($item['father_id']);
          if ($currentFatherId == $fatherId)
          {
            $item['rank'] = $rank;
            $item['children'] = $getTree($currentId, $rank + 1);
            $result[] = $item;
          }
        }
        return $result;
      };
      $result = $getTree();
    }
    return $result;
  }

  public function getTreeOptions()
  {
    $getResultFromTree = function($argTree) use (&$getResultFromTree)
    {
      $result = [];
      $tree = $argTree;
      if (is_array($tree))
      {
        foreach ($tree as $item)
        {
          $children = $item['children'];
          $entry = ['text' => $item['title'], 'value' => intval($item['id'])];
          if (!empty($children))
          {
            $entry['children'] = $getResultFromTree($children);
          }
          $result[] = $entry;
        }
      }
      return $result;
    };
    return $getResultFromTree($this -> getTree());
  }

  public function getDBList()
  {
    $result = $this -> dbList;
    if (is_null($result))
    {
      $model = new TinyModel($this -> table);
      $model -> where -> genre = $this -> genre;
      $model -> where -> lang = $this -> lang;
      if (is_int($this -> published))
      {
        $model -> where -> published = $this -> published;
      }
      $model -> orderBy('father_id', 'asc');
      $model -> orderBy('order', 'desc');
      $model -> orderBy('id', 'asc');
      $result = $model -> getAll('*') -> toArray();
    }
    return $result;
  }

  public function __construct(string $argGenre, int $argLang, ?int $argPublished = null)
  {
    $this -> genre = $argGenre;
    $this -> lang = $argLang;
    $this -> published = $argPublished;
    $this -> module = new Module('universal/category');
    $this -> table = $this -> module -> getTableName();
    $this -> cache = new Cache();
    $this -> cacheName = 'universal-category-' . str_replace('/', '-', $this -> genre) . '-' . $this -> lang;
    if (is_int($this -> published))
    {
      $this -> cacheName = $this -> cacheName . '-' . $this -> published;
    }
    $this -> cacheTimeout = intval($this -> module -> config['cache-timeout'] ?? 0);
    $this -> namePrefix = Jtbc::take('global.' . $this -> module -> getName() . ':config.prefix', 'lng');
  }
}