<?php
namespace Jtbc;
use App\Common\Premium\PremiumAccountLoader;
use App\Console\Common\Ambassador;
use App\Console\Cloud\CloudService\VersionDetector\KernelVersionDetector;
use App\Console\Cloud\CloudService\VersionDetector\PackageVersionDetector;

class Diplomat extends Ambassador {
  public function status(Request $req)
  {
    $code = 1;
    $status = 0;
    $attention = false;
    $codename = $this -> getParam('genre') . ':managePopup.create';
    $premiumAccount = PremiumAccountLoader::getInstance();
    if ($premiumAccount -> hasInfo)
    {
      $status = 1;
      if ($premiumAccount -> isValidCertificate())
      {
        $appId = $premiumAccount -> certificate -> getAppId();
        $appSecret = $premiumAccount -> certificate -> getAppSecret();
        $kernelVersionDetector = new KernelVersionDetector($appId, $appSecret);
        $packageVersionDetector = new PackageVersionDetector($appId, $appSecret);
        if ($kernelVersionDetector -> checkForNewVersion() || $packageVersionDetector -> checkForNewVersion())
        {
          $attention = true;
        }
      }
      $codename = $this -> getParam('genre') . ':managePopup.welcome';
    }
    $message = Jtbc::take('manageApi.text-status-' . $status, 'lng');
    if ($status == 1)
    {
      $message = Jtbc::take('manageApi.text-status-1-' . ($attention? 1: 0), 'lng');
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> data = [
      'status' => $status,
      'message' => $message,
      'attention' => $attention,
      'codename' => $codename,
    ];
    $result = $ss -> toJSON();
    return $result;
  }
}