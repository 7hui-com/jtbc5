<?php
namespace App\Common;

abstract class Uninstaller
{
  protected $lastErrorCode = 0;

  public function getLastErrorCode()
  {
    return $this -> lastErrorCode;
  }

  abstract public function uninstall();
}