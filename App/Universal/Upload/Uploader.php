<?php
namespace App\Universal\Upload;
use DirectoryIterator;
use Jtbc\DI;
use Jtbc\Date;
use Jtbc\Jtbc;
use Jtbc\Random;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\File\FileHelper;

abstract class Uploader
{
  protected $di = null;
  protected $genre = null;
  public $scene = null;

  protected function checkFile(chunkFile $chunkFile, string $argTargetPath = null)
  {
    $code = 0;
    $vars = [];
    $message = '';
    $result = false;
    $targetPath = $argTargetPath;
    $targetFileType = is_null($targetPath)? null: pathinfo($targetPath, PATHINFO_EXTENSION);
    $config = new Substance($this -> getSceneConfig());
    $file = $chunkFile -> file;
    $fileSize = $chunkFile -> fileSize;
    $fileName = $file['name'];
    $tmpFileName = $file['tmp_name'];
    $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    if (strpos($fileName, '.') === false)
    {
      $code = 4801;
    }
    else if (!in_array($fileType, explode(',', $config -> filetype)))
    {
      $code = 4802;
      $vars = ['filetype' => $config -> filetype];
    }
    else if (intval($fileSize) > $config -> maxsize)
    {
      $code = 4803;
      $vars = ['maxsize' => FileHelper::formatFileSize($config -> maxsize)];
    }
    else if (!is_null($targetPath) && $targetFileType != $fileType)
    {
      $code = 4804;
      $vars = ['filetype' => $targetFileType];
    }
    if ($code == 0)
    {
      $result = true;
    }
    else
    {
      $result = new Substance();
      $result -> code = $code;
      $result -> vars = $vars;
    }
    return $result;
  }

  protected function getTargetPath(string $argFileName)
  {
    $folder = [];
    $now = Date::now();
    $fileName = $argFileName;
    $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $folder[] = $this -> genre;
    $folder[] = Date::format($now, -1);
    $folder[] = Date::format($now, -2);
    $folder[] = Date::format($now, -3);
    $filename = Date::format($now, 10) . Random::getRandom(2, 'mix') . '.' . $fileType;
    $result = implode('/', $folder) . '/' . $filename;
    return $result;
  }

  protected function getSceneConfig()
  {
    $ss = new Substance();
    $scene = $this -> scene;
    $imageResize = null;
    $filetype = Jtbc::getConfig('upload-allowed-extensions');
    $maxsize = Jtbc::getConfig('upload-allowed-max-filesize');
    if (!is_null($scene))
    {
      $filetype = Jtbc::getConfig('upload-' . $scene . '-allowed-extensions') ?? $filetype;
      $maxsize = Jtbc::getConfig('upload-' . $scene . '-allowed-max-filesize') ?? $maxsize;
      $imageResize = Jtbc::getConfig('upload-' . $scene . '-image-resize');
    }
    $ss -> filetype = $filetype;
    $ss -> maxsize = $maxsize;
    if (!Validation::isEmpty($imageResize))
    {
      $ss -> imageResize = $imageResize;
    }
    return $ss -> all();
  }

  protected function getUploadId(Substance $file)
  {
    $result = 0;
    $model = new Model();
    $model -> pocket = new Substance($file -> all());
    $model -> pocket -> genre = $this -> genre;
    $model -> pocket -> time = Date::now();
    $re = $model -> save();
    if (is_numeric($re))
    {
      $result = $model -> lastInsertId;
    }
    return $result;
  }

  protected function removeChunkDir(string $argChunkDir)
  {
    $chunkDir = $argChunkDir;
    $dir = new DirectoryIterator($chunkDir);
    foreach ($dir as $item)
    {
      if ($item -> isFile())
      {
        @unlink($item -> getPathname());
      }
    }
    return @rmdir($chunkDir);
  }

  public function __construct(DI $di, string $argGenre)
  {
    $this -> di = $di;
    $this -> genre = $argGenre;
  }
}