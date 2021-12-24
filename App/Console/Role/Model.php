<?php
namespace App\Console\Role;
use Jtbc\Module;
use Jtbc\Model\TinyModel;
use Config\Diplomatist as Config;

class Model extends TinyModel
{
  public function __construct()
  {
    $module = new Module(Config::CONSOLE_DIR . '/role');
    parent::__construct($module -> getTableName());
  }
}