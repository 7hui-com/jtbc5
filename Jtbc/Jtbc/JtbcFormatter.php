<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Jtbc;
use Jtbc\Jtbc;
use Jtbc\JSON;
use Jtbc\Encoder;

class JtbcFormatter
{
  public static function checkbox($argCodeName, string $argName, $argValue = null)
  {
    $result = '';
    $codeName = $argCodeName;
    $name = $argName;
    $value = $argValue;
    $dataArr = Jtbc::take($codeName, 'lng');
    if (is_array($dataArr))
    {
      $item = Jtbc::take('universal:config.checkbox', 'tpl');
      $itemSelected = Jtbc::take('universal:config.checkbox_selected', 'tpl');
      foreach ($dataArr as $key => $val)
      {
        $option = $item;
        if (!is_null($value))
        {
          if ($value == '*' || in_array($key, JSON::decode($value)))
          {
            $option = $itemSelected;
          }
        }
        $option = str_replace('{$explain}', Encoder::htmlEncode($val), $option);
        $option = str_replace('{$value}', Encoder::htmlEncode($key), $option);
        $result .= $option;
      }
      $result = str_replace('{$name}', Encoder::htmlEncode($name), $result);
    }
    return $result;
  }

  public static function option($argCodeName, $argValue = null)
  {
    $result = '';
    $codeName = $argCodeName;
    $value = $argValue;
    $dataArr = Jtbc::take($codeName, 'lng');
    if (is_array($dataArr))
    {
      $item = Jtbc::take('universal:config.option', 'tpl');
      $itemSelected = Jtbc::take('universal:config.option_selected', 'tpl');
      foreach ($dataArr as $key => $val)
      {
        $option = strval($value) == strval($key)? $itemSelected: $item;
        $option = str_replace('{$explain}', Encoder::htmlEncode($val), $option);
        $option = str_replace('{$value}', Encoder::htmlEncode($key), $option);
        $result .= $option;
      }
    }
    return $result;
  }

  public static function radio($argCodeName, string $argName, $argValue = null)
  {
    $result = '';
    $codeName = $argCodeName;
    $name = $argName;
    $value = $argValue;
    $dataArr = Jtbc::take($codeName, 'lng');
    if (is_array($dataArr))
    {
      $item = Jtbc::take('universal:config.radio', 'tpl');
      $itemSelected = Jtbc::take('universal:config.radio_selected', 'tpl');
      foreach ($dataArr as $key => $val)
      {
        $option = strval($value) == strval($key)? $itemSelected: $item;
        $option = str_replace('{$explain}', Encoder::htmlEncode($val), $option);
        $option = str_replace('{$value}', Encoder::htmlEncode($key), $option);
        $result .= $option;
      }
      $result = str_replace('{$name}', Encoder::htmlEncode($name), $result);
    }
    return $result;
  }
}