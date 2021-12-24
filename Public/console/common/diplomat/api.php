<?php
namespace Jtbc;
use Jtbc\DB\DBFactory;
use Jtbc\Exception\DBException;
use App\Console\Common\Envoy;
use App\Console\Log\Logger;

class Diplomat extends Envoy {
  public $MIMEType = 'json';

  public function login()
  {
    $ss = new Substance();
    $ss -> code = 1;
    $ss -> fragment = Jtbc::take('api.login');
    $result = $ss -> toJSON();
    return $result;
  }

  public function checkLogin()
  {
    $ss = new Substance();
    $ss -> code = 0;
    if ($this -> guard -> checkLogin())
    {
      $ss -> code = 1;
    }
    $result = $ss -> toJSON();
    return $result;
  }

  public function checkDBLink()
  {
    $ss = new Substance();
    $ss -> code = 1;
    try
    {
      $db = DBFactory::getInstance();
    }
    catch (DBException $e)
    {
      $ss -> code = 0;
    }
    $result = $ss -> toJSON();
    return $result;
  }

  public function actionLogin(Request $req)
  {
    $code = 0;
    $message = '';
    $ss = new Substance();
    $username = strval($req -> post('username'));
    $password = strval($req -> post('password'));
    $remember = intval($req -> post('remember'));
    $hookResult = $this -> di -> hook -> backstageBeforeLogin -> provoke($this);
    if (is_null($hookResult))
    {
      $login = $this -> guard -> login($username, $password, $remember);
      if ($login -> code == 1)
      {
        $code = 1;
        Logger::log($this, 'api.log-login-1');
      }
      else if ($login -> code == 1001)
      {
        $code = 4001;
        $message = Jtbc::take('api.msg-login-1', 'lng');
      }
      else if ($login -> code == 1002)
      {
        $code = 4002;
        $message = Jtbc::take('api.msg-login-2', 'lng', false, ['num' => $login -> maxErrorCount]);
      }
      $ss -> code = $code;
      $ss -> message = $message;
    }
    else
    {
      if ($hookResult instanceof Substance)
      {
        $ss = $hookResult;
      }
      if (!$ss -> exists('code'))
      {
        $ss -> code = 4444;
        $ss -> message = Jtbc::take('api.msg-login-others', 'lng');
      }
    }
    $result = $ss -> toJSON();
    return $result;
  }
}