<?php
namespace App\Console\Common;
use Jtbc\Env;
use Jtbc\Diplomatist;
use App\Common\Hook\BackStageHookLoader;
use App\Console\Common\Ambassador\Guard;
use Config\Diplomatist as Config;

class Ambassador extends Diplomatist
{
  public $guard = null;
  public $MIMEType = 'json';
  public $isPublic = false;
  public $backStageHookLoader;

  public function __construct()
  {
    parent::__construct();
    $getUniqid = function()
    {
      $uniqid = $this -> di -> request -> cookie -> get('uniqid');
      if (is_null($uniqid))
      {
        $uniqid = uniqid();
        $this -> di -> response -> cookie -> set('uniqid', $uniqid);
      }
      return $uniqid;
    };
    Env::setLanguage('zh-cn');
    Env::setMajorGenre(Config::CONSOLE_DIR);
    $this -> setParam('lang', Env::getLang());
    $this -> guard = new Guard($this -> di);
    $this -> middleware -> add([Gateway::class, 'handle'], $this);
    $this -> setParam('uniqid', $getUniqid());
    $this -> backStageHookLoader = new BackStageHookLoader();
    $this -> backStageHookLoader -> load($this -> di -> hook);
  }
}