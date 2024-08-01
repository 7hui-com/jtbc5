<?php
namespace Jtbc;
use App\Universal\Common\Setting;

class Diplomat extends Diplomatist
{
  public function language(Request $req, Response $res)
  {
    $language = strval($req -> get('language'));
    $backurl = strval($req -> get('backurl') ?? Path::getActualRoute('./'));
    Setting::changeLanguage($res, $language);
    $res -> header -> set('location', $backurl);
  }
}