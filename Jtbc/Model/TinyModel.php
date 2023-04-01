<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Model;
use Jtbc\ORM;
use Jtbc\Module;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\Exception\UnexpectedException;

class TinyModel extends ORM
{
  public function __construct(...$args)
  {
    $tableName = null;
    if (Validation::isArrayList($args))
    {
      $argLength = count($args);
      if ($argLength == 0)
      {
        $module = new Module();
        $tableName = $module -> getTableName();
      }
      else if ($argLength == 1)
      {
        $arg = $args[0];
        if (is_string($arg))
        {
          $tableName = $arg;
        }
        else if ($arg instanceof Module)
        {
          $tableName = $arg -> getTableName();
        }
      }
      else if ($argLength == 2)
      {
        list($module, $subtable) = $args;
        if ($module instanceof Module && is_string($subtable))
        {
          $tableName = $module -> getTableNameByKey($subtable);
        }
      }
    }
    else
    {
      $namedArgs = new Substance($args);
      $this -> DBLink = $namedArgs -> DBLink;
      if (is_bool($namedArgs -> autoFilter))
      {
        $this -> autoFilter = $namedArgs -> autoFilter;
      }
      if ($namedArgs -> exists('tableName'))
      {
        $tableName = $namedArgs -> tableName;
      }
      else
      {
        $module = $namedArgs -> module instanceof Module? $namedArgs -> module: new Module($namedArgs -> genre);
        $tableName = $namedArgs -> exists('subtable')? $module -> getTableNameByKey($namedArgs -> subtable): $module -> getTableName();
      }
    }
    if (!is_null($tableName))
    {
      $this -> tableName = $tableName;
      parent::__construct();
    }
    else
    {
      throw new UnexpectedException('Unexpected argument(s)', 50801);
    }
  }
}