<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\HTTP;
use Jtbc\Substance;
use Jtbc\Response as ResponseInterface;

class Response implements ResponseInterface
{
  private $param;
  protected $body;
  protected $statusCode = 200;

  public function getStatusCode()
  {
    return $this -> statusCode;
  }

  public function setStatusCode(int $argStatusCode)
  {
    $this -> statusCode = $argStatusCode;
  }

  public function send($argBody = null)
  {
    $body = $argBody;
    http_response_code($this -> statusCode);
    $this -> cookie -> send();
    $this -> header -> send();
    if (is_scalar($body)) print($body);
  }

  public function __get($argName)
  {
    $result = null;
    $name = $argName;
    if ($name == 'cookie')
    {
      if (!$this -> param -> exists('cookie'))
      {
        $this -> param -> cookie = new class() {
          private $path = '/';
          private $domain = '';
          private $secure = false;
          private $httponly = true;
          private $cookies = [];

          public function set(...$args)
          {
            $name = array_shift($args);
            $this -> cookies[$name] = $args;
            return $this;
          }

          public function get($argName)
          {
            $result = null;
            $name = $argName;
            if (array_key_exists($name, $this -> cookies))
            {
              $result = $this -> cookies[$name];
            }
            return $result;
          }

          public function has($argName)
          {
            $bool = false;
            $name = $argName;
            if (array_key_exists($name, $this -> cookies)) $bool = true;
            return $bool;
          }

          public function remove($argName)
          {
            $name = $argName;
            unset($this -> cookies[$name]);
            return $this;
          }

          public function send()
          {
            foreach ($this -> cookies as $key => $val)
            {
              array_unshift($val, $key);
              while(count($val) < 7)
              {
                $count = count($val);
                if ($count == 2) array_push($val, 0);
                else if ($count == 3) array_push($val, $this -> path);
                else if ($count == 4) array_push($val, $this -> domain);
                else if ($count == 5) array_push($val, $this -> secure);
                else if ($count == 6) array_push($val, $this -> httponly);
              }
              setcookie(...$val);
            }
          }
        };
      }
      $result = $this -> param -> cookie;
    }
    else if ($name == 'header')
    {
      if (!$this -> param -> exists('header'))
      {
        $this -> param -> header = new class() {
          private $headers = [];

          public function set(string $argName, string $argValue)
          {
            $name = $argName;
            $value = $argValue;
            $this -> headers[$name] = $value;
            return $this;
          }

          public function get($argName)
          {
            $result = null;
            $name = $argName;
            if (array_key_exists($name, $this -> headers))
            {
              $result = $this -> headers[$name];
            }
            return $result;
          }

          public function has($argName)
          {
            $bool = false;
            $name = $argName;
            if (array_key_exists($name, $this -> headers)) $bool = true;
            return $bool;
          }

          public function remove($argName)
          {
            $name = $argName;
            unset($this -> headers[$name]);
            return $this;
          }

          public function send()
          {
            foreach ($this -> headers as $key => $val)
            {
              header($key . ':' . $val);
            }
          }
        };
      }
      $result = $this -> param -> header;
    }
    return $result;
  }

  public function __construct()
  {
    $this -> param = new Substance();
  }
}