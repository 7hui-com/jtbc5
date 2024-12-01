<?php
namespace Jtbc;
use DirectoryIterator;
use Jtbc\File\FileSearcher;
use Jtbc\File\IO\Folder;
use Jtbc\String\StringHelper;
use App\Console\Common\EmptySubstance;
use App\Console\Common\BasicSubstance;
use App\Console\Log\Logger;
use App\Console\Common\Ambassador;
use App\Universal\Upload\chunkFile;
use App\Universal\Upload\LocalUploader\LocalUploader;

class Diplomat extends Ambassador {
  private $allowedExtensions = ['css', 'html', 'js', 'jtbc', 'php', 'svg', 'txt', 'xml'];

  private function isCorrectHash(string $argPath, string $argHash)
  {
    return Encoder::saltedMD5($argPath) == trim($argHash)? true: false;
  }

  private function isUnremovablePath(string $argPath)
  {
    $bool = false;
    $path = $argPath;
    $genre = strval($this -> getParam('genre'));
    if (str_starts_with($path, $genre . '/'))
    {
      $bool = true;
    }
    else if ($path == StringHelper::getClippedString($genre, '/', 'left+') . '/')
    {
      $bool = true;
    }
    return $bool;
  }

  private function isVaildPath(string $argPath)
  {
    $bool = false;
    $path = $argPath;
    $rootPath = realpath(Path::getActualRoute('./'));
    $currentPath = realpath(Path::getActualRoute($path));
    if ($currentPath !== false)
    {
      if (str_starts_with($currentPath, $rootPath))
      {
        $bool = true;
      }
    }
    return $bool;
  }

  private function isVaildFileName(string $argFileName)
  {
    $bool = false;
    $fileName = $argFileName;
    if (!Validation::isEmpty($fileName))
    {
      if (!str_contains($fileName, '/') && !str_contains($fileName, '\\'))
      {
        $bool = true;
      }
    }
    return $bool;
  }

  public function getFiles(Request $req)
  {
    $data = [];
    $dir = strval($req -> get('dir') ?? './');
    $rank = $dir == './'? 1: substr_count($dir, '/') + 1;
    $currentPath = realpath(Path::getActualRoute($dir));
    if (is_dir($currentPath))
    {
      $folders = $files = [];
      $dirIterator = new DirectoryIterator($currentPath);
      foreach ($dirIterator as $item)
      {
        $filename = $item -> getFilename();
        if (!$item -> isDot())
        {
          if ($item -> isDir())
          {
            $folders[$filename] = ['path' => $dir . $filename . '/', 'extension' => null];
          }
          else
          {
            $files[$filename] = ['path' => $dir . $filename, 'extension' => $item -> getExtension()];
          }
        }
      }
      ksort($folders);
      ksort($files);
      foreach ($folders as $key => $val)
      {
        $data[] = [
          'type' => 'folder',
          'rank' => $rank,
          'filename' => $key,
          'path' => $val['path'],
          'extension' => $val['extension'],
          'icon' => 'folder',
          'hash' => Encoder::saltedMD5($val['path']),
        ];
      }
      foreach ($files as $key => $val)
      {
        $data[] = [
          'type' => 'file',
          'rank' => $rank,
          'filename' => $key,
          'path' => $val['path'],
          'extension' => $val['extension'],
          'icon' => in_array($val['extension'], $this -> allowedExtensions)? $val['extension']: 'others',
          'hash' => Encoder::saltedMD5($val['path']),
        ];
      }
    }
    $es = new EmptySubstance();
    $es -> data -> data = $data;
    return $es -> toJSON();
  }

  public function getContent(Request $req)
  {
    $exists = false;
    $content = '';
    $mode = 'htmlmixed';
    $path = strval($req -> get('path'));
    $currentPath = realpath(Path::getActualRoute($path));
    if ($currentPath !== false)
    {
      $exists = true;
      $extension = strtolower(StringHelper::getClipedString($currentPath, '.', 'right'));
      $mode = match($extension)
      {
        'css' => 'css',
        'html' => 'htmlmixed',
        'js' => 'javascript',
        'jtbc' => 'xml',
        'php' => 'php',
        'svg' => 'xml',
        'txt' => 'htmlmixed',
        'xml' => 'xml',
      };
      $content = file_get_contents($currentPath);
    }
    $es = new EmptySubstance();
    $es -> data -> exists = $exists;
    $es -> data -> path = $path;
    $es -> data -> content = $content;
    $es -> data -> mode = $mode;
    $es -> data -> hash = Encoder::saltedMD5($path);
    return $es -> toJSON();
  }

  public function list(Request $req)
  {
    $bs = new BasicSubstance($this);
    return $bs -> toJSON();
  }

  public function search(Request $req)
  {
    $data = [];
    $keywords = strval($req -> get('keywords'));
    if (!Validation::isEmpty($keywords))
    {
      $filePath = './';
      $fileSearcher = new FileSearcher($filePath);
      $fileSearcher -> setAllowedExtensions($this -> allowedExtensions);
      $searchResult = $fileSearcher -> search(...explode(chr(32), $keywords));
      if (!empty($searchResult))
      {
        foreach ($searchResult as $item)
        {
          $filename = StringHelper::getClippedString($item, '/', 'right');
          $extension = StringHelper::getClippedString($item, '.', 'right');
          $data[] = [
            'filename' => $filename,
            'path' => $item,
            'extension' => $extension,
            'icon' => $extension,
            'hash' => Encoder::saltedMD5($item),
          ];
        }
      }
    }
    $es = new EmptySubstance();
    $es -> data -> data = $data;
    return $es -> toJSON();
  }

  public function actionAddFile(Request $req)
  {
    $code = 0;
    $param = '';
    $message = null;
    $path = strval($req -> get('path'));
    if ($this -> guard -> role -> checkPermission('add'))
    {
      if (!$this -> isVaildPath($path)) $code = 4001;
      else
      {
        $chunkFile = new chunkFile($req);
        $targetPath = Path::getActualRoute($path . $chunkFile -> file['name']);
        $uploader = new LocalUploader($this -> di, $this -> getParam('genre'), false);
        $uploadFile = $uploader -> uploadFile($chunkFile, $targetPath);
        if (!is_null($uploadFile))
        {
          $code = $uploadFile -> code;
          $vars = $uploadFile -> vars;
          $param = $uploadFile -> param;
          $message = Jtbc::take('::communal.text-upload-code-' . $code, 'lng', false, $vars) ?? Jtbc::take('::communal.text-upload-code-others', 'lng');
          if ($code == 1)
          {
            $code = 1;
            Logger::log($this, 'manage.log-addfile', ['path' => $targetPath]);
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
    $ss -> message = Jtbc::take('manage.text-add-file-code-' . $code, 'lng') ?: $message;
    $ss -> param = $param;
    $result = $ss -> toJSON();
    return $result;
  }

  public function actionCreateFolder(Request $req)
  {
    $code = 0;
    $message = null;
    $path = strval($req -> post('path'));
    $fileName = strval($req -> post('filename'));
    $fullPath = Path::getActualRoute($path . $fileName);
    if (!$this -> isVaildPath($path)) $code = 4001;
    else if (!$this -> isVaildFileName($fileName)) $code = 4002;
    else if (is_dir($fullPath)) $code = 4003;
    else
    {
      $code = @mkdir($fullPath)? 1: 4040;
      if ($code == 1)
      {
        Logger::log($this, 'manage.log-createfolder', ['path' => $fullPath]);
      }
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = $message ?? Jtbc::take('manage.text-create-folder-code-' . $code, 'lng');
    $result = $ss -> toJSON();
    return $result;
  }

  public function actionCreateFile(Request $req)
  {
    $code = 0;
    $message = null;
    $path = strval($req -> post('path'));
    $fileName = strval($req -> post('filename'));
    $fullPath = Path::getActualRoute($path . $fileName);
    $extension = strtolower(StringHelper::getClipedString($fileName, '.', 'right'));
    if (!$this -> isVaildPath($path)) $code = 4001;
    else if (!$this -> isVaildFileName($fileName)) $code = 4002;
    else if (is_file($fullPath)) $code = 4003;
    else if (!in_array($extension, $this -> allowedExtensions)) $code = 4004;
    else
    {
      $code = @file_put_contents($fullPath, '') !== false? 1: 4040;
      if ($code == 1)
      {
        Logger::log($this, 'manage.log-createfile', ['path' => $fullPath]);
      }
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = $message ?? Jtbc::take('manage.text-create-file-code-' . $code, 'lng');
    $result = $ss -> toJSON();
    return $result;
  }

  public function actionDelete(Request $req)
  {
    $code = 0;
    $message = null;
    $path = strval($req -> get('path'));
    $hash = strval($req -> get('hash'));
    $fullPath = Path::getActualRoute($path);
    if ($this -> isUnremovablePath($path)) $code = 4000;
    else if (!is_dir($fullPath) && !is_file($fullPath)) $code = 4001;
    else if (!$this -> isVaildPath($path)) $code = 4002;
    else if (!$this -> isCorrectHash($path, $hash)) $code = 4003;
    else
    {
      if (is_dir($fullPath))
      {
        $code = Folder::delete($fullPath)? 1: 4040;
      }
      else if (is_file($fullPath))
      {
        $code = @unlink($fullPath)? 1: 4040;
      }
      if ($code == 1)
      {
        Logger::log($this, 'manage.log-delete', ['path' => $fullPath]);
      }
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = $message ?? Jtbc::take('manage.text-delete-code-' . $code, 'lng');
    $result = $ss -> toJSON();
    return $result;
  }

  public function actionRename(Request $req)
  {
    $code = 0;
    $message = null;
    $path = strval($req -> post('path'));
    $hash = strval($req -> post('hash'));
    $fileName = strval($req -> post('filename'));
    $targetFileName = strval($req -> post('target_filename'));
    $fullPath = Path::getActualRoute($path);
    $targetFullPath = Path::getActualRoute(StringHelper::getClipedString($path, $fileName, 'left+') . $targetFileName);
    if (str_ends_with($fullPath, '/') && !str_ends_with($targetFullPath, '/'))
    {
      $targetFullPath .= '/';
    }
    if ($fullPath == $targetFullPath)
    {
      $code = 1;
    }
    else
    {
      if (!is_dir($fullPath) && !is_file($fullPath)) $code = 4001;
      else if (!$this -> isVaildPath($path)) $code = 4002;
      else if (!$this -> isCorrectHash($path, $hash)) $code = 4003;
      else if (is_dir($targetFullPath) || is_file($targetFullPath)) $code = 4004;
      else
      {
        $code = @rename($fullPath, $targetFullPath)? 1: 4040;
        if ($code == 1)
        {
          Logger::log($this, 'manage.log-rename', ['path' => $fullPath, 'newpath' => $targetFullPath]);
        }
      }
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = $message ?? Jtbc::take('manage.text-rename-code-' . $code, 'lng');
    $result = $ss -> toJSON();
    return $result;
  }

  public function actionSave(Request $req)
  {
    $code = 0;
    $message = null;
    $path = strval($req -> post('path'));
    $hash = strval($req -> post('hash'));
    $content = strval($req -> post('content'));
    $fullPath = Path::getActualRoute($path);
    if (!is_file($fullPath)) $code = 4001;
    else if (!$this -> isVaildPath($path)) $code = 4002;
    else if (!$this -> isCorrectHash($path, $hash)) $code = 4003;
    else
    {
      $code = @file_put_contents($fullPath, $content) !== false? 1: 4040;
      if ($code == 1)
      {
        Logger::log($this, 'manage.log-save', ['path' => $fullPath]);
      }
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = $message ?? Jtbc::take('manage.text-save-code-' . $code, 'lng');
    $result = $ss -> toJSON();
    return $result;
  }
}