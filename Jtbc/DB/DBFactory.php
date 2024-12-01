<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\DB;
use Jtbc\Config;
use Jtbc\Substance;
use Jtbc\DB\MySQL\DB;
use Jtbc\Exception\DBException;
use Jtbc\Exception\NotExistException;
use Jtbc\Exception\UnexpectedException;

class DBFactory
{
  private static $instances = [];

  private static function getServers()
  {
    $result = new Substance();
    $data = Config::get('DB/MySQL', 'server');
    if (is_array($data))
    {
      $result = new Substance($data);
    }
    else
    {
      throw new UnexpectedException('Unexpected configuration', 50801);
    }
    return $result;
  }

  public static function getInstance(?string $argDBLink = null)
  {
    $db = null;
    $dbLink = $argDBLink ?? 'default';
    if (array_key_exists($dbLink, self::$instances))
    {
      $db = self::$instances[$dbLink];
    }
    else
    {
      $servers = self::getServers();
      if ($servers -> exists($dbLink))
      {
        $config = new Substance($servers[$dbLink]);
        $db = new DB($config -> HOST, $config -> DATABASE, $config -> USERNAME, $config -> PASSWORD);
        if ($db -> errCode == 0)
        {
          self::$instances[$dbLink] = $db;
        }
        else
        {
          throw new DBException($db -> errMessage, $db -> errCode);
          $db = null;
        }
      }
      else
      {
        throw new NotExistException('The name "' . $dbLink . '" does not exist', 50404);
      }
    }
    return $db;
  }

  public static function getInstanceByNames(string ...$args)
  {
    $result = null;
    if (empty($args))
    {
      $result = self::getInstance();
    }
    else
    {
      $name = null;
      $servers = self::getServers();
      foreach ($args as $value)
      {
        if ($servers -> exists($value))
        {
          $name = $value;
          break;
        }
      }
      $result = self::getInstance($name);
    }
    return $result;
  }

  public static function getInstances()
  {
    return self::$instances;
  }
}