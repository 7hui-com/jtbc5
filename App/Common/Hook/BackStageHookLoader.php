<?php
namespace App\Common\Hook;
use Jtbc\Hook\HookLoader;
use Config\App\Common\Hook\BackStageHook;

class BackStageHookLoader extends HookLoader
{
  public function __construct()
  {
    parent::__construct(BackStageHook::class);
  }
}