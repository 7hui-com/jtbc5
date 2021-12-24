<?php
namespace App\Console\Common;
use Jtbc\Env;
use Jtbc\Substance;
use Jtbc\Validation;
use App\Common\Module\ModuleRecognizer;

class Gateway
{
  public static function handle(callable $handler, $diplomat)
  {
    $result = function() use ($handler, $diplomat)
    {
      $code = 0;
      $passed = false;
      $guard = $diplomat -> guard;
      if ($guard -> checkLogin())
      {
        $isVaildGenre = true;
        $genre = $diplomat -> getParam('genre');
        if (!Validation::isEmpty($genre))
        {
          $moduleRecognizer = new ModuleRecognizer($genre);
          $isVaildGenre = $moduleRecognizer -> isConfusing()? false: true;
        }
        if ($isVaildGenre === true)
        {
          if ($diplomat -> isPublic == true)
          {
            $passed = true;
          }
          else
          {
            if ($guard -> role -> checkPermission())
            {
              $passed = true;
            }
          }
        }
        Env::setMajorLang($guard -> role -> getLang());
      }
      if ($passed == false)
      {
        $diplomat -> di -> response -> setStatusCode(403);
        $ss = new Substance();
        $ss -> code = 403;
        $ss -> message = '403 Forbidden';
        return $ss -> toJSON();
      }
      else
      {
        return call_user_func($handler);
      }
    };
    return $result;
  }
}