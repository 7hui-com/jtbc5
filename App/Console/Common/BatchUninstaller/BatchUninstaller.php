<?php
namespace App\Console\Common\BatchUninstaller;
use Jtbc\Module;
use Jtbc\Validation;
use App\Common\Uninstaller;
use App\Common\Module\ModuleUninstaller;

class BatchUninstaller extends Uninstaller
{
  private $genre;
  private $module;
  private $confirmedGenres;
  private $errors = [];

  private function uninstallChild()
  {
    $result = false;
    $childGenreList = $this -> module -> getChildGenreList('guide', false);
    if (empty($childGenreList))
    {
      $result = 0;
    }
    else
    {
      $result = 0;
      foreach ($childGenreList as $childGenre)
      {
        if (in_array($childGenre, $this -> confirmedGenres))
        {
          $currentModule = new Module($childGenre);
          if ($currentModule -> isParentModule)
          {
            if ($currentModule -> isBatchUninstallAble)
            {
              $batchUninstaller = new BatchUninstaller($childGenre, $this -> confirmedGenres);
              $uninstalled = $batchUninstaller -> uninstall();
              if (is_int($uninstalled))
              {
                $result += $uninstalled;
              }
              if ($batchUninstaller -> hasError())
              {
                $this -> lastErrorCode = $batchUninstaller -> getLastErrorCode();
                $this -> errors = array_merge($this -> errors, $batchUninstaller -> getErrors());
              }
            }
          }
          else if ($currentModule -> isBatchUninstallAble)
          {
            $moduleUninstaller = new ModuleUninstaller($childGenre);
            $uninstalled = $moduleUninstaller -> uninstall();
            if ($uninstalled === true)
            {
              $result += 1;
            }
            else
            {
              $lastErrorCode = $moduleUninstaller -> getLastErrorCode();
              $this -> lastErrorCode = $lastErrorCode;
              $this -> errors[] = ['genre' => $childGenre, 'lastErrorCode' => $lastErrorCode];
            }
          }
        }
      }
      if ($result == 0)
      {
        $result = false;
      }
    }
    return $result;
  }

  private function uninstallSelf()
  {
    $result = false;
    $currentGenre = $this -> genre;
    if (!Validation::isEmpty($currentGenre))
    {
      if (in_array($currentGenre, $this -> confirmedGenres))
      {
        if ($this -> module -> isBatchUninstallAble)
        {
          $moduleUninstaller = new ModuleUninstaller($currentGenre);
          $uninstalled = $moduleUninstaller -> uninstall();
          if ($uninstalled === true)
          {
            $result = 1;
          }
          else
          {
            $lastErrorCode = $moduleUninstaller -> getLastErrorCode();
            $this -> lastErrorCode = $lastErrorCode;
            $this -> errors[] = ['genre' => $currentGenre, 'lastErrorCode' => $lastErrorCode];
          }
        }
      }
    }
    return $result;
  }

  public function getErrors()
  {
    return $this -> errors;
  }

  public function hasError()
  {
    return empty($this -> errors)? true: false;
  }

  public function uninstall()
  {
    $result = false;
    if (Validation::isEmpty($this -> genre))
    {
      $result = $this -> uninstallChild();
    }
    else if ($this -> module -> isParentModule)
    {
      $childUninstalled = $this -> uninstallChild();
      if (is_int($childUninstalled))
      {
        $result = $childUninstalled;
        $selfUninstalled = $this -> uninstallSelf();
        if (is_int($selfUninstalled))
        {
          $result += $selfUninstalled;
        }
      }
    }
    else
    {
      $result = $this -> uninstallSelf();
    }
    return $result;
  }

  public function __construct(string $argGenre, array $argConfirmedGenres)
  {
    $this -> genre = $argGenre;
    $this -> confirmedGenres = $argConfirmedGenres;
    $this -> module = new Module($this -> genre);
  }
}