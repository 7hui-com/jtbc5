<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Config;

class Diplomatist
{
  public const MIDDLEWARES = [
    'Jtbc\Diplomatist\IPManager::handle',
    'Jtbc\Diplomatist\HeaderManager::handle',
  ];
  public const CONSOLE_DIR = 'console';
  public const CONSOLE_LOGIN_MAX_ERROR_COUNT = 10;
  public const CONSOLE_LOGIN_REMEMBER_TIMEOUT = 86400;
  public const SEPARATOR = ' - ';
}