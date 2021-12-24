<?php
namespace App\Universal\Captcha;
use Jtbc\Module;
use Jtbc\Model\TinyModel;

class Model extends TinyModel
{
  public function __construct()
  {
    $module = new Module('universal/captcha');
    parent::__construct($module -> getTableName());
  }
}