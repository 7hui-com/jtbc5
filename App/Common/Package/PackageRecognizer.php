<?php
namespace App\Common\Package;
use Jtbc\Jtbc;
use Jtbc\Path;
use Jtbc\Validation;
use App\Common\Official\OfficialRSAEncrypter;
use App\Common\Premium\PremiumAccountLoader;

class PackageRecognizer
{
  private $packageId;
  private $packageVersion;
  private $packageTitle;
  private $packageSign;
  private $isValid;
  private $isPremium;

  private function isValidPackage()
  {
    $result = false;
    if ($this -> isFreePackageId())
    {
      $result = true;
    }
    else if ($this -> isPremium === true)
    {
      $result = true;
    }
    return $result;
  }

  private function isPremiumPackage()
  {
    $result = false;
    if (!Validation::isEmpty($this -> packageSign))
    {
      if (OfficialRSAEncrypter::publicVerify($this -> packagePremiumSign, $this -> packageSign))
      {
        $premiumAccount = PremiumAccountLoader::getInstance();
        if ($premiumAccount -> isValidCertificate())
        {
          $data = 'package:' . strval($this -> packageId);
          if ($premiumAccount -> certificate -> isValidPremiumSign($data, $this -> packagePremiumSign))
          {
            $result = true;
          }
        }
      }
    }
    return $result;
  }

  public function hasPackage()
  {
    return is_null(Jtbc::take('global.package.id', 'cfg'))? false: true;
  }

  public function isConfusing()
  {
    return ($this -> isPremium === false && $this -> isPremiumPackageId())? true: false;
  }

  public function isPremiumPackageId()
  {
    return $this -> packageId >= 700000? true: false;
  }

  public function isFreePackageId()
  {
    return ($this -> packageId >= 500000 && $this -> packageId < 700000)? true: false;
  }

  public function isUnknownPackageId()
  {
    return (!$this -> isFreePackageId() && !$this -> isPremiumPackageId())? true: false;
  }

  public function __get($argName)
  {
    $result = null;
    $name = $argName;
    if ($this -> isValid === true)
    {
      if ($name == 'isValid')
      {
        $result = true;
      }
      else if ($name == 'isPremium')
      {
        $result = $this -> isPremium;
      }
      else if ($name == 'packageId')
      {
        $result = $this -> packageId;
      }
      else if ($name == 'packageTitle')
      {
        $result = $this -> packageTitle;
      }
      else if ($name == 'packageVersion')
      {
        $result = $this -> packageVersion;
      }
    }
    else
    {
      if ($name == 'isValid')
      {
        $result = false;
      }
    }
    return $result;
  }

  public function __construct()
  {
    $this -> packageId = 0;
    $this -> packageVersion = 0;
    $this -> isValid = false;
    if (is_file(Path::getActualRoute('common/package.jtbc')))
    {
      $this -> packageId = intval(Jtbc::take('global.package.id', 'cfg'));
      $this -> packageVersion = intval(Jtbc::take('global.package.version', 'cfg'));
      $this -> packageTitle = strval(Jtbc::take('global.package.title', 'cfg'));
      $this -> packagePremiumSign = strval(Jtbc::take('global.package.premium-sign', 'cfg'));
      $this -> packageSign = strval(Jtbc::take('global.package.sign', 'cfg'));
      $this -> isValid = $this -> isValidPackage();
      $this -> isPremium = $this -> isPremiumPackage();
    }
  }
}