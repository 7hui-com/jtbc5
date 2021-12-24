<?php
namespace Jtbc;
use App\Common\Premium\PremiumConfig;
use App\Common\Premium\PremiumAccountLoader;
use App\Common\Package\PackageRecognizer;
use App\Common\Official\OfficialCommunicator;
use App\Console\Common\Ambassador;
use App\Console\Cloud\CloudService\VersionDetector\KernelVersionDetector;
use App\Console\Cloud\CloudService\VersionDetector\PackageVersionDetector;

class Diplomat extends Ambassador {
  public function checkRemotePaymentStatus(Request $req)
  {
    $code = 0;
    $paymentType = strval($req -> get('payment_type'));
    $uniqueId = strval($req -> get('unique_id'));
    $uniqueSign = strval($req -> get('unique_sign'));
    $premiumConfig = new PremiumConfig();
    if (strlen($uniqueId) == 28 && Validation::isNumber($uniqueId))
    {
      if ($premiumConfig -> isWritable())
      {
        $serviceId = $paymentType == 'renew'? 'A0012': 'A0011';
        $officialCommunicator = new OfficialCommunicator();
        $officialCommunicator -> service_id = $serviceId;
        $officialCommunicator -> unique_id = $uniqueId;
        $officialCommunicator -> unique_sign = $uniqueSign;
        $apiResult = $officialCommunicator -> getApiResult();
        if (!is_null($apiResult))
        {
          if ($apiResult -> code == 1)
          {
            $config = new Substance($apiResult -> data);
            if ($premiumConfig -> set($config))
            {
              $code = 1;
            }
            else
            {
              $code = 4002;
            }
          }
          else
          {
            $code = 4001;
          }
        }
        else
        {
          $code = 4444;
        }
      }
    }
    $ss = new Substance();
    $ss -> code = $code;
    $result = $ss -> toJSON();
    return $result;
  }

  public function getCreateInfo(Request $req)
  {
    $code = 0;
    $data = [];
    $message = '';
    $premiumConfig = new PremiumConfig();
    if ($premiumConfig -> isWritable())
    {
      $officialCommunicator = new OfficialCommunicator();
      $officialCommunicator -> service_id = 'A0001';
      $officialCommunicator -> unique_id = Random::getNumeric28();
      $apiResult = $officialCommunicator -> getApiResult();
      if (!is_null($apiResult))
      {
        if ($apiResult -> code == 1)
        {
          $code = 1;
          $data = $apiResult -> data;
        }
        else
        {
          $code = 4001;
        }
      }
      else
      {
        $code = 4444;
        $message = Jtbc::take('::communal.text-cloudservice-code-4444', 'lng');
      }
    }
    else
    {
      $code = 4403;
      $message = $premiumConfig -> getRealPath();
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> data = $data;
    $ss -> message = Jtbc::take('managePopup.text-getCreateInfo-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }

  public function getRenewInfo(Request $req)
  {
    $code = 0;
    $data = [];
    $message = '';
    $premiumAccount = PremiumAccountLoader::getInstance();
    if ($premiumAccount -> isValidCertificate())
    {
      $premiumConfig = new PremiumConfig();
      if ($premiumConfig -> isWritable())
      {
        $appId = $premiumAccount -> certificate -> getAppId();
        $appSecret = $premiumAccount -> certificate -> getAppSecret();
        $officialCommunicator = new OfficialCommunicator($appId, $appSecret);
        $officialCommunicator -> service_id = 'A0002';
        $apiResult = $officialCommunicator -> getApiResult();
        if (!is_null($apiResult))
        {
          if ($apiResult -> code == 1)
          {
            $code = 1;
            $data = $apiResult -> data;
          }
          else
          {
            $code = 4002;
          }
        }
        else
        {
          $code = 4444;
          $message = Jtbc::take('::communal.text-cloudservice-code-4444', 'lng');
        }
      }
      else
      {
        $code = 4403;
        $message = $premiumConfig -> getRealPath();
      }
    }
    else
    {
      $code = 4001;
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> data = $data;
    $ss -> message = Jtbc::take('managePopup.text-getRenewInfo-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }

  public function welcome(Request $req)
  {
    $code = 1;
    $status = 1;
    $appId = 0;
    $expiredDate = '';
    $version = null;
    $versionNumber = null;
    $newVersion = null;
    $premiumAccount = PremiumAccountLoader::getInstance();
    if ($premiumAccount -> isValidCertificate())
    {
      $appId = $premiumAccount -> certificate -> getAppId();
      $appSecret = $premiumAccount -> certificate -> getAppSecret();
      $expiredDate = Date::formatTimestamp($premiumAccount -> certificate -> getExpiredAt(), 1);
      if ($premiumAccount -> certificate -> isExpired())
      {
        $status = 2;
      }
      else
      {
        $kernelVersionDetector = new KernelVersionDetector($appId, $appSecret);
        $packageVersionDetector = new PackageVersionDetector($appId, $appSecret);
        if ($kernelVersionDetector -> checkForNewVersion() === true)
        {
          $status = 100;
          $versionNumber = Kernel::getVersion();
          $version = Converter::convertToVersionString($versionNumber);
          $newVersion = Converter::convertToVersionString($kernelVersionDetector -> getNewVersion());
        }
        else if ($packageVersionDetector -> checkForNewVersion() === true)
        {
          $status = 101;
          $packageRecognizer = new PackageRecognizer();
          $versionNumber = $packageRecognizer -> packageVersion ?? 1000;
          $version = Converter::convertToVersionString($versionNumber);
          $newVersion = Converter::convertToVersionString($packageVersionDetector -> getNewVersion());
        }
        else
        {
          $status = 200;
        }
      }
    }
    $data = [
      'status' => $status,
      'app_id' => $appId,
      'expired_date' => $expiredDate,
      'version' => $version,
      'new_version' => $newVersion,
    ];
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> data = $data;
    $result = $ss -> toJSON();
    return $result;
  }
}