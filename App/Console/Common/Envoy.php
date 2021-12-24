<?php
namespace App\Console\Common;
use Jtbc\Env;
use Jtbc\Diplomatist;
use App\Common\Hook\BackStageHookLoader;
use App\Console\Common\Ambassador\Guard;
use Config\Diplomatist as Config;

class Envoy extends Diplomatist
{
  public $guard = null;
  public $backStageHookLoader;

  public function __construct()
  {
    parent::__construct();
    Env::setMajorGenre(Config::CONSOLE_DIR);
    $this -> guard = new Guard($this -> di);
    $this -> backStageHookLoader = new BackStageHookLoader();
    $this -> backStageHookLoader -> load($this -> di -> hook);
  }
}