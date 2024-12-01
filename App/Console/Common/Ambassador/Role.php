<?php
namespace App\Console\Common\Ambassador;
use Jtbc\DI;
use Jtbc\Jtbc;
use Jtbc\JSON;
use Jtbc\Validation;
use Jtbc\Auth\Permission;
use Jtbc\Auth\Role as RoleInterface;
use App\Console\Role\Model as RoleModel;

class Role implements RoleInterface
{
  private $di = null;
  private $lang = 0;
  private $roleId = 0;
  private $currentGenre = null;
  private $isSuper = false;
  private $policies = [];
  private $roleName = 'Unkown';
  private $roleLang = null;
  private $permissionInstance = null;
  private $cookieLangName = 'console_lang';

  public function checkPermission(?string $argSubOrSegmentName = null, ?string $argSegmentKey = null)
  {
    return $this -> permission -> hasPermission($this -> currentGenre, $argSubOrSegmentName, $argSegmentKey);
  }

  public function filterSegment(array $argSegments, string $argSegmentName)
  {
    $result = [];
    $segments = $argSegments;
    $segmentName = $argSegmentName;
    if ($this -> isSuper)
    {
      $result = $segments;
    }
    else
    {
      foreach ($segments as $segment)
      {
        if ($this -> checkPermission($segmentName, $segment))
        {
          $result[] = $segment;
        }
      }
    }
    return $result;
  }

  public function filterSegmentOptions(array $argOptions, string $argSegmentName, bool $argSetDisabled = false)
  {
    $result = [];
    $options = $argOptions;
    $segmentName = $argSegmentName;
    $setDisabled = $argSetDisabled;
    if ($this -> isSuper)
    {
      $result = $options;
    }
    else if ($segmentName == 'category' && Validation::isEmpty($this -> permission -> getSegment($this -> currentGenre, 'category')))
    {
      $result = $options;
    }
    else
    {
      foreach ($options as $option)
      {
        if ($this -> checkPermission($segmentName, $option['value']))
        {
          $result[] = $option;
        }
        else
        {
          if ($setDisabled === true)
          {
            $option['disabled'] = true;
            $result[] = $option;
          }
        }
      }
    }
    return $result;
  }

  public function filterSegmentTreeOptions(array $argTreeOptions, string $argSegmentName, bool $argSetDisabled = false)
  {
    $result = [];
    $treeOptions = $argTreeOptions;
    $segmentName = $argSegmentName;
    $setDisabled = $argSetDisabled;
    if ($this -> isSuper)
    {
      $result = $treeOptions;
    }
    else if ($segmentName == 'category' && Validation::isEmpty($this -> permission -> getSegment($this -> currentGenre, 'category')))
    {
      $result = $treeOptions;
    }
    else
    {
      $filterTreeOptions = function($treeOptions) use (&$filterTreeOptions, $segmentName, $setDisabled)
      {
        $result = [];
        foreach ($treeOptions as $treeOption)
        {
          if ($this -> checkPermission($segmentName, $treeOption['value']))
          {
            if (array_key_exists('children', $treeOption))
            {
              $treeOptionsOfChildren = [];
              $children = $treeOption['children'];
              if (is_array($children))
              {
                $treeOptionsOfChildren = $filterTreeOptions($children);
              }
              if (empty($treeOptionsOfChildren))
              {
                unset($treeOption['children']);
              }
              else
              {
                $treeOption['children'] = $treeOptionsOfChildren;
              }
            }
            $result[] = $treeOption;
          }
          else
          {
            if ($setDisabled === true)
            {
              $treeOption['disabled'] = true;
              $result[] = $treeOption;
            }
          }
        }
        return $result;
      };
      $result = $filterTreeOptions($treeOptions);
    }
    return $result;
  }

  public function getId()
  {
    return $this -> roleId;
  }

  public function getName()
  {
    return $this -> roleName;
  }

  public function getPermission(): Permission
  {
    $this -> permissionInstance = new Permission($this -> isSuper, $this -> policies);
    return $this -> permissionInstance;
  }

  public function getRoleLangs()
  {
    $result = [];
    $roleLang = $this -> roleLang;
    if (is_string($roleLang))
    {
      $tempArray = JSON::decode($roleLang);
      if (is_array($tempArray))
      {
        foreach ($tempArray as $item)
        {
          if (is_numeric($item))
          {
            $result[] = intval($item);
          }
        }
      }
    }
    return $result;
  }

  public function getLang()
  {
    $lang = $this -> lang;
    if (!$this -> isSuper)
    {
      $roleLangs = $this -> getRoleLangs();
      if (empty($roleLangs))
      {
        $lang = 0;
      }
      else
      {
        if (!in_array($lang, $roleLangs))
        {
          $lang = $roleLangs[0];
          $this -> setLang($lang);
        }
      }
    }
    return $lang;
  }

  public function getCurrentBatch()
  {
    $result = [];
    $batch = Jtbc::take('guide.batch', 'cfg');
    if (!Validation::isEmpty($batch))
    {
      $batchArr = explode(',', $batch);
      foreach ($batchArr as $item)
      {
        if ($this -> checkPermission($item))
        {
          $result[] = ['name' => $item, 'title' => Jtbc::take('::sel_subpermission.' . $item, 'lng')];
        }
      }
    }
    return $result;
  }

  public function getCurrentSubPermission()
  {
    $result = [];
    $subPermission = Jtbc::take('guide.subpermissions', 'cfg');
    if (!Validation::isEmpty($subPermission))
    {
      $subPermissionArr = explode(',', $subPermission);
      foreach ($subPermissionArr as $item)
      {
        $result[$item] = $this -> checkPermission($item);
      }
    }
    return $result;
  }

  public function setLang($argLang)
  {
    $bool = false;
    $lang = intval($argLang);
    $allLang = Jtbc::take('::sel_lang.*', 'lng');
    if (array_key_exists($lang, $allLang))
    {
      $this -> lang = $lang;
      $this -> di -> response -> cookie -> set($this -> cookieLangName, $lang, time() + 60 * 60 * 24 * 365);
    }
    return $bool;
  }

  public function __get($argName)
  {
    $result = null;
    $name = $argName;
    if ($name == 'isSuper')
    {
      $result = $this -> isSuper;
    }
    else if ($name == 'permission')
    {
      $result = $this -> permissionInstance ?? $this -> getPermission();
    }
    return $result;
  }

  public function __construct(DI $di, int $argRoleId, string $argGenre)
  {
    $this -> di = $di;
    $this -> roleId = $argRoleId;
    $this -> currentGenre = $argGenre;
    if ($this -> roleId == -1)
    {
      $this -> isSuper = true;
      $this -> roleName = Jtbc::take('::communal.role-super', 'lng');
    }
    else
    {
      $model = new RoleModel();
      $model -> where -> id = $this -> roleId;
      $rs = $model -> get();
      if ($rs != null)
      {
        $this -> roleName = $rs -> title;
        $this -> roleLang = $rs -> lang;
        $this -> policies = Validation::isEmpty($rs -> permission)? []: JSON::decode($rs -> permission);
      }
    }
    $this -> lang = intval($this -> di -> request -> cookie -> get($this -> cookieLangName));
  }
}