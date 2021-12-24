<?php
namespace App\Common\Premium;
use Exception;

class PremiumAccount
{
  private $certificate;
  private $accountInfo;
  private $hasInfo;
  private $lastErrorCode;
  private $lastErrorMessage;

  public function getAppId()
  {
    return is_null($this -> accountInfo)? null: $this -> accountInfo -> appid;
  }

  public function getCertificate()
  {
    return is_null($this -> accountInfo)? null: $this -> accountInfo -> certificate;
  }

  public function getLastErrorCode()
  {
    return $this -> lastErrorCode;
  }

  public function getLastErrorMessage()
  {
    return $this -> lastErrorMessage;
  }

  public function isValidCertificate()
  {
    return is_null($this -> certificate)? false: true;
  }

  public function __get($argName)
  {
    $result = null;
    $name = $argName;
    if ($name == 'certificate')
    {
      $result = $this -> certificate;
    }
    else if ($name == 'hasInfo')
    {
      $result = $this -> hasInfo;
    }
    return $result;
  }

  public function __construct()
  {
    $this -> hasInfo = false;
    $this -> accountInfo = null;
    $this -> certificate = null;
    $premiumConfig = new PremiumConfig();
    $accountInfo = $premiumConfig -> get();
    if (is_int($accountInfo -> appid) && is_string($accountInfo -> certificate) && is_int($accountInfo -> created_at) && is_int($accountInfo -> updated_at))
    {
      $this -> hasInfo = true;
      $this -> accountInfo = $accountInfo;
    }
    if (!is_null($this -> accountInfo))
    {
      try
      {
        $this -> certificate = new CertificateParser($this -> getCertificate());
        if ($this -> accountInfo -> appid !== $this -> certificate -> getAppId())
        {
          $this -> certificate = null;
        }
      }
      catch(Exception $e)
      {
        $this -> certificate = null;
        $this -> lastErrorCode = $e -> getCode();
        $this -> lastErrorMessage = $e -> getMessage();
      }
    }
  }
}