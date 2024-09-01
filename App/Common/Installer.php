<?php
namespace App\Common;
use ZipArchive;
use DirectoryIterator;
use Jtbc\JSON;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\Jtbc\JtbcWriter;
use App\Common\ThirdParty\PharUpdater;

abstract class Installer
{
  protected $dbLink;
  protected $sign;
  protected $premiumSign;
  protected $zipFilePath;
  protected $lastErrorCode = 0;
  protected $fileNodeName = 'zh-cn';

  protected function clean(string $argWorkPath)
  {
    $result = true;
    $workPath = $argWorkPath;
    if (!is_dir($workPath))
    {
      $result = false;
    }
    else
    {
      $dirIterator = new DirectoryIterator($workPath);
      foreach ($dirIterator as $item)
      {
        if (!$item -> isDot() && $item -> isFile())
        {
          $filename = $item -> getFilename();
          if ($filename == 'meta.json' || str_starts_with($filename, '_'))
          {
            if (!@unlink($item -> getPathname()))
            {
              $result = false;
            }
          }
        }
      }
    }
    return $result;
  }

  protected function writePremiumSignToFile(string $argFilePath)
  {
    $result = null;
    $filePath = $argFilePath;
    if (is_file($filePath))
    {
      if (!is_null($this -> sign) && !is_null($this -> premiumSign))
      {
        $changedSign = JtbcWriter::putNodeContent($filePath, 'cfg', 'sign', $this -> sign, $this -> fileNodeName);
        $changedPremiumSign = JtbcWriter::putNodeContent($filePath, 'cfg', 'premium-sign', $this -> premiumSign, $this -> fileNodeName);
        if ($changedSign === true && $changedPremiumSign === true)
        {
          $result = true;
        }
        else
        {
          $result = false;
        }
      }
    }
    return $result;
  }

  public function getLastErrorCode()
  {
    return $this -> lastErrorCode;
  }

  public function getMetaData(ZipArchive $zipArchive)
  {
    $data = [];
    $content = $zipArchive -> getFromName('meta.json');
    if (is_string($content))
    {
      if (Validation::isJSON($content))
      {
        $data = JSON::decode($content);
      }
    }
    return new Substance($data);
  }

  public function setPremiumSign(string $argSign, string $argPremiumSign)
  {
    $this -> sign = $argSign;
    $this -> premiumSign = $argPremiumSign;
  }

  public function updatePhars(Substance $meta)
  {
    $result = false;
    $pharNames = $meta -> update_phars;
    if (!is_array($pharNames) || empty($pharNames))
    {
      $result = true;
    }
    else
    {
      $pharUpdater = new PharUpdater($pharNames);
      $result = $pharUpdater -> update()? true: false;
    }
    return $result;
  }

  public function __construct(string $argZipFilePath, $argDBLink = null)
  {
    $this -> zipFilePath = $argZipFilePath;
    $this -> dbLink = $argDBLink;
  }
}