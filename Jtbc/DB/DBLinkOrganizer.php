<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\DB;

class DBLinkOrganizer
{
  private $DBLink;

  public function beginTransaction()
  {
    return $this -> getDBInstance() -> beginTransaction();
  }

  public function commit()
  {
    return $this -> getDBInstance() -> commit();
  }

  public function generate(string $class, array $args = [])
  {
    return new $class(...$this -> getNamedArgs(...$args));
  }

  public function getDBLink()
  {
    return $this -> DBLink;
  }

  public function getDBInstance()
  {
    return DBFactory::getInstance($this -> getDBLink());
  }

  public function getNamedArgs(...$args)
  {
    return array_merge($args, ['DBLink' => $this -> getDBLink()]);
  }

  public function rollback()
  {
    return $this -> getDBInstance() -> rollback();
  }

  public function __construct(?string $argDBLink = null)
  {
    $this -> DBLink = $argDBLink;
  }
}