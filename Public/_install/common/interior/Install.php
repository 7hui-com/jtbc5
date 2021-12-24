<?php
namespace Web\_install;
use Jtbc\Path;
use Jtbc\Substance;

class Install
{
  public static function hookHandle()
  {
    $result = new Substance();
    $genre = Path::getCurrentGenreByNS(__NAMESPACE__);
    $result -> beforeAutoRouteGetResult = [
      'index' => 1000000,
      'function' => function($router) use ($genre) {
        $result = null;
        $currentGenre = Path::getCurrentGenre();
        if ($currentGenre != $genre)
        {
          $result = 'pending installation';
          $router -> di -> response -> header -> set('location', Path::getActualRoute($genre) . '/');
        }
        return $result;
      },
    ];
    return $result;
  }
}