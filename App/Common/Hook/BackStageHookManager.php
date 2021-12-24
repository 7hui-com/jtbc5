<?php
namespace App\Common\Hook;
use Jtbc\Hook\HookManager;
use Config\App\Common\Hook\BackStageHook;

class BackStageHookManager extends HookManager
{
  public function __construct()
  {
    parent::__construct(BackStageHook::class);
  }
}