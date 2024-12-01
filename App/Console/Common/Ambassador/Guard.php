<?php
namespace App\Console\Common\Ambassador;
use Jtbc\DI;
use Jtbc\Date;
use Jtbc\Path;
use Jtbc\JSON;
use Jtbc\Substance;
use Jtbc\Auth\Guard as GuardInterface;
use Jtbc\Auth\Role as RoleInterface;
use App\Console\Account\Model as AccountModel;
use Config\Diplomatist as Config;

class Guard implements GuardInterface
{
  private $di = null;
  private $token = null;
  private $currentGenre = null;
  private $isLogin = false;
  private $cookieTokenName = 'console_token';
  private $roleInstance = null;
  public $account = null;

  public function checkLogin()
  {
    $bool = false;
    if ($this -> isLogin)
    {
      $bool = true;
    }
    else
    {
      $bool = $this -> checkToken();
    }
    return $bool;
  }

  public function checkPassword(string $argUsername, string $argPassword)
  {
    $bool = false;
    $username = $argUsername;
    $password = $argPassword;
    $account = new AccountModel();
    $account -> where -> username = $username;
    $rs = $account -> get();
    if (!is_null($rs))
    {
      $rsPassword = $rs -> password;
      if (password_verify($password, $rsPassword))
      {
        $bool = true;
      }
    }
    return $bool;
  }

  public function checkToken()
  {
    $bool = false;
    $timestamp = time();
    $tokenInfo = $this -> token;
    if (is_string($tokenInfo))
    {
      $tokenArray = JSON::decode(base64_decode($tokenInfo));
      if (is_array($tokenArray))
      {
        $token = new Substance($tokenArray);
        $accountId = intval($token -> id);
        $tokenTimestamp = intval($token -> timestamp);
        $tokenAuth = strval($token -> auth);
        $constantName = Config::class . '::CONSOLE_LOGIN_REMEMBER_TIMEOUT';
        $loginRemberTimeout = defined($constantName)? constant($constantName): 86400;
        if ($timestamp - $tokenTimestamp < $loginRemberTimeout)
        {
          $account = new AccountModel();
          $account -> where -> locked = 0;
          $account -> where -> id = $accountId;
          $rs = $account -> get();
          if (!is_null($rs))
          {
            $rsPassword = $rs -> password;
            if (md5($tokenTimestamp . $rsPassword . $accountId) == $tokenAuth)
            {
              $bool = true;
              $this -> isLogin = true;
              $this -> account = $rs;
            }
          }
        }
      }
    }
    return $bool;
  }

  public function createToken(array $argInfo, int $argRemember)
  {
    $remember = $argRemember;
    $ss = new Substance($argInfo);
    $timestamp = time();
    $tokenExpire = 0;
    $tokenInfo = [
      'id' => $ss -> id,
      'timestamp' => $timestamp,
      'auth' => md5($timestamp . $ss -> password . $ss -> id),
    ];
    $this -> token = base64_encode(JSON::encode($tokenInfo));
    if ($remember == 1) $tokenExpire = $timestamp + 60 * 60 * 24;
    $this -> di -> response -> cookie -> set($this -> cookieTokenName, $this -> token, $tokenExpire);
  }

  public function getRole(): RoleInterface
  {
    $roleId = 0;
    if (!is_null($this -> account))
    {
      $roleId = $this -> account -> role;
    }
    $this -> roleInstance = new Role($this -> di, $roleId, $this -> currentGenre);
    return $this -> roleInstance;
  }

  public function login(string $argUsername, string $argPassword, int $argRemember)
  {
    $ss = new Substance();
    $username = $argUsername;
    $password = $argPassword;
    $remember = $argRemember;
    $timestamp = time();
    $thisDay = Date::thisDay();
    $account = new AccountModel();
    $pocket = $account -> pocket;
    $account -> where -> locked = 0;
    $account -> where -> username = $username;
    $rs = $account -> get();
    if (!is_null($rs))
    {
      $constantName = Config::class . '::CONSOLE_LOGIN_MAX_ERROR_COUNT';
      $loginMaxErrorCount = defined($constantName)? constant($constantName): 10;
      $rsId = intval($rs -> id);
      $rsLastDate = intval($rs -> last_date);
      $rsLastErrorCount = intval($rs -> last_error_count);
      if ($rsLastDate == $thisDay && $rsLastErrorCount > $loginMaxErrorCount)
      {
        $ss -> code = 1002;
        $ss -> maxErrorCount = $loginMaxErrorCount;
      }
      else
      {
        $rsPassword = $rs -> password;
        if (password_verify($password, $rsPassword))
        {
          $ss -> code = 1;
          $pocket -> last_date = $thisDay;
          $pocket -> last_error_count = 0;
          $pocket -> last_time = Date::now();
          $pocket -> last_ip = $this -> di -> request -> getIPAddress();
          $account -> save();
          $this -> createToken(['id' => $rsId, 'password' => $rsPassword], $remember);
        }
        else
        {
          $ss -> code = 1001;
          $pocket -> last_date = $thisDay;
          $pocket -> last_error_count = 1;
          if ($rsLastDate == $thisDay)
          {
            $pocket -> last_error_count = $rsLastErrorCount + 1;
          }
          $account -> save();
        }
      }
    }
    else
    {
      $ss -> code = 1001;
    }
    return $ss;
  }

  public function logout()
  {
    $ss = new Substance();
    $ss -> code = 1;
    $this -> di -> response -> cookie -> set($this -> cookieTokenName, '');
    return $ss;
  }

  public function __get($argName)
  {
    $result = null;
    $name = $argName;
    if ($name == 'role')
    {
      if ($this -> checkLogin())
      {
        $result = $this -> roleInstance ?? $this -> getRole();
      }
    }
    return $result;
  }

  function __construct(DI $di, ?string $argCurrentGenre = null)
  {
    $this -> di = $di;
    $this -> currentGenre = $argCurrentGenre ?? Path::getCurrentGenre();
    $this -> token = $this -> di -> request -> cookie -> get($this -> cookieTokenName);
  }
}