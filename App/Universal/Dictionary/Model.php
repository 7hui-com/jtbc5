<?php
namespace App\Universal\Dictionary;
use Jtbc\Module;
use Jtbc\Model\TinyModel;

class Model extends TinyModel
{
  public function __construct()
  {
    $module = new Module('universal/dictionary');
    parent::__construct($module -> getTableName());
  }
}