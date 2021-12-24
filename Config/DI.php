<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Config;
use Jtbc\Hook;
use Jtbc\Logger;
use Jtbc\HTTP\Request;
use Jtbc\HTTP\Response;

class DI
{
  public const ALIAS = [
    ['name' => 'hook', 'class' => Hook::class, 'isSingletonMode' => true],
    ['name' => 'logger', 'class' => Logger::class, 'isSingletonMode' => true],
    ['name' => 'request', 'class' => Request::class, 'isSingletonMode' => true],
    ['name' => 'response', 'class' => Response::class, 'isSingletonMode' => true],
  ];
}