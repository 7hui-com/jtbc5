<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;
use Jtbc\Exception\NotCallableException;

class Logger
{
  private $content = [];
  private $levels = [
    'emergency' => 1,
    'alert' => 2,
    'critical' => 3,
    'error' => 4,
    'warning' => 5,
    'notice' => 6,
    'info' => 7,
    'debug'  => 8,
  ];

  public function getContent($argLevel = null)
  {
    $content = null;
    $level = $argLevel;
    if (is_null($level)) $content = $this -> content;
    else
    {
      $content = $this -> content[$level] ?? [];
    }
    return $content;
  }

  public function putFile($argFileName, $argLevel = null)
  {
    $bool = false;
    $fileName = $argFileName;
    $level = $argLevel;
    if (is_string($fileName) && trim($fileName) != '')
    {
      $bool = file_put_contents($fileName, JSON::encode($this -> getContent($level)));
    }
    return $bool;
  }

  public function log($argLevel, $argMessage)
  {
    $bool = false;
    $level = $argLevel;
    $message = $argMessage;
    $levels = $this -> levels;
    if (array_key_exists($level, $levels))
    {
      $bool = true;
      $content = $this -> content[$level] ?? [];
      $item = ['time' => time(), 'microtime' => microtime(true), 'message' => $message];
      array_push($content, $item);
      $this -> content[$level] = $content;
    }
    return $bool;
  }

  public function __call($argName, $args)
  {
    $result = null;
    $name = $argName;
    $levels = $this -> levels;
    if (array_key_exists($name, $levels) && is_array($args) && count($args) == 1)
    {
      $result = $this -> log($name, $args[0]);
    }
    else
    {
      throw new NotCallableException('Not callable', 50406);
    }
    return $result;
  }
}