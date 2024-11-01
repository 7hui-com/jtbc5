<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\File;
use DirectoryIterator;
use Jtbc\Path;
use Jtbc\Validation;
use Jtbc\String\StringHelper;
use Jtbc\Exception\NotExistException;

class FileSearcher
{
  private $folderPath;
  private $allowedExtensions = ['css', 'html', 'js', 'jtbc', 'php', 'svg', 'txt', 'xml'];

  public function isEmptyArgs(string ...$args)
  {
    $result = true;
    if (!empty($args))
    {
      foreach ($args as $arg)
      {
        if (!Validation::isEmpty($arg))
        {
          $result = false;
          break;
        }
      }
    }
    return $result;
  }

  public function search(string ...$args)
  {
    $result = [];
    if (!$this -> isEmptyArgs(...$args))
    {
      $search = function(string $folderPath) use ($args, &$result, &$search)
      {
        $dirIterator = new DirectoryIterator($folderPath);
        foreach ($dirIterator as $item)
        {
          $filename = $item -> getFilename();
          $extension = $item -> getExtension();
          if (!$item -> isDot())
          {
            $filePath = $folderPath . (str_ends_with($folderPath, '/')? '': '/') . $filename;
            if ($item -> isDir())
            {
              $search($filePath);
            }
            else
            {
              if (in_array($extension, $this -> allowedExtensions))
              {
                $bool = true;
                $fileContent = file_get_contents($filePath);
                foreach ($args as $arg)
                {
                  if (!str_contains($fileContent, $arg))
                  {
                    $bool = false;
                    break;
                  }
                }
                if ($bool === true)
                {
                  $result[] = StringHelper::getClippedString($filePath, $this -> folderPath, 'right+');
                }
              }
            };
          }
        }
      };
      $search($this -> folderPath);
    }
    return $result;
  }

  public function setAllowedExtensions(array $argAllowedExtensions)
  {
    $this -> allowedExtensions = $argAllowedExtensions;
  }

  public function __construct(string $argFolder)
  {
    $folder = $argFolder;
    $folderPath = Path::getActualRoute($folder);
    if (is_dir($folderPath))
    {
      $this -> folderPath = $folderPath;
    }
    else
    {
      throw new NotExistException('Folder "' . $folder . '" does not exist', 50404);
    }
  }
}