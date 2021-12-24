<?php
namespace App\Common\Hook;
use Jtbc\Hook\HookLoader;
use Config\App\Common\Hook\ForeStageHook;

class ForeStageHookLoader extends HookLoader
{
  public function __construct()
  {
    parent::__construct(ForeStageHook::class);
  }
}