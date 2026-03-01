<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\DI;
use Jtbc\DI;
use Jtbc\Config;
use Jtbc\Validation;
use Jtbc\Exception\UnexpectedException;

class DIFactory
{
  private static $di;

  public static function extract(string $argName)
  {
    $result = null;
    $name = $argName;
    if (!Validation::isEmpty($name))
    {
      $result = self::getInstance() -> {$name};
    }
    return $result;
  }

  public static function getInstance()
  {
    $di = null;
    if (!is_null(self::$di)) $di = self::$di;
    else
    {
      $di = self::$di = new DI();
      $alias = Config::get('DI', 'alias');
      if (is_array($alias))
      {
        foreach ($alias as $item)
        {
          $di -> bind($item['name'], $item['class'], $item['isSingletonMode'] ?? false);
        }
      }
      else
      {
        throw new UnexpectedException('Unexpected configuration', 50801);
      }
    }
    return $di;
  }
}