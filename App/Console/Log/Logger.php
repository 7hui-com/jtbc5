<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace App\Console\Log;
use Jtbc\Date;
use Jtbc\Jtbc;
use Jtbc\Substance;
use Jtbc\Diplomatist;

class Logger
{
  public static function log(Diplomatist $diplomat, $argCodeName, $argVars = null)
  {
    $result = null;
    $codename = $argCodeName;
    $vars = $argVars;
    $accountId = 0;
    $guard = $diplomat -> guard;
    if ($guard -> checkLogin())
    {
      $accountId = $guard -> account -> id;
    }
    $content = null;
    if (is_string($codename))
    {
      $content = Jtbc::take($codename, 'lng', false, $vars);
    }
    else if (is_array($codename))
    {
      foreach ($codename as $currentCodename)
      {
        if ($content == null && is_string($currentCodename))
        {
          $content = Jtbc::take($currentCodename, 'lng', false, $vars);
        }
      }
    }
    if (!is_null($content))
    {
      $model = new Model();
      $pocket = new Substance();
      $pocket -> genre = $diplomat -> getParam('genre');
      $pocket -> content = $content;
      $pocket -> userip = $diplomat -> getParam('ip_address');
      $pocket -> account_id = $accountId;
      $pocket -> time = Date::now();
      $result = $model -> save($pocket);
    }
    return $result;
  }
}