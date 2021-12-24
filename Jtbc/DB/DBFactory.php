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

  public static function getInstance(string $argDBLink = null)
  {
    $db = null;
    $dbLink = $argDBLink ?? 'default';
    if (array_key_exists($dbLink, self::$instances))
    {
      $db = self::$instances[$dbLink];
    }
    else
    {
      $server = Config::get('DB/MySQL', 'server');
      if (is_array($server))
      {
        if (array_key_exists($dbLink, $server))
        {
          $config = new Substance($server[$dbLink]);
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
      else
      {
        throw new UnexpectedException('Unexpected configuration', 50801);
      }
    }
    return $db;
  }

  public static function getInstances()
  {
    return self::$instances;
  }
}