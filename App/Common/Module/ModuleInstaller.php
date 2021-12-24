<?php
namespace App\Common\Module;
use Exception;
use ZipArchive;
use Jtbc\Jtbc;
use Jtbc\Path;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\DB\DBFactory;
use Jtbc\File\IO\Folder;
use Jtbc\Jtbc\JtbcReader;
use Jtbc\Jtbc\JtbcWriter;
use Jtbc\String\StringHelper;
use Jtbc\Module\ModuleHelper;
use App\Common\Installer;

class ModuleInstaller extends Installer
{
  private $existedDBTables = [];

  private function isValidParentGenre(string $argParentGenre)
  {
    $result = false;
    $parentGenre = $argParentGenre;
    $fullModulePath = Path::getActualRoute($parentGenre);
    if (JtbcReader::getXMLAttr($fullModulePath . '/common/guide.jtbc', 'mode') == 'jtbcf')
    {
      $result = true;
    }
    return $result;
  }

  public function getExistedDBTables()
  {
    return $this -> existedDBTables;
  }

  public function hasExistedDBTables(Substance $meta)
  {
    $result = false;
    $createDBTables = $meta -> create_db_tables;
    if (is_array($createDBTables))
    {
      $db = DBFactory::getInstance($this -> dbLink);
      foreach ($createDBTables as $dbTable)
      {
        if ($db -> hasTable($dbTable))
        {
          $result = true;
          $this -> existedDBTables[] = $dbTable;
        }
      }
    }
    return $result;
  }

  public function installTo(string $argGenre, string $argModuleTitle, string $argModuleIcon)
  {
    $result = false;
    $genre = $argGenre;
    $parentGenre = strpos($genre, '/') === false? null: StringHelper::getClipedString($genre, '/', 'left+');
    $moduleTitle = $argModuleTitle;
    $moduleIcon = $argModuleIcon;
    $fullModulePath = Path::getActualRoute($genre);
    if (!is_file($this -> zipFilePath))
    {
      $this -> lastErrorCode = 1000;
    }
    else if (!Validation::isDirPath($genre))
    {
      $this -> lastErrorCode = 1001;
    }
    else if (is_dir($fullModulePath))
    {
      $this -> lastErrorCode = 1002;
    }
    else if (!is_null($parentGenre) && !$this -> isValidParentGenre($parentGenre))
    {
      $this -> lastErrorCode = 1003;
    }
    else
    {
      $zipArchive = new ZipArchive();
      $opened = $zipArchive -> open($this -> zipFilePath);
      if ($opened === true)
      {
        $meta = $this -> getMetaData($zipArchive);
        $updatePhars = $meta -> update_phars;
        if ($this -> hasExistedDBTables($meta))
        {
          $this -> lastErrorCode = 1021;
        }
        else if (!$this -> updatePhars($meta))
        {
          $this -> lastErrorCode = 1026;
        }
        else
        {
          $extracted = $zipArchive -> extractTo($fullModulePath);
          if ($extracted === true)
          {
            $hasSQL = false;
            $execResult = false;
            $sqlPath = $fullModulePath . '/_install.sql';
            if (is_file($sqlPath))
            {
              $hasSQL = true;
              $db = DBFactory::getInstance($this -> dbLink);
              $sqlContent = file_get_contents($sqlPath);
              $sqlContent = str_replace('{$tableName}', ModuleHelper::getTableNameByGenre($genre), $sqlContent);
              try
              {
                $execResult = $db -> exec($sqlContent);
              }
              catch(Exception $e)
              {
                $execResult = false;
              }
            }
            $iteratorFolder = $fullModulePath . '/common/interior/';
            if (is_dir($iteratorFolder))
            {
              $interiorNamespaceModifier = new InteriorNamespaceModifier($genre);
              if ($interiorNamespaceModifier -> modify())
              {
                $moduleHooksManager = new ModuleHooksManager($genre);
                if ($moduleHooksManager -> hasHookHandle() && !$moduleHooksManager -> registerIfNotExists())
                {
                  $this -> lastErrorCode = 1040;
                }
              }
            }
            if ($hasSQL === true && !is_numeric($execResult))
            {
              $this -> lastErrorCode = 1020;
              Folder::delete($fullModulePath);
            }
            else
            {
              $changedTitle = false;
              $guideFilePath = $fullModulePath . '/common/guide.jtbc';
              $changedIcon = JtbcWriter::putNodeContent($guideFilePath, 'cfg', 'icon', $moduleIcon);
              if (!is_null(Jtbc::take('global.' . $genre . ':index.title', 'lng')))
              {
                $indexLanguageFilePath = $fullModulePath . '/common/language/index.jtbc';
                $changedTitle = JtbcWriter::putNodeContent($indexLanguageFilePath, 'lng', 'title', $moduleTitle);
              }
              else
              {
                $changedTitle = JtbcWriter::putNodeContent($guideFilePath, 'cfg', 'title', $moduleTitle);
              }
              if ($changedIcon === true && $changedTitle === true)
              {
                $moduleFilePath = $fullModulePath . '/common/module.jtbc';
                if ($this -> writePremiumSignToFile($moduleFilePath) !== false)
                {
                  $result = true;
                }
                else
                {
                  $this -> lastErrorCode = 1444;
                }
              }
              else
              {
                $this -> lastErrorCode = 1314;
              }
            }
            $this -> clean($fullModulePath);
          }
          else
          {
            $this -> lastErrorCode = 1030;
          }
        }
      }
      else
      {
        $this -> lastErrorCode = 1010;
      }
      $zipArchive -> close();
    }
    return $result;
  }
}