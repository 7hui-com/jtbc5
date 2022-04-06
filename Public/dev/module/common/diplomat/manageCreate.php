<?php
namespace Jtbc;
use Jtbc\Jtbc\JtbcWriter;
use Jtbc\Module\ModuleFinder;
use App\Common\Module\ModuleInstaller;
use App\Console\Common\BasicSubstance;
use App\Console\Common\Ambassador;
use App\Console\Log\Logger;

class Diplomat extends Ambassador {
  public function actionCreate(Request $req)
  {
    $code = 0;
    $message = '';
    $genre = strval($req -> post('genre'));
    $folderName = strval($req -> post('folder_name'));
    $moduleTitle = strval($req -> post('module_title'));
    $moduleType = intval($req -> post('module_type'));
    $moduleIcon = strval($req -> post('module_icon'));
    if ($this -> guard -> role -> checkPermission('create'))
    {
      if (!Validation::isNatural($folderName))
      {
        $code = 4001;
      }
      else if (Validation::isEmpty($moduleTitle))
      {
        $code = 4002;
      }
      else if (Validation::isEmpty($moduleIcon))
      {
        $code = 4003;
      }
      else if (!Validation::isEmpty($genre) && !is_dir(Path::getActualRoute($genre)))
      {
        $code = 4004;
      }
      else if (substr_count($genre, '/') > 2)
      {
        $code = 4005;
      }
      else
      {
        $moduleName = empty($genre)? $folderName: $genre . '/' . $folderName;
        $newModulePath = Path::getActualRoute($moduleName);
        if (is_dir($newModulePath))
        {
          $code = 4006;
        }
        else
        {
          $moduleInstaller = new ModuleInstaller('common/assets/module/' . $moduleType . '.zip');
          $installed = $moduleInstaller -> installTo($moduleName, $moduleTitle, $moduleIcon);
          if ($installed === true)
          {
            $code = 1;
            $moduleFinder = new ModuleFinder();
            $moduleFinder -> removeCache();
            Logger::log($this, 'manageCreate.log-create', ['newModule' => $moduleName]);
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
    $ss -> message = Jtbc::take('manageCreate.text-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }
}