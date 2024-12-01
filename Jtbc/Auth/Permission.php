<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Auth;
use Jtbc\Substance;

class Permission
{
  private $isSuper = false;
  public $policies = null;

  public function getSegment(string $argItemName, string $argSegmentName)
  {
    $result = null;
    $itemName = $argItemName;
    $segmentName = $argSegmentName;
    if ($this -> policies -> exists($itemName))
    {
      $itemValue = $this -> policies[$itemName];
      $itemSegmentValue = $itemValue['segment'];
      if (array_key_exists($segmentName, $itemSegmentValue))
      {
        $result = $itemSegmentValue[$segmentName];
      }
    }
    return $result;
  }

  public function hasPermission(string $argItemName, ?string $argSubOrSegmentName = null, ?string $argSegmentKey = null)
  {
    $result = false;
    $itemName = $argItemName;
    $subOrSegmentName = $argSubOrSegmentName;
    $segmentKey = $argSegmentKey;
    if ($this -> isSuper == true)
    {
      $result = true;
    }
    else
    {
      if ($subOrSegmentName == null)
      {
        $result = $this -> policies -> exists($itemName);
      }
      else
      {
        $itemValue = $this -> policies[$itemName];
        if (is_array($itemValue))
        {
          if ($segmentKey == null)
          {
            $subName = $subOrSegmentName;
            $itemSubValue = $itemValue['sub'];
            if (is_array($itemSubValue) && in_array($subName, $itemSubValue))
            {
              $result = true;
            }
          }
          else
          {
            $segmentName = $subOrSegmentName;
            $itemSegmentValue = $itemValue['segment'];
            if (array_key_exists($segmentName, $itemSegmentValue))
            {
              $segmentValue = $itemSegmentValue[$segmentName];
              if (is_array($segmentValue) && in_array($segmentKey, $segmentValue))
              {
                $result = true;
              }
            }
          }
        }
      }
    }
    return $result;
  }

  public function __construct(bool $argIsSuper = false, array $argPolicies = [])
  {
    $this -> isSuper = $argIsSuper;
    $this -> policies = new Substance($argPolicies);
  }
}