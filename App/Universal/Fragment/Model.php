<?php
namespace App\Universal\Fragment;
use Jtbc\Module;
use Jtbc\Model\TinyModel;

class Model extends TinyModel
{
  public function __construct()
  {
    $module = new Module('universal/fragment');
    parent::__construct($module -> getTableName());
  }
}