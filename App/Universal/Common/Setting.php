<?php
namespace App\Universal\Common;
use Jtbc\Request;
use Jtbc\Response;
use Jtbc\Validation;

class Setting
{
  public static function restoreLanguage(Response $res)
  {
    $result = true;
    $res -> cookie -> set('language', null);
    $res -> cookie -> set('language_updated_at', null);
    return $result;
  }

  public static function changeLanguage(Response $res, string $argLanguage)
  {
    $result = false;
    $language = $argLanguage;
    if (!Validation::isEmpty($language))
    {
      $result = true;
      $res -> cookie -> set('language', $language);
      $res -> cookie -> set('language_updated_at', time());
    }
    return $result;
  }

  public static function isLanguageJustChanged(Request $req)
  {
    $result = false;
    if ((time() - intval($req -> cookie -> get('language_updated_at'))) < 60)
    {
      $result = true;
    }
    return $result;
  }
}