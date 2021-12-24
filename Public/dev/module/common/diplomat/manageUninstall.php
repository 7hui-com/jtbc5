<?php
namespace Jtbc;
use Jtbc\Module\ModuleFinder;
use App\Common\Module\ModuleUninstaller;
use App\Console\Common\BasicSubstance;
use App\Console\Common\Ambassador;
use App\Console\Log\Logger;

class Diplomat extends Ambassador {
  public function uninstall(Request $req)
  {
    $status = 100;
    $genre = strval($req -> get('genre'));
    $uninstallFolder = '';
    $uninstallTableNameList = [];
    $module = new Module($genre);
    if ($module -> isUninstallAble !== true)
    {
      $status = 401;
    }
    else if (!empty($module -> getChildGenreList()))
    {
      $status = 402;
    }
    else
    {
      $uninstallFolder = $module -> getName();
      $tableNameList = $module -> getTableNameList();
      foreach ($tableNameList as $tableName)
      {
        $uninstallTableNameList[] = ['tableName' => $tableName];
      }
    }
    $bs = new BasicSubstance($this);
    $bs -> data -> genre = $genre;
    $bs -> data -> status = $status;
    $bs -> data -> uninstallFolder = $uninstallFolder;
    $bs -> data -> uninstallTableNameList = $uninstallTableNameList;
    return $bs -> toJSON();
  }

  public function actionUninstall(Request $req)
  {
    $code = 0;
    $message = '';
    $genre = strval($req -> post('genre'));
    if ($this -> guard -> role -> checkPermission('uninstall'))
    {
      $genrePath = Path::getActualRoute($genre);
      if (Validation::isEmpty($genre))
      {
        $code = 4001;
      }
      else if (!is_dir($genrePath))
      {
        $code = 4002;
      }
      else
      {
        $moduleUninstaller = new ModuleUninstaller($genre);
        $uninstall = $moduleUninstaller -> uninstall();
        if ($uninstall === true)
        {
          $code = 1;
          $moduleFinder = new ModuleFinder();
          $moduleFinder -> removeCache();
          Logger::log($this, 'manageUninstall.log-uninstall', ['genre' => $genre]);
        }
        else
        {
          $lastErrorCode = $moduleUninstaller -> getLastErrorCode();
          if ($lastErrorCode == 1401)
          {
            $code = 4011;
          }
          else if ($lastErrorCode == 1402)
          {
            $code = 4012;
          }
          else if ($lastErrorCode == 1403)
          {
            $code = 4013;
          }
          else
          {
            $code = 4444;
          }
        }
      }
    }
    else
    {
      $code = 4403;
      $message = Jtbc::take('::communal.text-tips-error-4403', 'lng');
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = Jtbc::take('manageUninstall.text-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }
}