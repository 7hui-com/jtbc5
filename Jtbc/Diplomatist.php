<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;
use Jtbc\DI\DIFactory;
use Jtbc\Config\ConfigReader;

class Diplomatist
{
  private $param;
  protected $middleware;
  protected $crashed = false;
  protected $configReader;
  public $di;
  public $hook;
  public $userAgent;

  private function initEnv()
  {
    Env::setLanguage($this -> di -> request -> header -> get('language') ?? $this -> di -> request -> cookie -> get('language'));
  }

  private function initParam()
  {
    $request = $this -> di -> request;
    $this -> param = $param = new Substance();
    $param -> di = $this -> di;
    $param -> user_agent = $this -> userAgent;
    $param -> req = $request;
    $param -> request = $request;
    $param -> scheme = $request -> isHTTPS()? 'https://': 'http://';
    $param -> host = $request -> server('HTTP_HOST');
    $param -> referer = $request -> server('HTTP_REFERER');
    $param -> ip_address = $request -> getIPAddress();
    $param -> genre = Path::getCurrentGenre();
    $param -> lang = Env::getLang();
    $param -> language = Env::getLanguage();
    $param -> uri = $request -> getRealScriptName();
    $param -> query_string = $request -> server('QUERY_STRING');
    $param -> url = Validation::isEmpty($param -> query_string)? $param -> uri: $param -> uri . '?' . $param -> query_string;
    $param -> visible_uri = $request -> getPathInfo();
    $param -> visible_url = $request -> server('REQUEST_URI');
    $param -> basename = basename($param -> uri, '.php');
    $param -> full_host = $param -> scheme . $param -> host;
    $param -> full_uri = $param -> full_host . $param -> uri;
    $param -> full_url = $param -> full_host . $param -> url;
    $param -> full_visible_url = $param -> full_host . $param -> visible_url;
    $param -> call_hook = fn($name, $mine = false) => $mine === true? $this -> hook -> {$name} -> trigger($this): $this -> di -> hook -> {$name} -> trigger($this);
    $param -> get_query_string = fn(string $name) => is_array($request -> get($name))? JSON::encode($request -> get($name)): strval($request -> get($name));
    $param -> request_query_rebuild = fn(array $params) => http_build_query(Converter::convertToArrayExceptNull(array_merge($request -> get(), $params)));
  }

  private function initMiddleware()
  {
    $middlewares = $this -> configReader -> middlewares;
    $this -> middleware = new Middleware(fn() => $this -> getPureResult());
    if (is_array($middlewares))
    {
      foreach ($middlewares as $middleware)
      {
        $this -> middleware -> add($middleware, $this);
      }
    }
  }

  private function getPureResult()
  {
    $result = null;
    $di = $this -> di;
    $request = $di -> request;
    $response = $di -> response;
    if ($this -> crashed === false)
    {
      $startMethodName = '__start';
      $finishMethodName = '__finish';
      $startResult = $di -> call($this, $startMethodName, false);
      if (is_null($startResult))
      {
        $mainMethodName = 'index';
        $type = $request -> get('type');
        $action = $request -> get('action');
        if (!Validation::isEmpty($type)) $mainMethodName = $type;
        else if (!Validation::isEmpty($action)) $mainMethodName = 'action' . ucfirst($action);
        $classMethods = array_diff(get_class_methods(get_called_class()), get_class_methods(__CLASS__));
        if (str_starts_with($mainMethodName, '__'))
        {
          $response -> setStatusCode(403);
        }
        else if (!in_array($mainMethodName, $classMethods))
        {
          $response -> setStatusCode(404);
        }
        else
        {
          $result = $di -> call($this, $mainMethodName, false);
          $finishResult = $di -> call($this, $finishMethodName, false);
          if (!is_null($finishResult)) $result = $finishResult;
        }
      }
      else
      {
        $result = $startResult;
      }
    }
    return $result;
  }

  public function setParam(string $argName, $argValue)
  {
    $name = $argName;
    $value = $argValue;
    $this -> param -> {$name} = $value;
    return $value;
  }

  public function addParam(string $argName, $argValue)
  {
    $name = $argName;
    $value = $argValue;
    $currentValue = $this -> getParam($name);
    if (is_null($currentValue)) $currentValue = [];
    else if (!is_array($currentValue))
    {
      $tempValue = [];
      array_push($tempValue, $currentValue);
      $currentValue = $tempValue;
    }
    array_push($currentValue, $value);
    $this -> setParam($name, $currentValue);
    return $currentValue;
  }

  public function getParam(string $argName)
  {
    $name = $argName;
    return $this -> param -> {$name};
  }

  public function getResult()
  {
    $result = null;
    $initMethodName = '__init';
    $initResult = $this -> di -> call($this, $initMethodName, false);
    if (is_null($initResult))
    {
      $result = $this -> middleware -> run();
    }
    else
    {
      $result = $initResult;
    }
    return $result;
  }

  public function __construct()
  {
    $this -> hook = new Hook();
    $this -> di = DIFactory::getInstance();
    $this -> configReader = new configReader(substr(strrchr(__CLASS__, chr(92)), 1));
    $this -> userAgent = new UserAgent($this -> di -> request -> server('HTTP_USER_AGENT'));
    $this -> di -> call($this, '__initialize', false);
    $this -> initEnv();
    $this -> initParam();
    $this -> initMiddleware();
  }
}