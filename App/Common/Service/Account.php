<?php
namespace App\Common\Service;
use Jtbc\Module;
use Jtbc\Service;
use Jtbc\Exception\NotExistException;
use Web\Passport\Account as PassportAccount;

class Account extends Service
{
  public function getInstance()
  {
    $result = null;
    $module = new Module(argGenre: 'passport/account', argIsCacheable: false);
    if ($module -> isExists())
    {
      $accountClassName = PassportAccount::class . '\\Account';
      if (class_exists($accountClassName))
      {
        $result = new $accountClassName();
      }
      else
      {
        throw new NotExistException('Class "' . $accountClassName . '" does not exist', 50404);
      }
    }
    return $result;
  }
}