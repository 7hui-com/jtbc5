<?php
namespace App\Common\Premium;

class PremiumAccountLoader
{
  private static $instance = null;

  public static function getInstance()
  {
    $instance = self::$instance;
    if (is_null($instance))
    {
      $instance = self::$instance = new PremiumAccount();
    }
    return $instance;
  }
}