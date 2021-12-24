<?php
namespace App\Console\Account;
use Jtbc\Module;
use Jtbc\Substance;
use Jtbc\Model\TinyModel;
use Config\Diplomatist as Config;

class Model extends TinyModel
{
  public function modifyPassword(string $argPassword, string $argNewPassword)
  {
    $password = $argPassword;
    $newPassword = $argNewPassword;
    $ss = new Substance();
    $ss -> code = 0;
    $rs = $this -> get();
    if ($rs != null)
    {
      $rsPassword = $rs -> password;
      if (!password_verify($password, $rsPassword))
      {
        $ss -> code = 1001;
      }
      else
      {
        $this -> pocket -> password = password_hash($newPassword, PASSWORD_DEFAULT);
        $re = $this -> save();
        if (is_numeric($re))
        {
          $ss -> code = 1;
          $ss -> password = $this -> pocket -> password;
        }
        else
        {
          $ss -> code = 1100;
        }
      }
    }
    return $ss;
  }

  public function __construct()
  {
    $module = new Module(Config::CONSOLE_DIR . '/account');
    parent::__construct($module -> getTableName());
  }
}