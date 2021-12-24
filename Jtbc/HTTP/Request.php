<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\HTTP;
use Jtbc\JSON;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\String\StringHelper;
use Jtbc\Request as RequestInterface;

class Request implements RequestInterface
{
  private $param;

  private function source($argType, $argName = null)
  {
    $result = null;
    $type = $argType;
    $name = $argName;
    $source = [];
    switch($type)
    {
      case 'get':
        $source = $this -> source -> get;
        break;
      case 'post':
        $source = $this -> source -> post;
        break;
      case 'files':
        $source = $this -> source -> files;
        break;
      case 'server':
        $source = $this -> source -> server;
        break;
    }
    if ($name === false)
    {
      $result = $source;
    }
    else if (is_null($name))
    {
      foreach ($source as $key => $val)
      {
        $source[$key] = $this -> source($type, $key);
      }
      $result = $source;
    }
    else
    {
      if (array_key_exists($name, $source))
      {
        $val = $source[$name];
        if (in_array($type, ['get', 'post']))
        {
          $val = is_array($val)? JSON::encode($val): $val;
        }
        $result = $val;
      }
    }
    return $result;
  }

  public function get($argName = null)
  {
    return $this -> source('get', $argName);
  }

  public function post($argName = null)
  {
    return $this -> source('post', $argName);
  }

  public function files($argName = null)
  {
    return $this -> source('files', $argName);
  }

  public function server($argName = null)
  {
    return $this -> source('server', $argName);
  }

  public function isHTTPS()
  {
    $bool = false;
    if ($this -> server('HTTPS') == 'on' || $this -> server('HTTP_X_FORWARDED_PROTO') == 'https' || $this -> server('HTTP_X_CLIENT_SCHEME') == 'https') $bool = true;
    return $bool;
  }

  public function getPathInfo()
  {
    $result = $this -> server('PATH_INFO');
    if (Validation::isEmpty($result))
    {
      $result = $this -> server('ORIG_PATH_INFO');
    }
    return $result;
  }

  public function getIPAddress(bool $argIPv4Only = false)
  {
    $result = null;
    $IPv4Only = $argIPv4Only;
    $IPAddress = $this -> server('HTTP_X_FORWARDED_FOR') ?? $this -> server('HTTP_CLIENT_IP') ?? $this -> server('REMOTE_ADDR');
    if ($IPv4Only === false)
    {
      $result = $IPAddress;
    }
    else
    {
      if (Validation::isIPv4($IPAddress))
      {
        $result = $IPAddress;
      }
      else if (str_contains($IPAddress, ','))
      {
        $realIPAddress = trim(substr($IPAddress, 0, strpos($IPAddress, ',')));
        if (Validation::isIPv4($realIPAddress))
        {
          $result = $realIPAddress;
        }
      }
    }
    return $result;
  }

  public function getRealScriptName()
  {
    $result = null;
    $pathInfo = $this -> getPathInfo();
    if (!empty($pathInfo))
    {
      $folder = substr($pathInfo, 0, strrpos($pathInfo, '/'));
      $file = substr($pathInfo, strrpos($pathInfo, '/') + 1);
      if (empty($file)) $file = 'index.php';
      else
      {
        if (!str_contains($file, '.')) $file .= '.php';
      }
      $result = $folder . '/' . $file;
    }
    return $result;
  }

  public function __get($argName)
  {
    $result = null;
    $name = $argName;
    if ($name == 'cookie')
    {
      if (!$this -> param -> exists('cookie'))
      {
        $this -> param -> cookie = new class($this) {
          private $parent;

          public function get($argName, $argChildName = null)
          {
            $result = null;
            $name = $argName;
            $childName = $argChildName;
            $source = $this -> getAll();
            if (array_key_exists($name, $source))
            {
              $tempResult = $source[$name];
              if (is_null($childName)) $result = $tempResult;
              else
              {
                if (is_array($tempResult))
                {
                  if (array_key_exists($childName, $tempResult)) $result = $tempResult[$childName];
                }
              }
            }
            return $result;
          }

          public function getAll()
          {
            return $this -> parent -> source -> cookie;
          }

          public function __construct($argParent)
          {
            $this -> parent = $argParent;
          }
        };
      }
      $result = $this -> param -> cookie;
    }
    else if ($name == 'header')
    {
      if (!$this -> param -> exists('header'))
      {
        $this -> param -> header = new class($this) {
          private $parent;

          public function get($argName)
          {
            $result = null;
            $name = strtoupper($argName);
            $source = $this -> getAll();
            if (array_key_exists($name, $source))
            {
              $result = $source[$name];
            }
            return $result;
          }

          public function getAll()
          {
            $result = [];
            $source = $this -> parent -> source -> server;
            if (is_array($source))
            {
              foreach ($source as $key => $value)
              {
                if (str_starts_with($key, 'HTTP_'))
                {
                  $result[StringHelper::getClipedString($key, '_', 'right+')] = $value;
                }
              }
            }
            return $result;
          }

          public function __construct($argParent)
          {
            $this -> parent = $argParent;
          }
        };
      }
      $result = $this -> param -> header;
    }
    else if ($name == 'input')
    {
      $result = file_get_contents('php://input');
    }
    else if ($name == 'method')
    {
      $result = $this -> server('REQUEST_METHOD');
    }
    else if ($name == 'source')
    {
      if (!$this -> param -> exists('source'))
      {
        $this -> param -> source = (object)[
          'get' => $_GET,
          'post' => $_POST,
          'files' => $_FILES,
          'server' => $_SERVER,
          'cookie' => $_COOKIE,
        ];
      }
      $result = $this -> param -> source;
    }
    return $result;
  }

  public function __construct()
  {
    $this -> param = new Substance();
  }
}