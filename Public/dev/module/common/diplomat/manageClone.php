<?php
namespace Jtbc;
use Jtbc\DB\DBFactory;
use Jtbc\File\IO\Folder;
use Jtbc\Jtbc\JtbcReader;
use Jtbc\Jtbc\JtbcWriter;
use Jtbc\Module\ModuleFinder;
use Jtbc\Module\ModuleHelper;
use Jtbc\String\StringHelper;
use App\Common\Module\InteriorNamespaceModifier;
use App\Common\Module\ModuleHooksManager;
use App\Console\Common\Ambassador;
use App\Console\Log\Logger;

class Diplomat extends Ambassador {
  private function hasUnstandardParentModule(string $argModuleName)
  {
    $result = false;
    $moduleName = $argModuleName;
    if (is_numeric(strpos($moduleName, '/')))
    {
      $modulePath = Path::getActualRoute($moduleName);
      $parentModulePath = StringHelper::getClipedString(pathinfo($modulePath . '/virtual.jtbc', PATHINFO_DIRNAME), '/', 'left+');
      $guidePath = $parentModulePath . '/common/guide.jtbc';
      if (!is_file($guidePath))
      {
        $result = true;
      }
      else
      {
        if (JtbcReader::getXMLAttr($guidePath, 'mode') != 'jtbcf')
        {
          $result = true;
        }
      }
    }
    return $result;
  }

  private function hasUnstandardTableName(Module $module)
  {
    $result = false;
    if ($module -> hasNoTable != true)
    {
      $tableNameList = $module -> getTableNameList();
      foreach ($tableNameList as $tableName)
      {
        if (strpos($tableName, ModuleHelper::getTableNameByGenre($module -> getName())) !== 0)
        {
          $result = true;
        }
      }
    }
    return $result;
  }

  public function actionClone(Request $req)
  {
    $code = 0;
    $message = '';
    $genre = strval($req -> post('genre'));
    $moduleName = strval($req -> post('module_name'));
    $moduleTitle = strval($req -> post('module_title'));
    $moduleIcon = strval($req -> post('module_icon'));
    if ($this -> guard -> role -> checkPermission('clone'))
    {
      if (!Validation::isDirPath($genre) || !Validation::isDirPath($moduleName))
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
      else
      {
        $sourceModule = new Module($genre);
        $newModulePath = Path::getActualRoute($moduleName);
        if ($sourceModule -> isCloneAble != true)
        {
          $code = 4004;
        }
        else if (is_dir($newModulePath))
        {
          $code = 4005;
        }
        else if ($this -> hasUnstandardTableName($sourceModule))
        {
          $code = 4006;
        }
        else if ($this -> hasUnstandardParentModule($moduleName))
        {
          $code = 4007;
        }
        else
        {
          $sourceModulePath = Path::getActualRoute($sourceModule -> getName());
          if (Folder::copyTo($sourceModulePath, $newModulePath))
          {
            $allTableCloned = true;
            $allTableClonedMap = [];
            $db = DBFactory::getInstance();
            $sourceModuleTableNameList = $sourceModule -> getTableNameList();
            foreach ($sourceModuleTableNameList as $sourceModuleTableName)
            {
              $newModuleTableName = ModuleHelper::getTableNameByGenre($moduleName) . StringHelper::getClipedString($sourceModuleTableName, ModuleHelper::getTableNameByGenre($genre), 'right+');
              if (!$db -> cloneTable($sourceModuleTableName, $newModuleTableName))
              {
                $allTableCloned = false;
              }
              else
              {
                $allTableClonedMap[$sourceModuleTableName] = $newModuleTableName;
              }
            }
            if ($allTableCloned === false)
            {
              $code = 4009;
              Folder::delete($newModulePath);
            }
            else
            {
              $newModuleNodeName = 'zh-cn';
              $newModuleTitlePathType = 'cfg';
              $newModuleTitlePath = $newModulePath . '/common/guide.jtbc';
              $changedIcon = JtbcWriter::putNodeContent($newModuleTitlePath, $newModuleTitlePathType, 'icon', $moduleIcon, $newModuleNodeName);
              $newModuleTitle = Jtbc::take('global.' . $moduleName . ':index.title', 'lng');
              if ($newModuleTitle != null)
              {
                $newModuleTitlePathType = 'lng';
                $newModuleTitlePath = $newModulePath . '/common/language/index.jtbc';
              }
              $changedTitle = JtbcWriter::putNodeContent($newModuleTitlePath, $newModuleTitlePathType, 'title', $moduleTitle, $newModuleNodeName);
              if ($changedIcon === true && $changedTitle === true)
              {
                $code = 1;
                $moduleFinder = new ModuleFinder();
                $moduleFinder -> removeCache();
                $newModuleConfig = Jtbc::take('global.' . $moduleName . ':config.*', 'cfg');
                $newModuleConfigPath = $newModulePath . '/common/config.jtbc';
                foreach ($newModuleConfig as $configKey => $configVal)
                {
                  if (strpos($configKey, 'db_table_') === 0)
                  {
                    foreach ($allTableClonedMap as $cloneMapKey => $cloneMapVal)
                    {
                      if ($configVal == $cloneMapKey)
                      {
                        JtbcWriter::putNodeContent($newModuleConfigPath, 'cfg', $configKey, $cloneMapVal, $newModuleNodeName);
                        break;
                      }
                    }
                  }
                }
                $interiorNamespaceModifier = new InteriorNamespaceModifier($moduleName, Path::getInteriorNameSpace($genre));
                if ($interiorNamespaceModifier -> modify())
                {
                  $moduleHooksManager = new ModuleHooksManager($moduleName);
                  $moduleHooksManager -> registerIfNotExists();
                }
                Logger::log($this, 'manageClone.log-clone', ['sourceModule' => $genre, 'newModule' => $moduleName]);
              }
              else
              {
                $code = 4010;
              }
            }
          }
          else
          {
            $code = 4008;
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
    $ss -> message = Jtbc::take('manageClone.text-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }
}