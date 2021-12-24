<?php
namespace Jtbc;
use App\Common\Premium\PremiumAccountLoader;
use App\Common\Module\ModuleRecognizer;
use App\Common\Package\PackageRecognizer;
use App\Common\Maintenance\Downgrader;
use App\Common\Maintenance\Migrator\TaskScanner;
use App\Common\Maintenance\Migrator\ConfigReader;
use App\Common\Maintenance\Downgrader\KernelDowngrader;
use App\Common\Maintenance\Downgrader\PackageDowngrader;
use App\Common\Maintenance\Downgrader\ModuleDowngrader;
use App\Common\Maintenance\Downgrader\PluginDowngrader;
use App\Console\Common\Ambassador;
use App\Console\Log\Logger;
use App\Console\Cloud\Model;
use App\Universal\Plugin\PluginRecognizer;

class Diplomat extends Ambassador {
  public function confirm(Request $req)
  {
    $code = 0;
    $diff = null;
    $zipPath = strval($req -> get('zip_path'));
    $downgradeId = intval($req -> get('downgrade_id'));
    $downgradeType = strval($req -> get('downgrade_type'));
    $downgradeGenre = strval($req -> get('downgrade_genre'));
    $zipFullPath = Path::getActualRoute(ConfigReader::getBaseDir() . '/' . $zipPath);
    $premiumAccount = PremiumAccountLoader::getInstance();
    if ($premiumAccount -> isValidCertificate() && is_file($zipFullPath))
    {
      $code = 1;
      $taskScanner = new TaskScanner($zipFullPath);
      $diff = $taskScanner -> diff();
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> data = [
      'diff' => $diff,
      'id' => $downgradeId,
      'type' => $downgradeType,
      'genre' => $downgradeGenre,
      'zip_path' => $zipPath,
    ];
    return $ss -> toJSON();
  }

  public function actionDowngrade(Request $req)
  {
    $code = 0;
    $id = intval($req -> post('id'));
    $type = strval($req -> post('type'));
    $genre = strval($req -> post('genre'));
    $zipPath = strval($req -> post('zip_path'));
    $zipFullPath = Path::getActualRoute(ConfigReader::getBaseDir() . '/' . $zipPath);
    if (!is_file($zipFullPath))
    {
      $code = 4001;
    }
    else
    {
      $downgrader = null;
      if ($type == 'kernel')
      {
        $downgrader = new KernelDowngrader($zipFullPath, $req -> post());
      }
      else if ($type == 'package')
      {
        $packageRecognizer = new PackageRecognizer();
        $packageId = $packageRecognizer -> packageId;
        if (is_int($packageId))
        {
          $downgrader = new PackageDowngrader($zipFullPath, $req -> post(), $packageId);
        }
      }
      else if ($type == 'module')
      {
        $moduleRecognizer = new ModuleRecognizer($genre);
        $moduleId = $moduleRecognizer -> moduleId;
        if (is_int($moduleId))
        {
          $downgrader = new ModuleDowngrader($zipFullPath, $req -> post(), $moduleRecognizer);
        }
      }
      else if ($type == 'plugin')
      {
        $pluginRecognizer = new PluginRecognizer($genre);
        $pluginId = $pluginRecognizer -> pluginId;
        if (is_int($pluginId))
        {
          $downgrader = new PluginDowngrader($zipFullPath, $req -> post(), $pluginRecognizer);
        }
      }
      if ($downgrader instanceof Downgrader)
      {
        $model = new Model('migrate');
        $model -> where -> id = $id;
        $rs = $model -> get();
        if (!is_null($rs))
        {
          $downgrader -> setUpgradedAt(intval($rs -> timestamp));
          $downgraded = $downgrader -> downgrade();
          if ($downgraded === true)
          {
            $code = 1;
            $model -> pocket -> status = 1;
            $model -> save();
            $logModel = new Model('migrate');
            $logModel -> pocket = $downgrader -> getMigrateLog();
            $logModel -> save();
            switch($type)
            {
              case 'kernel':
                Logger::log($this, 'manageDowngrade.log-kernel-downgrade', ['zip_path' => $zipPath]);
                break;
              case 'package':
                Logger::log($this, 'manageDowngrade.log-package-downgrade', ['zip_path' => $zipPath]);
                break;
              case 'module':
                Logger::log($this, 'manageDowngrade.log-module-downgrade', ['zip_path' => $zipPath, 'genre' => $genre]);
                break;
              case 'plugin':
                Logger::log($this, 'manageDowngrade.log-plugin-downgrade', ['zip_path' => $zipPath, 'genre' => $genre]);
                break;
            }
          }
          else
          {
            $lastErrorCode = $downgrader -> getLastErrorCode();
            if ($lastErrorCode >= 2000)
            {
              $code = $lastErrorCode + 2100;
            }
            else if ($lastErrorCode >= 1000)
            {
              $code = $lastErrorCode + 3200;
            }
          }
        }
        else
        {
          $code = 4003;
        }
      }
      else
      {
        $code = 4002;
      }
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = Jtbc::take('manageDowngrade.text-action-downgrade-code-' . $code, 'lng');
    return $ss -> toJSON();
  }
}