<?php
namespace App\Console\Log;
use Jtbc\Module;
use Jtbc\Model\TinyModel;
use Config\Diplomatist as Config;

class Model extends TinyModel
{
  public function __construct()
  {
    $module = new Module(Config::CONSOLE_DIR . '/log');
    parent::__construct($module -> getTableName());
  }
}