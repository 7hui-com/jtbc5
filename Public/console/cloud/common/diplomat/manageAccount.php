<?php
namespace Jtbc;
use ZipArchive;
use App\Common\Premium\PremiumAccountLoader;
use App\Common\Official\OfficialCommunicator;
use App\Console\Common\Ambassador;
use App\Console\Common\EmptySubstance;
use App\Console\Log\Logger;

class Diplomat extends Ambassador {
  public function modify()
  {
    $status = 0;
    $appId = null;
    $info = new Substance();
    $premiumAccount = PremiumAccountLoader::getInstance();
    if ($premiumAccount -> isValidCertificate())
    {
      $appId = $premiumAccount -> certificate -> getAppId();
      $appSecret = $premiumAccount -> certificate -> getAppSecret();
      $officialCommunicator = new OfficialCommunicator($appId, $appSecret);
      $officialCommunicator -> service_id = 'Z0001';
      $apiResult = $officialCommunicator -> getApiResult();
      if (!is_null($apiResult))
      {
        if ($apiResult -> code == 1)
        {
          $status = 1;
          $apiResultInfo = new Substance($apiResult -> info);
          $info -> name = strval($apiResultInfo -> name);
          $info -> mobile = strval($apiResultInfo -> mobile);
          $info -> idcard = strval($apiResultInfo -> idcard);
        }
        else
        {
          $status = 4002;
        }
      }
      else
      {
        $status = 4444;
      }
    }
    else
    {
      $status = 4001;
    }
    $es = new EmptySubstance();
    $es -> data -> status = $status;
    $es -> data -> info = $info;
    $es -> data -> app_id = $appId;
    return $es -> toJSON();
  }

  public function actionDownload(Request $req)
  {
    if ($this -> guard -> role -> isSuper)
    {
      $this -> MIMEType = 'zip';
      $zip = new ZipArchive();
      $zipPath = Path::getActualRoute(Path::getRuntimeDirectory('CloudService/PremiumConfig.zip'));
      $zipOpened = $zip -> open($zipPath, ZipArchive::CREATE);
      if ($zipOpened === true)
      {
        $configPath = 'Config/App/Common/Premium/PremiumConfig.php';
        $readmeFilename = Jtbc::take('manageAccount.text-download-readme-filename', 'lng');
        $readmeContent = Jtbc::take('manageAccount.text-download-readme-content', 'lng');
        $zip -> addFromString($readmeFilename, $readmeContent);
        $zip -> addFromString($configPath, file_get_contents(Path::getActualRoute('../' . $configPath)));
        $zip -> close();
        Logger::log($this, 'manageAccount.log-download');
        return file_get_contents($zipPath);
      }
    }
  }

  public function actionModify(Request $req)
  {
    $code = 0;
    $message = '';
    $validator = new Validator($req -> post());
    if (!$validator -> name -> isEmpty() && !$validator -> name -> isName())
    {
      $code = 4011;
    }
    else if (!$validator -> mobile -> isEmpty() && !$validator -> mobile -> isMobile())
    {
      $code = 4012;
    }
    else if (!$validator -> idcard -> isEmpty() && !$validator -> idcard -> isIDCard())
    {
      $code = 4013;
    }
    else if (!$validator -> company_website -> isEmpty() && !$validator -> company_website -> isURL())
    {
      $code = 4015;
    }
    else
    {
      $premiumAccount = PremiumAccountLoader::getInstance();
      if ($premiumAccount -> isValidCertificate())
      {
        $appId = $premiumAccount -> certificate -> getAppId();
        $appSecret = $premiumAccount -> certificate -> getAppSecret();
        $officialCommunicator = new OfficialCommunicator($appId, $appSecret);
        $officialCommunicator -> service_id = 'Z0002';
        $officialCommunicator -> name = $validator -> name -> value();
        $officialCommunicator -> mobile = $validator -> mobile -> value();
        $officialCommunicator -> idcard = $validator -> idcard -> value();
        $apiResult = $officialCommunicator -> getApiResult();
        if (!is_null($apiResult))
        {
          if ($apiResult -> code == 1)
          {
            $code = 1;
            Logger::log($this, 'manageAccount.log-modify');
          }
          else
          {
            $code = 4002;
            $message = $apiResult -> message;
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
        $code = 4001;
      }
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = Jtbc::take('manageAccount.text-modify-code-' . $code, 'lng') ?: $message;
    return $ss -> toJSON();
  }
}