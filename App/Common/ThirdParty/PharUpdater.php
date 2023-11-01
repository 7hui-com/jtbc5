<?php
namespace App\Common\ThirdParty;
use ZipArchive;
use Jtbc\Path;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\Phar\PharLoader;
use Jtbc\HTTP\SimpleCURL;
use Jtbc\Exception\NotSupportedException;
use Jtbc\Exception\PermissionDeniedException;
use App\Common\Premium\PremiumAccountLoader;
use App\Common\Official\OfficialCommunicator;

class PharUpdater
{
  private $phars;
  private $officialCommunicator;
  private $thirdPartyFolderPath;
  private $lastErrorCode = 0;

  private function getUpdateablePhars()
  {
    $result = null;
    if (!$this -> phars -> isEmpty())
    {
      $officialCommunicator = $this -> officialCommunicator;
      $officialCommunicator -> service_id = 'P0001';
      $officialCommunicator -> phars = $this -> phars -> toJSON();
      $apiResult = $officialCommunicator -> getApiResult();
      if (!is_null($apiResult))
      {
        if ($apiResult -> code == 1)
        {
          $result = new Substance($apiResult -> data);
        }
        else
        {
          $this -> lastErrorCode = 1002;
        }
      }
      else
      {
        $this -> lastErrorCode = 1001;
      }
    }
    return $result;
  }

  private function isCoverable()
  {
    $result = null;
    if (!$this -> phars -> isEmpty())
    {
      $pharFolderPath = PharLoader::getFolderPath();
      $thirdPartyFolderPath = $this -> thirdPartyFolderPath;
      if ((!is_dir($thirdPartyFolderPath) && !@mkdir($thirdPartyFolderPath, 0777, true)) || !is_writable($thirdPartyFolderPath))
      {
        $result = false;
      }
      else
      {
        if (!is_writable($pharFolderPath))
        {
          $result = false;
        }
        else
        {
          $result = true;
          foreach ($this -> phars as $key => $value)
          {
            $currentPharFullPath = PharLoader::getPharFullPath($key);
            if (is_file($currentPharFullPath) && !is_writable($currentPharFullPath))
            {
              $result = false;
              break;
            }
          }
        }
      }
    }
    return $result;
  }

  public function update()
  {
    $result = null;
    if ($this -> phars -> isEmpty())
    {
      $this -> lastErrorCode = 1011;
    }
    else if ($this -> isCoverable() !== true)
    {
      $this -> lastErrorCode = 1012;
    }
    else
    {
      $updateablePhars = $this -> getUpdateablePhars();
      if ($updateablePhars instanceof Substance)
      {
        $result = true;
        foreach ($updateablePhars as $updateablePhar)
        {
          $currentPhar = new Substance($updateablePhar);
          $simpleCURL = new SimpleCURL($currentPhar -> download_url, 120);
          $curlResult = $simpleCURL -> get();
          if ($curlResult -> is_succeed)
          {
            $targetZipPath = $this -> thirdPartyFolderPath . '/' . $currentPhar -> name . '.zip';
            if (@file_put_contents($targetZipPath, $curlResult -> content))
            {
              $zipArchive = new ZipArchive();
              $opened = $zipArchive -> open($targetZipPath);
              if ($opened === true)
              {
                $extracted = $zipArchive -> extractTo(PharLoader::getFolderPath());
                if ($extracted !== true)
                {
                  $result = false;
                  $this -> lastErrorCode = 1051;
                  break;
                }
              }
              else
              {
                $result = false;
                $this -> lastErrorCode = 1041;
                break;
              }
              $zipArchive -> close();
              @unlink($targetZipPath);
            }
            else
            {
              $result = false;
              $this -> lastErrorCode = 1031;
              break;
            }
          }
          else
          {
            $result = false;
            $this -> lastErrorCode = 1021;
            break;
          }
        }
      }
    }
    return $result;
  }

  public function add($argPharName)
  {
    $result = false;
    $pharName = $argPharName;
    if (!is_string($pharName) || !Validation::isNatural($pharName))
    {
      throw new NotSupportedException('Phar\'s name "' . $pharName . '" is not supported', 50415);
    }
    else
    {
      if (!$this -> phars -> exists($pharName))
      {
        $result = true;
        $info = new Substance();
        $info -> current_hash = PharLoader::isExists($pharName)? md5_file(PharLoader::getPharFullPath($pharName)): null;
        $this -> phars[$pharName] = $info -> toArray();
      }
      else
      {
        $result = null;
      }
    }
    return $result;
  }

  public function remove($argPharName)
  {
    $result = false;
    $pharName = $argPharName;
    if ($this -> phars -> exists($pharName))
    {
      $result = true;
      $this -> phars -> offsetUnset($pharName);
    }
    return $result;
  }

  public function getLastErrorCode()
  {
    return $this -> lastErrorCode;
  }

  public function __construct(array $argPharNames = [])
  {
    $pharNames = $argPharNames;
    $this -> phars = new Substance();
    $premiumAccount = PremiumAccountLoader::getInstance();
    if ($premiumAccount -> isValidCertificate())
    {
      $appId = $premiumAccount -> certificate -> getAppId();
      $appSecret = $premiumAccount -> certificate -> getAppSecret();
      if (!empty($pharNames) && Validation::isArrayList($pharNames))
      {
        foreach ($pharNames as $pharName)
        {
          $this -> add($pharName);
        }
      }
      $this -> officialCommunicator = new OfficialCommunicator($appId, $appSecret);
      $this -> thirdPartyFolderPath = Path::getActualRoute(Path::getRuntimeDirectory('ThirdParty'));
    }
    else
    {
      throw new PermissionDeniedException('Permission denied', 50403);
    }
  }
}