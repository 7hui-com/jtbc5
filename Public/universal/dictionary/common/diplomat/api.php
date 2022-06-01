<?php
namespace Jtbc;
use App\Universal\Dictionary\Dictionary;

class Diplomat extends Diplomatist {
  public $MIMEType = 'json';

  public function detail(Request $req)
  {
    $code = 0;
    $data = [];
    $name = strval($req -> get('name'));
    $lang = intval($this -> getParam('lang'));
    if (Validation::isNatural($name))
    {
      $dict = Dictionary::get($name, null, $lang);
      if (is_array($dict))
      {
        $code = 1;
        $data = $dict;
      }
    }
    $result = new Substance();
    $result -> code = $code;
    $result -> data = $data;
    return $result -> toJSON();
  }
}