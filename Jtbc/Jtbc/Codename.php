<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Jtbc;
use Jtbc\Env;
use Jtbc\Path;
use Jtbc\Validation;
use Jtbc\String\StringHelper;

class Codename
{
  private $codename = null;
  private $type = null;
  private $backTrace = null;
  private $fullCodename = null;

  public function getFullCodename()
  {
    $result = $this -> fullCodename;
    if (is_null($result))
    {
      $codename = $this -> codename;
      $backTrace = $this -> backTrace;
      $currentGenre = Path::getCurrentGenre();
      if (!Validation::isEmpty($codename))
      {
        $result = $codename;
        if (str_starts_with($codename, '*'))
        {
          if (is_array($backTrace))
          {
            $firstTrace = current($backTrace);
            if (array_key_exists('file', $firstTrace))
            {
              $firstFile = $firstTrace['file'];
              $rootPath = realpath(Path::getActualRoute('./')) . DIRECTORY_SEPARATOR;
              $keyPath = DIRECTORY_SEPARATOR . 'common' . DIRECTORY_SEPARATOR . 'interior' . DIRECTORY_SEPARATOR;
              if (str_contains($firstFile, $keyPath))
              {
                $firstGenre = StringHelper::getClipedString(StringHelper::getClipedString($firstFile, $keyPath, 'left+'), $rootPath, 'right+');
                if (Validation::isEmpty($firstGenre))
                {
                  $result = 'global.' . StringHelper::getClipedString($codename, '*', 'right+');
                }
                else
                {
                  $firstGenre = str_replace(DIRECTORY_SEPARATOR, '/', $firstGenre);
                  $result = 'global.' . $firstGenre . ':' . StringHelper::getClipedString($codename, '*', 'right+');
                }
              }
            }
          }
        }
        else if (str_starts_with($codename, './'))
        {
          $tempCodename = substr($codename, 2);
          $result = 'global.' . $currentGenre . (str_contains($tempCodename, ':')? '/': ':') . $tempCodename;
        }
        else if (str_starts_with($codename, '../'))
        {
          $generation = 0;
          $tempCodename = $codename;
          while(str_starts_with($tempCodename, '../'))
          {
            $generation += 1;
            $tempCodename = substr($tempCodename, 3);
          }
          $parentGenre = Path::getParentGenreByGeneration($generation);
          if (is_null($parentGenre)) $result = 'global.' . $tempCodename;
          else $result = 'global.' . $parentGenre . ':' . $tempCodename;
        }
        else if (str_starts_with($codename, 'universal:') || str_starts_with($codename, 'universal/'))
        {
          $result = 'global.' . $codename;
        }
        else
        {
          $majorGenre = Env::getMajorGenre();
          if (!is_null($majorGenre))
          {
            if (substr($codename, 0, 2) == '::') $result = 'global.' . $majorGenre . ':' . StringHelper::getClipedString($codename, '::', 'right');
            else if (substr($codename, 0, 2) == ':/') $result = 'global.' . $majorGenre . '/' . StringHelper::getClipedString($codename, ':/', 'right');
          }
        }
        $this -> fullCodename = $result;
      }
    }
    return $result;
  }

  public function getGenre()
  {
    $result = null;
    $fullCodename = $this -> getFullCodename();
    if ($fullCodename != null)
    {
      if (!str_contains($fullCodename, ':'))
      {
        $result = Path::getCurrentGenre();
      }
      else
      {
        $result = StringHelper::getClipedString(StringHelper::getClipedString($fullCodename, ':', 'left+'), 'global.', 'right');
      }
    }
    return $result;
  }

  public function getFilepath()
  {
    $result = null;
    $type = $this -> type;
    $fullCodename = $this -> getFullCodename();
    if ($fullCodename != null)
    {
      $tempResult = '';
      $hasGlobal = false;
      $path = $this -> getPath();
      $genre = $this -> getGenre();
      $folder = 'common';
      $extension = '.jtbc';
      if ($type == 'lng') $folder = 'common/language';
      else if ($type == 'tpl') $folder = 'common/template';
      if (substr($path, 0, 7) == 'global.')
      {
        $hasGlobal = true;
        $path = substr($path, 7);
      }
      if (str_contains($path, ':'))
      {
        $tempResult = StringHelper::getClipedString($path, ':', 'left') . '/' . $folder . '/' . StringHelper::getClipedString($path, ':', 'right') . $extension;
      }
      else
      {
        $tempResult = $folder . '/' . $path . $extension;
      }
      if ($hasGlobal != true && !Validation::isEmpty($genre))
      {
        $tempResult = $genre . '/' . $tempResult;
      }
      $result = Path::getActualRoute($tempResult);
    }
    return $result;
  }

  public function getFilename()
  {
    $result = null;
    $fullCodename = $this -> getFullCodename();
    if ($fullCodename != null)
    {
      $tempFilename = StringHelper::getClipedString($fullCodename, '.', 'left+');
      if (!str_contains($tempFilename, ':'))
      {
        $result = $tempFilename;
      }
      else
      {
        $result = StringHelper::getClipedString($tempFilename, ':', 'right+');
      }
    }
    return $result;
  }

  public function getPath()
  {
    $result = null;
    $fullCodename = $this -> getFullCodename();
    if ($fullCodename != null)
    {
      $result = StringHelper::getClipedString($fullCodename, '.', 'left+');
    }
    return $result;
  }

  public function getKeyword()
  {
    $result = null;
    $fullCodename = $this -> getFullCodename();
    if ($fullCodename != null)
    {
      $result = StringHelper::getClipedString($fullCodename, '.', 'right');
    }
    return $result;
  }

  public function __construct(string $argCodename, string $argType, $argBackTrace = null)
  {
    $this -> codename = $argCodename;
    $this -> type = $argType;
    $this -> backTrace = $argBackTrace;
  }
}