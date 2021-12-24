<?php
namespace App\Universal\Common;
use Jtbc\Module;
use Jtbc\Substance;
use Jtbc\Model\TinyModel;

class DataCleaner
{
  private $module;
  private $genre;
  private $settings;
  private $truncatedTables = [];
  private $untruncatedTables = [];

  public function getCleanableModules()
  {
    $result = [];
    $childGenreList = $this -> module -> getChildGenreList();
    foreach ($childGenreList as $childGenre)
    {
      $childModule = new Module($childGenre, 'config', false);
      if ($childModule -> isBatchUninstallAble === false && $childModule -> hasNoTable === false)
      {
        $batchTruncateMode = intval($childModule -> config['batch-truncate-mode'] ?? -1);
        if (in_array($batchTruncateMode, [0, 1]))
        {
          $result[$childGenre] = $childModule;
        }
      }
    }
    return $result;
  }

  public function getTruncatedTables()
  {
    return $this -> truncatedTables;
  }

  public function getUntruncatedTables()
  {
    return $this -> untruncatedTables;
  }

  public function getTargetTables()
  {
    $result = [];
    $cleanableModules = $this -> getCleanableModules();
    foreach ($cleanableModules as $childGenre => $childModule)
    {
      if ($this -> settings[$childGenre] === true)
      {
        $result[$childGenre] = $childModule -> getTableNameList();
      }
    }
    return $result;
  }

  public function clean()
  {
    $result = null;
    $targetTables = $this -> getTargetTables();
    if (is_array($targetTables))
    {
      $result = true;
      foreach ($targetTables as $key => $tables)
      {
        foreach ($tables as $table)
        {
          $targetModel = new TinyModel($table);
          if (is_numeric($targetModel -> truncate(true)))
          {
            $this -> truncatedTables[] = $table;
          }
          else
          {
            $result = false;
            $this -> untruncatedTables[] = $table;
          }
        }
      }
    }
    return $result;
  }

  public function __construct(Substance $settings)
  {
    $this -> genre = 'universal';
    $this -> settings = $settings;
    $this -> module = new Module($this -> genre, 'config', false);
  }
}