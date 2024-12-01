<?php
namespace App\Common\Module;
use Jtbc\Jtbc;
use Jtbc\Path;
use Jtbc\Validation;
use App\Common\Official\OfficialRSAEncrypter;
use App\Common\Premium\PremiumAccountLoader;

class ModuleRecognizer
{
  private $genre;
  private $moduleId;
  private $moduleVersion;
  private $modulePremiumSign;
  private $moduleSign;
  private $isPremium;

  private function isPremiumModule()
  {
    $result = false;
    if (!Validation::isEmpty($this -> moduleSign))
    {
      if (OfficialRSAEncrypter::publicVerify($this -> modulePremiumSign, $this -> moduleSign))
      {
        $premiumAccount = PremiumAccountLoader::getInstance();
        if ($premiumAccount -> isValidCertificate())
        {
          $data = 'module:' . strval($this -> moduleId);
          if ($premiumAccount -> certificate -> isValidPremiumSign($data, $this -> modulePremiumSign))
          {
            $result = true;
          }
        }
      }
    }
    return $result;
  }

  public function isConfusing()
  {
    return ($this -> isPremium === false && $this -> isPremiumModuleId())? true: false;
  }

  public function isPremiumModuleId()
  {
    return $this -> moduleId >= 200000? true: false;
  }

  public function isFreeModuleId()
  {
    return ($this -> moduleId >= 100000 && $this -> moduleId < 200000)? true: false;
  }

  public function isUnknownModuleId()
  {
    return (!$this -> isFreeModuleId() && !$this -> isPremiumModuleId())? true: false;
  }

  public function __get($argName)
  {
    $result = null;
    $name = $argName;
    if ($name == 'isPremium')
    {
      $result = $this -> isPremium;
    }
    else if ($name == 'genre')
    {
      $result = $this -> genre;
    }
    else if ($name == 'moduleId')
    {
      $result = $this -> moduleId;
    }
    else if ($name == 'moduleVersion')
    {
      $result = $this -> moduleVersion;
    }
    return $result;
  }

  public function __construct(?string $argGenre = null)
  {
    $this -> moduleId = 0;
    $this -> moduleVersion = 0;
    $this -> isPremium = false;
    $this -> genre = $argGenre ?? Path::getCurrentGenre();
    if (is_file(Path::getActualRoute($this -> genre) . '/common/module.jtbc'))
    {
      $this -> moduleId = intval(Jtbc::take('global.' . $this -> genre . ':module.id', 'cfg'));
      $this -> moduleVersion = intval(Jtbc::take('global.' . $this -> genre . ':module.version', 'cfg'));
      $this -> modulePremiumSign = strval(Jtbc::take('global.' . $this -> genre . ':module.premium-sign', 'cfg'));
      $this -> moduleSign = strval(Jtbc::take('global.' . $this -> genre . ':module.sign', 'cfg'));
      $this -> isPremium = $this -> isPremiumModule();
    }
  }
}