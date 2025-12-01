<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\HTTP;
use Jtbc\Substance;
use Jtbc\Validation;

class SimpleCURL
{
  private $param;
  private $url;
  private $timeout;
  private $header;
  private $lastErrorNo;
  private $lastHTTPCode;
  private $lastContentType;

  private function getHeaders()
  {
    $result = [];
    foreach ($this -> header as $key => $value)
    {
      $result[] = $key . ': ' . $value;
    }
    return $result;
  }

  private function getResult(array $argStatus, $argContent)
  {
    $status = $argStatus;
    $content = $argContent;
    $result = new Substance();
    $result -> content = '';
    $result -> is_succeed = false;
    foreach ($status as $key => $value)
    {
      $result[$key] = $value;
    }
    if ($result -> error_no === 0)
    {
      if ($content !== false)
      {
        $result -> content = $content;
      }
      if ($result -> http_code === 200)
      {
        $result -> is_succeed = true;
      }
    }
    return $result;
  }

  private function setContentType(string $argContentType)
  {
    $contentType = $argContentType;
    if (!Validation::isEmpty($contentType))
    {
      $this -> setHeader('Content-Type', $contentType);
    }
    return $this;
  }

  public function delete(bool $argJsonMode = false)
  {
    $status = [];
    $jsonMode = $argJsonMode;
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $this -> url);
    curl_setopt($curl, CURLOPT_TIMEOUT, $this -> timeout);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'DELETE');
    if ($jsonMode === true)
    {
      $param = $this -> param -> toJSON();
      $this -> setContentType('application/json');
      $this -> setHeader('Content-Length', strlen($param));
      curl_setopt($curl, CURLOPT_POSTFIELDS, $param);
    }
    else
    {
      curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($this -> param -> all()));
    }
    curl_setopt($curl, CURLOPT_HTTPHEADER, $this -> getHeaders());
    $curlResult = curl_exec($curl);
    $this -> lastErrorNo = $status['error_no'] = curl_errno($curl);
    $this -> lastHTTPCode = $status['http_code'] = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $this -> lastContentType = $status['content_type'] = curl_getinfo($curl, CURLINFO_CONTENT_TYPE);
    return $this -> getResult($status, $curlResult);
  }

  public function get()
  {
    $status = [];
    $url = $this -> url;
    if (count($this -> param) != 0)
    {
      $url .= (str_contains($url, '?')? '&': '?') . http_build_query($this -> param -> all());
    }
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_TIMEOUT, $this -> timeout);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($curl, CURLOPT_HTTPHEADER, $this -> getHeaders());
    $curlResult = curl_exec($curl);
    $this -> lastErrorNo = $status['error_no'] = curl_errno($curl);
    $this -> lastHTTPCode = $status['http_code'] = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $this -> lastContentType = $status['content_type'] = curl_getinfo($curl, CURLINFO_CONTENT_TYPE);
    return $this -> getResult($status, $curlResult);
  }

  public function getLastContentType()
  {
    return $this -> lastContentType;
  }

  public function getLastErrorNo()
  {
    return $this -> lastErrorNo;
  }

  public function getLastHTTPCode()
  {
    return $this -> lastHTTPCode;
  }

  public function post(bool $argJsonMode = false)
  {
    $status = [];
    $jsonMode = $argJsonMode;
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $this -> url);
    curl_setopt($curl, CURLOPT_TIMEOUT, $this -> timeout);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($curl, CURLOPT_POST, true);
    if ($jsonMode === true)
    {
      $param = $this -> param -> toJSON();
      $this -> setContentType('application/json');
      $this -> setHeader('Content-Length', strlen($param));
      curl_setopt($curl, CURLOPT_POSTFIELDS, $param);
    }
    else
    {
      curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($this -> param -> all()));
    }
    curl_setopt($curl, CURLOPT_HTTPHEADER, $this -> getHeaders());
    $curlResult = curl_exec($curl);
    $this -> lastErrorNo = $status['error_no'] = curl_errno($curl);
    $this -> lastHTTPCode = $status['http_code'] = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $this -> lastContentType = $status['content_type'] = curl_getinfo($curl, CURLINFO_CONTENT_TYPE);
    return $this -> getResult($status, $curlResult);
  }

  public function put(bool $argJsonMode = false)
  {
    $status = [];
    $jsonMode = $argJsonMode;
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $this -> url);
    curl_setopt($curl, CURLOPT_TIMEOUT, $this -> timeout);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'PUT');
    if ($jsonMode === true)
    {
      $param = $this -> param -> toJSON();
      $this -> setContentType('application/json');
      $this -> setHeader('Content-Length', strlen($param));
      curl_setopt($curl, CURLOPT_POSTFIELDS, $param);
    }
    else
    {
      curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($this -> param -> all()));
    }
    curl_setopt($curl, CURLOPT_HTTPHEADER, $this -> getHeaders());
    $curlResult = curl_exec($curl);
    $this -> lastErrorNo = $status['error_no'] = curl_errno($curl);
    $this -> lastHTTPCode = $status['http_code'] = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $this -> lastContentType = $status['content_type'] = curl_getinfo($curl, CURLINFO_CONTENT_TYPE);
    return $this -> getResult($status, $curlResult);
  }

  public function isSucceed()
  {
    return $this -> lastErrorNo !== 0 && $this -> lastHTTPCode === 200? true: false;
  }

  public function setHeader(string $argName, string $argValue)
  {
    $name = $argName;
    $value = $argValue;
    $this -> header[$name] = $value;
    return $this;
  }

  public function setHeaders(array $argHeaders)
  {
    foreach ($argHeaders as $name => $value)
    {
      if (is_string($name) && is_scalar($value))
      {
        $content = strval($value);
        if (is_bool($value))
        {
          $content = ($value === true)? 'true': 'false';
        }
        $this -> setHeader($name, $content);
      }
    }
    return $this;
  }

  public function setParam(array $argParam)
  {
    $this -> param = new Substance($argParam);
    return $this;
  }

  public function setTimeout(int $argTimeout)
  {
    $timeout = $argTimeout;
    if ($timeout < 0) $timeout = 0;
    $this -> timeout = $timeout;
    return $this;
  }

  public function __get($argName)
  {
    $name = $argName;
    return $this -> param -> {$name};
  }

  public function __set($argName, $argValue)
  {
    $name = $argName;
    $value = $argValue;
    $this -> param -> {$name} = $value;
  }

  public function __construct(string $argURL, int $argTimeout = 30)
  {
    $this -> url = $argURL;
    $this -> setTimeout($argTimeout);
    $this -> param = new Substance();
    $this -> header = new Substance();
  }
}