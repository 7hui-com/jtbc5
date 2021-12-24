<?php
namespace Jtbc;
use Jtbc\Model\TinyModel;
use App\Console\Common\Ambassador;

class Diplomat extends Ambassador {
  public function __initialize()
  {
    $this -> isPublic = true;
  }

  public function list(Request $req)
  {
    $code = 1;
    $tags = [];
    $tag = strval($req -> get('tag'));
    $genre = strval($req -> get('genre'));
    $model = new TinyModel();
    $model -> where -> genre = $genre;
    $model -> where -> lang = $this -> guard -> role -> getLang();
    $model -> where -> tag -> like($tag . '%');
    $model -> orderBy('associated_count', 'desc');
    $model -> limit(10);
    $rsa = $model -> getAll();
    foreach ($rsa as $rs)
    {
      $tags[] = $rs -> tag;
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> data = ['tags' => $tags];
    $result = $ss -> toJSON();
    return $result;
  }
}