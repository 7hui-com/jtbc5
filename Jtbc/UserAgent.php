<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;

class UserAgent
{
  private $userAgent;

  public function getOS()
  {
    $result = 'Unkown';
    if ($this -> isWindows())
    {
      $result = 'Windows';
    }
    else if ($this -> isMacintosh())
    {
      $result = 'Macintosh';
    }
    else if ($this -> isAndroid())
    {
      $result = 'Android';
    }
    else if ($this -> isIPhone())
    {
      $result = 'iPhone OS';
    }
    else if ($this -> isLinux())
    {
      $result = 'Linux';
    }
    return $result;
  }

  public function isMobile()
  {
    return str_contains($this -> userAgent, 'mobile');
  }

  public function isWindows()
  {
    return str_contains($this -> userAgent, 'windows');
  }

  public function isLinux()
  {
    return str_contains($this -> userAgent, 'linux');
  }

  public function isMacintosh()
  {
    return str_contains($this -> userAgent, 'macintosh');
  }

  public function isAndroid()
  {
    return str_contains($this -> userAgent, 'android');
  }

  public function isIPhone()
  {
    return str_contains($this -> userAgent, 'iphone');
  }

  public function isChrome()
  {
    return str_contains($this -> userAgent, 'chrome') && !str_contains($this -> userAgent, 'edg/');
  }

  public function isEdge()
  {
    return str_contains($this -> userAgent, 'edg/');
  }

  public function isFireFox()
  {
    return str_contains($this -> userAgent, 'firefox');
  }

  public function isSafari()
  {
    return str_contains($this -> userAgent, 'safari') && !str_contains($this -> userAgent, 'chrome');
  }

  public function isAppWechat()
  {
    return str_contains($this -> userAgent, 'micromessenger');
  }

  public function isAppAlipay()
  {
    return str_contains($this -> userAgent, 'alipay');
  }

  public function __construct(string $argUserAgent = null)
  {
    $this -> userAgent = !is_null($argUserAgent)? strtolower($argUserAgent): '';
  }
}