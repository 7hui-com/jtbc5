<?php
namespace App\Console\Common;
use Jtbc\Substance;

class EmptySubstance extends Substance
{
  public function __construct()
  {
    parent::__construct();
    $this -> code = 1;
    $this -> data = new Substance();
  }
}