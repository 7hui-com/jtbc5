<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Config\App\Common\Hook;

class BackStageHook
{
  public const HOOKS = ['feedback' => 'Web\\Feedback\\Notification::hookHandle'];
}