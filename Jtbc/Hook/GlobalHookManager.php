<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Hook;
use Config\Hook\GlobalHook;

class GlobalHookManager extends HookManager
{
  public function __construct()
  {
    parent::__construct(GlobalHook::class);
  }
}