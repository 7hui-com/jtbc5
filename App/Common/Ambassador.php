<?php
namespace App\Common;
use Jtbc\Jtbc;
use Jtbc\Path;
use Jtbc\Diplomatist;
use App\Common\Hook\ForeStageHookLoader;

class Ambassador extends Diplomatist
{
  public $foreStageHookLoader;

  public function __construct()
  {
    parent::__construct();
    $this -> setParam('assets_path', 'common/assets');
    $this -> setParam('root_assets_path', Path::getActualRoute('common/assets'));
    $this -> addParam('meta_title', Jtbc::take('global.communal.title', 'lng'));
    $this -> setParam('meta_keywords', Jtbc::take('global.communal.keywords', 'lng'));
    $this -> setParam('meta_description', Jtbc::take('global.communal.description', 'lng'));
    $this -> addParam('stylesheets', ['url' => $this -> getParam('root_assets_path') . '/frame.css']);
    $this -> foreStageHookLoader = new ForeStageHookLoader();
    $this -> foreStageHookLoader -> load($this -> di -> hook);
    $this -> di -> hook -> forestageAfterConstruct -> trigger($this, $this -> middleware);
  }
}