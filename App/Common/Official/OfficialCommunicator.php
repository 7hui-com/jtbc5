<?php
namespace App\Common\Official;
use Jtbc\JSON;
use Jtbc\Converter;
use Jtbc\Substance;
use Jtbc\HTTP\SimpleCURL;

class OfficialCommunicator
{
  private $data;
  private $appId;
  private $appSecret;
  private $serviceURL;

  public function getApiResult()
  {
    $result = null;
    $data = $this -> data -> all();
    if (!is_null($this -> appId))
    {
      $data['app_id'] = $this -> appId;
    }
    if (!is_null($this -> appSecret))
    {
      $data['sign'] = md5($this -> appSecret . Converter::convertToOrderedQuery($data));
    }
    $simpleCURL = new SimpleCURL($this -> serviceURL, 10);
    $simpleCURL -> setParam($data);
    $curlResult = $simpleCURL -> post();
    if ($curlResult -> is_succeed)
    {
      $content = JSON::decode($curlResult -> content);
      if (is_array($content))
      {
        $result = new Substance($content);
      }
    }
    return $result;
  }

  public function setData(array $argData)
  {
    $data = $argData;
    if (!empty($data))
    {
      foreach ($data as $key => $val)
      {
        $this -> data[$key] = $val;
      }
    }
    return $this;
  }

  public function __get($argName)
  {
    $name = $argName;
    return $this -> data -> {$name};
  }

  public function __set($argName, $argValue)
  {
    $name = $argName;
    $value = $argValue;
    $this -> data -> {$name} = $value;
  }

  public function __construct(?int $argAppId = null, ?string $argAppSecret = null)
  {
    $this -> appId = $argAppId;
    $this -> appSecret = $argAppSecret;
    $this -> serviceURL = ConfigReader::getCloudServiceURL();
    $this -> data = new Substance();
  }
}