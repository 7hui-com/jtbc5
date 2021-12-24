<?php
namespace App\Console\Common;

class BasicSubstance extends EmptySubstance
{
  private $ambassador;

  public function __construct(Ambassador $ambassador)
  {
    parent::__construct();
    $this -> ambassador = $ambassador;
    $this -> data -> nav = Navigation::getNavByGuide();
    $this -> data -> control = [
      'batch' => $ambassador -> guard -> role -> getCurrentBatch(),
      'subPermission' => $ambassador -> guard -> role -> getCurrentSubPermission(),
    ];
  }
}