<?php
namespace App\Console\Common;
use Jtbc\Jtbc;
use Jtbc\Path;
use Jtbc\Validation;
use Config\Diplomatist as Config;

class Navigation
{
  public static function getNavByGuide()
  {
    $result = [];
    $consoleGenre = Config::CONSOLE_DIR;
    $currentGenre = Path::getCurrentGenre();
    $result[] = ['title' => Jtbc::take('::communal.dashbord', 'lng'), 'link' => 'codename=' . $consoleGenre . ':manage.welcome'];
    if ($currentGenre == $consoleGenre)
    {
      $result[] = ['title' => Jtbc::take('::communal.dashbord-home', 'lng'), 'link' => ''];
    }
    else
    {
      $baseGenre = '';
      $folderArr = explode('/', $currentGenre);
      foreach ($folderArr as $folder)
      {
        if (!Validation::isEmpty($folder))
        {
          $thisGenre = $baseGenre . $folder;
          $guideLink = Jtbc::take('global.' . $thisGenre . ':guide.link', 'cfg');
          $guideTitle = Jtbc::take('global.' . $thisGenre . ':guide.title', 'cfg');
          if (!Validation::isEmpty($guideLink))
          {
            $guideLink = 'codename=' . $thisGenre . ':' . $guideLink;
          }
          $result[] = ['title' => $guideTitle, 'link' => $guideLink];
          $baseGenre = $thisGenre . '/';
        }
      }
    }
    return $result;
  }
}