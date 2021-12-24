<?php
namespace App\Common\Maintenance\Migrator;
use Jtbc\Substance;

class OperationGuider
{
  private $diffed;
  private $taskFilePath;
  private $taskScanner;
  private $guideMap;
  public const OPINION_SKIP = 1;
  public const OPINION_OVERWRITE = 2;
  public const OPINION_IGNORE = 3;
  public const OPINION_KEEP = 4;
  public const OPINION_CREATE = 5;
  public const OPINION_DELETE = 6;

  public function getDiffed()
  {
    $diffed = $this -> diffed;
    if (is_null($diffed))
    {
      $diffed = $this -> diffed = $this -> taskScanner -> diff();
    }
    return $diffed;
  }

  public function getOpinion(string $argType, int $argId)
  {
    $result = null;
    $type = $argType;
    $id = $argId;
    if (in_array($type, ['file', 'jtbc']))
    {
      $opinionKey = 'opinion_' . $type . '_' . $id;
      if ($this -> guideMap -> exists($opinionKey))
      {
        $opinionValue = intval($this -> guideMap[$opinionKey]);
        if ($opinionValue != 0)
        {
          $result = $opinionValue;
        }
      }
    }
    return $result;
  }

  public function isFullGuided()
  {
    $result = true;
    $diffed = new Substance($this -> getDiffed());
    $fileList = $diffed -> file ?? [];
    $jtbcList = $diffed -> jtbc ?? [];
    foreach ($fileList as $group)
    {
      if (is_array($group))
      {
        foreach ($group as $item)
        {
          $file = new Substance($item);
          if ($file -> diffed_status !== 0 && is_null($this -> getOpinion('file', $file -> id)))
          {
            $result = false;
            break;
          }
        }
      }
    }
    if ($result !== false)
    {
      foreach ($jtbcList as $group)
      {
        if (is_array($group))
        {
          foreach ($group as $item)
          {
            $jtbc = new Substance($item);
            if ($jtbc -> diffed_status !== 0 && is_null($this -> getOpinion('jtbc', $jtbc -> id)))
            {
              $result = false;
              break;
            }
          }
        }
      }
    }
    return $result;
  }

  public function __call($argName, $args) 
  {
    $result = null;
    $name = strval($argName);
    if ($name == 'isSkipOpinion')
    {
      $result = intval($this -> getOpinion(...$args)) === self::OPINION_SKIP? true: false;
    }
    else if ($name == 'isOverwriteOpinion')
    {
      $result = intval($this -> getOpinion(...$args)) === self::OPINION_OVERWRITE? true: false;
    }
    else if ($name == 'isIgnoreOpinion')
    {
      $result = intval($this -> getOpinion(...$args)) === self::OPINION_IGNORE? true: false;
    }
    else if ($name == 'isKeepOpinion')
    {
      $result = intval($this -> getOpinion(...$args)) === self::OPINION_KEEP? true: false;
    }
    else if ($name == 'isCreateOpinion')
    {
      $result = intval($this -> getOpinion(...$args)) === self::OPINION_CREATE? true: false;
    }
    else if ($name == 'isDeleteOpinion')
    {
      $result = intval($this -> getOpinion(...$args)) === self::OPINION_DELETE? true: false;
    }
    return $result;
  }

  public function __construct(string $argTaskFilePath, array $argGuideMap)
  {
    $this -> taskFilePath = $argTaskFilePath;
    $this -> guideMap = new Substance($argGuideMap);
    $this -> taskScanner = new TaskScanner($this -> taskFilePath);
  }
}