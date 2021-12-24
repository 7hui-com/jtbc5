<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;

class JSON
{
  public static function encode($argValue)
  {
    return json_encode($argValue);
  }

  public static function decode(string $argJSONString)
  {
    return json_decode($argJSONString, true);
  }

  public static function getLastErrorCode()
  {
    return json_last_error();
  }

  public static function getLastErrorMessage()
  {
    return json_last_error_msg();
  }

  public static function getValueFromJSON($argJSONString, string $argName)
  {
    $result = null;
    $JSONString = $argJSONString;
    $name = $argName;
    if (is_string($JSONString))
    {
      $jsonArr = self::decode($JSONString);
      if (is_array($jsonArr))
      {
        $sourceArr = $jsonArr;
        $nameList = explode('->', $name);
        foreach ($nameList as $currentName)
        {
          $result = null;
          if (is_array($sourceArr) && array_key_exists($currentName, $sourceArr))
          {
            $result = $sourceArr = $sourceArr[$currentName];
          }
        }
      }
    }
    return $result;
  }
}