<?php
ob_start();
set_time_limit(1800);
error_reporting(E_ALL ^ E_NOTICE);
date_default_timezone_set('Asia/Shanghai');
spl_autoload_register(function($argClass){
  $class = $argClass;
  $requireFile = null;
  $classPath = str_replace('\\', '/', $class);
  $firstPath = strstr($classPath, '/', true);
  if (in_array($firstPath, ['App', 'Config', 'Jtbc']))
  {
    $requireFile = __DIR__ . '/../' . $firstPath . '/' . ltrim(substr($classPath, strpos($classPath, '/')), '/') . '.php';
  }
  else if ($firstPath == 'Web')
  {
    $folder = '';
    $childFile = ltrim(strstr($classPath, '/'), '/');
    if (str_contains($childFile, '/'))
    {
      $folder = substr($childFile, 0, strrpos($childFile, '/'));
      $childFile = ltrim(substr($childFile, strrpos($childFile, '/')), '/');
    }
    $requireFile = __DIR__ . '/../Public/' . strtolower($folder) . '/common/interior/' . $childFile . '.php';
  }
  else
  {
    $requireFile = __DIR__ . '/../Vendor/' . $classPath . '.php';
  }
  if (!is_null($requireFile) && is_file($requireFile))
  {
    require_once($requireFile);
  }
});
set_exception_handler(['Jtbc\Exception\Handler', 'output']);