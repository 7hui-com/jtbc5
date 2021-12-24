<?php
namespace App\Universal\Upload\LocalUploader;
use Jtbc\DI;
use Jtbc\Path;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\File\Image;
use Jtbc\File\FileHelper;
use App\Universal\Upload\Uploader;
use App\Universal\Upload\FileUploader;
use App\Universal\Upload\chunkFile;
use Config\App\Universal\Upload\Uploader as Config;

class LocalUploader extends Uploader implements FileUploader
{
  private $limit = null;
  private $needUploadId = true;

  private function mergeFile(string $argFileTempPath, int $argChunkCount)
  {
    $result = true;
    $fileTempPath = $argFileTempPath;
    $chunkCount = $argChunkCount;
    $tempChunkPath = pathinfo($fileTempPath, PATHINFO_DIRNAME);
    $fpTemp = fopen($fileTempPath, 'ab');
    for ($i = 0; $i <= $chunkCount; $i ++)
    {
      $currentCacheChunkPath = $tempChunkPath . '/' . $i . '.tmp';
      if (!is_file($currentCacheChunkPath))
      {
        $result = false;
        break;
      }
      else
      {
        $chunkHandle = fopen($currentCacheChunkPath, 'r');
        fwrite($fpTemp, fread($chunkHandle, filesize($currentCacheChunkPath)));
        fclose($chunkHandle);
      }
    }
    fclose($fpTemp);
    return $result;
  }

  public function removeFile(string $argFilePath)
  {
    $filePath = $argFilePath;
    return @unlink(Path::getActualRoute($filePath));
  }

  public function uploadFile(chunkFile $chunkFile, string $argTargetPath = null)
  {
    $result = null;
    $targetPath = $argTargetPath;
    $file = $chunkFile -> file;
    $fileName = $file['name'];
    $tmpFileName = $file['tmp_name'];
    $fileSize = $chunkFile -> fileSize;
    $chunkCount = $chunkFile -> chunkCount;
    $chunkCurrentIndex = $chunkFile -> chunkCurrentIndex;
    $chunkParam = $chunkFile -> chunkParam;
    $randomString = $chunkFile -> randomString;
    if (strlen($randomString) == 28 && Validation::isNumber($randomString))
    {
      $checkFile = $this -> checkFile($chunkFile, $targetPath);
      if ($checkFile === true)
      {
        $code = 0;
        $vars = [];
        $param = [];
        $tempDir = Path::getActualRoute(Config::TEMP_DIR);
        $tempChunkDir = $tempDir . '/' . $randomString;
        if (!is_dir($tempChunkDir) && !@mkdir($tempChunkDir))
        {
          $code = 4811;
        }
        else
        {
          $tempChunkPath = $tempChunkDir . '/' . $chunkCurrentIndex . '.tmp';
          if (move_uploaded_file($tmpFileName, $tempChunkPath))
          {
            if ($chunkCount == $chunkCurrentIndex)
            {
              $myTargetPath = Config::LOCAL_DIR . '/' . $this -> getTargetPath($fileName);
              $fullTargetPath = $targetPath ?? Path::getActualRoute($myTargetPath);
              $fullFolderPath = pathinfo($fullTargetPath, PATHINFO_DIRNAME);
              if (!is_dir($fullFolderPath) && !@mkdir($fullFolderPath, 0777, true))
              {
                $code = 4813;
              }
              else
              {
                $fileTempPath = $tempChunkDir . '/temp.tmp';
                if ($this -> mergeFile($fileTempPath, $chunkCount))
                {
                  $fileTrueSize = filesize($fileTempPath);
                  $config = new Substance($this -> getSceneConfig());
                  if (intval($fileTrueSize) > $config -> maxsize)
                  {
                    $code = 4803;
                    $vars = ['maxsize' => FileHelper::formatFileSize($config -> maxsize)];
                  }
                  else
                  {
                    $renameFile = rename($fileTempPath, $fullTargetPath);
                    if ($renameFile == true)
                    {
                      $this -> removeChunkDir($tempChunkDir);
                      $fileType = pathinfo($fullTargetPath, PATHINFO_EXTENSION);
                      if (in_array($fileType, ['jpg','gif','png']) && Validation::isJSON($config -> imageResize))
                      {
                        $image = new Image($fullTargetPath);
                        $imageResize = new Substance($config -> imageResize);
                        $imageResizeMode = $imageResize -> mode ?? 'cover';
                        $imageResizeQuality = $imageResize -> quality ?? 90;
                        $image -> resize($imageResize -> width, $imageResize -> height, $imageResizeMode);
                        $image -> saveAs($fullTargetPath, $imageResizeQuality);
                      }
                      $newFile = new Substance();
                      $newFile -> filename = $fileName;
                      $newFile -> filesize = $fileTrueSize;
                      $newFile -> filetype = $fileType;
                      $newFile -> filepath = $fullTargetPath;
                      $newFile -> fileurl = '/' . $myTargetPath;
                      $newFile -> filegroup = FileHelper::getFileGroup($fileType);
                      $newFile -> filesize_text = FileHelper::formatFileSize($fileTrueSize);
                      $newFile -> uploadid = $this -> needUploadId == true? $this -> getUploadId($newFile): 0;
                      $code = 1;
                      $param = $newFile -> all();
                    }
                    else
                    {
                      $code = 4815;
                    }
                  }
                }
                else
                {
                  $code = 4814;
                }
              }
            }
            else
            {
              $code = -1;
            }
          }
          else
          {
            $code = 4812;
          }
        }
        $result = new Substance();
        $result -> code = $code;
        $result -> vars = $vars;
        $result -> param = $param;
      }
      else
      {
        $result = $checkFile;
      }
    }
    return $result;
  }

  public function __construct(DI $di, string $argGenre, $argNeedUploadId = true)
  {
    parent::__construct($di, $argGenre);
    $this -> needUploadId = $argNeedUploadId;
  }
}