<?php
namespace App\Console\Cloud;
use Jtbc\Module;
use Jtbc\Model\TinyModel;
use Config\Diplomatist as Config;

class Model extends TinyModel
{
  public function __construct(string $argKey = null)
  {
    $key = $argKey;
    $module = new Module(Config::CONSOLE_DIR . '/cloud');
    $tableName = is_null($key)? $module -> getTableName(): $module -> getTableNameByKey($key);
    parent::__construct($tableName);
  }
}