<?php
namespace App\Common\Module;
use Jtbc\Path;
use Jtbc\Module;
use Jtbc\Substance;
use Jtbc\DB\DBFactory;
use Jtbc\File\IO\Folder;
use App\Common\Uninstaller;

class ModuleUninstaller extends Uninstaller
{
  private $module;
  private $dbLink;

  public function uninstall()
  {
    $result = false;
    $module = $this -> module;
    if ($module -> isUninstallAble !== true)
    {
      $this -> lastErrorCode = 1401;
    }
    else if (!empty($module -> getChildGenreList()))
    {
      $this -> lastErrorCode = 1402;
    }
    else
    {
      $folder = $module -> getName();
      $tableNameList = $module -> getTableNameList();
      $folderPath = Path::getActualRoute($folder);
      if (!Folder::delete($folderPath))
      {
        $this -> lastErrorCode = 1403;
      }
      else
      {
        $result = true;
        if (!empty($tableNameList))
        {
          $db = DBFactory::getInstance($this -> dbLink);
          foreach ($tableNameList as $tableName)
          {
            if (!$db -> dropTable($tableName))
            {
              $this -> lastErrorCode = 1404;
            }
          }
        }
      }
    }
    return $result;
  }

  public function __construct(string $argGenre, $argDBLink = null)
  {
    $this -> module = new Module(argGenre: $argGenre, argIsCacheable: false);
    $this -> dbLink = $argDBLink;
  }
}