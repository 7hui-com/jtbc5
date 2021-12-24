<?php
namespace App\Universal\Upload;
use Jtbc\Module;
use Jtbc\Model\TinyModel;

class Model extends TinyModel
{
  public function __construct($argAutoFilter = true)
  {
    $this -> autoFilter = $argAutoFilter;
    $module = new Module('universal/upload');
    parent::__construct($module -> getTableName());
  }
}