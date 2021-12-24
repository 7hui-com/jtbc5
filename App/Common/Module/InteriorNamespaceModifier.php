<?php
namespace App\Common\Module;
use Jtbc\Path;
use DirectoryIterator;

class InteriorNamespaceModifier
{
  private $genre;
  private $originalNamespace;

  private function getInteriorFolder()
  {
    return Path::getActualRoute($this -> genre) . '/common/interior/';
  }

  private function getAllInteriorFiles()
  {
    $result = [];
    if ($this -> hasInteriorFolder())
    {
      $folder = $this -> getInteriorFolder();
      $dirIterator = new DirectoryIterator($folder);
      foreach ($dirIterator as $item)
      {
        $filename = $item -> getFilename();
        if (!$item -> isDot() && !$item -> isDir())
        {
          if (str_ends_with($filename, '.php'))
          {
            $result[] = $folder . $filename;
          }
        }
      }
    }
    return $result;
  }

  public function hasInteriorFolder()
  {
    return is_dir($this -> getInteriorFolder())? true: false;
  }

  public function modify()
  {
    $result = false;
    $allInteriorFiles = $this -> getAllInteriorFiles();
    if (!empty($allInteriorFiles))
    {
      $result = true;
      foreach ($allInteriorFiles as $file)
      {
        $currentFileContent = file_get_contents($file);
        $key = chr(10) . 'namespace ' . $this -> originalNamespace . ';';
        $target = chr(10) . 'namespace ' . Path::getInteriorNameSpace($this -> genre) . ';';
        if (strpos($currentFileContent, $key) < 10 && substr_count($currentFileContent, $key) === 1)
        {
          $realFileContent = str_replace($key, $target, $currentFileContent);
          if (!@file_put_contents($file, $realFileContent))
          {
            $result = false;
          }
        }
        else
        {
          $result = false;
        }
      }
    }
    return $result;
  }

  public function __construct(string $argGenre, string $argOriginalNamespace = 'UnknownNamespace')
  {
    $this -> genre = $argGenre;
    $this -> originalNamespace = $argOriginalNamespace;
  }
}