<?php
namespace App\Common\Hook;
use Jtbc\Hook\HookManager;
use Config\App\Common\Hook\ForeStageHook;

class ForeStageHookManager extends HookManager
{
  public function __construct()
  {
    parent::__construct(ForeStageHook::class);
  }
}