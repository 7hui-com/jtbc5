<?php
namespace App\Console\Account;
use Jtbc\Path;
use Jtbc\Encoder;
use Jtbc\Substance;
use Jtbc\Model\TinyModel;

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
        $this -> pocket -> password = Encoder::passwordHash($newPassword);
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
    parent::__construct(genre: Path::getCurrentGenreByNS(__NAMESPACE__));
  }
}