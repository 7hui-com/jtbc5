<?php
namespace Web\Feedback;
use Jtbc\Jtbc;
use Jtbc\Path;
use Jtbc\Substance;
use Jtbc\Model\TinyModel;
use App\Console\Common\Ambassador\Guard;

class Notification
{
  public static function hookHandle()
  {
    $result = new Substance();
    $genre = Path::getCurrentGenreByNS(__NAMESPACE__);
    $result -> backstageNotification = function($diplomat) use ($genre)
    {
      $result = null;
      $guard = new Guard($diplomat -> di, $genre);
      if ($guard -> role -> checkPermission())
      {
        $model = new TinyModel(genre: $genre);
        $model -> where -> disposed = 0;
        $rsCount = $model -> getCount();
        if ($rsCount !== 0)
        {
          $result = [[
            'tips' => Jtbc::take('global.' . $genre . ':manage.text-notification-tips', 'lng', argVars: ['count' => $rsCount]),
            'href' => 'codename=' . $genre . ':manage.list',
            'buttonText' => Jtbc::take('global.' . $genre . ':manage.text-notification-button-text', 'lng'),
            'buttonNumber' => 2,
          ]];
        }
      }
      return $result;
    };
    return $result;
  }
}