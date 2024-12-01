<?php
ob_start();
set_time_limit(900);
error_reporting(E_ALL & ~E_DEPRECATED);
date_default_timezone_set('Asia/Shanghai');
spl_autoload_register(function($class) {
  $root = realpath(__DIR__ . '/../');
  $name = str_replace(chr(92), chr(47), $class);
  $prefix = strstr($name, '/', true);
  if (in_array($prefix, ['App', 'Config', 'Jtbc']))
  {
    $target = $name;
  }
  else if ($prefix == 'Web')
  {
    $dir = '';
    $filename = ltrim(strstr($name, '/'), '/');
    if (str_contains($filename, '/'))
    {
      $dir = strrev(strstr(strrev($filename), '/'));
      $filename = ltrim(strrchr($filename, '/'), '/');
    }
    $runDir = defined('JTBC_RUNDIR')? constant('JTBC_RUNDIR'): 'Public';
    $target = $runDir . '/' . strtolower($dir) . 'common/interior/' . $filename;
  }
  else
  {
    $target = 'Vendor/' . $name;
  }
  $realpath = $root . '/' . $target . '.php';
  if (is_file($realpath)) require_once($realpath);
});
set_exception_handler(fn(...$args) => Jtbc\Exception\Handler::output(...$args));