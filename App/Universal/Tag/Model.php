<?php
namespace App\Universal\Tag;
use Jtbc\Module;
use Jtbc\Model\TinyModel;

class Model extends TinyModel
{
  public function __construct(string $argSubTable = null)
  {
    $subTable = $argSubTable;
    $module = new Module('universal/tag');
    $tableName = is_null($subTable)? $module -> getTableName(): $module -> getTableNameByKey($subTable); 
    parent::__construct($tableName);
  }
}