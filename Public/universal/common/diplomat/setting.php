<?php
namespace Jtbc;

class Diplomat extends Diplomatist
{
  public function language(Request $req, Response $res)
  {
    $language = strval($req -> get('language'));
    $backurl = strval($req -> get('backurl') ?? Path::getActualRoute('./'));
    $res -> cookie -> set('language', $language);
    $res -> header -> set('location', $backurl);
  }
}