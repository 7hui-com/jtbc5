<?php
namespace Jtbc;
use Jtbc\String\StringHelper;
use Jtbc\Module\ModuleFinder;
use App\Common\Premium\PremiumAccountLoader;
use App\Common\Module\ModuleRecognizer;
use App\Common\Package\PackageRecognizer;
use App\Common\Maintenance\Migrator\TaskScanner;
use App\Common\Maintenance\Migrator\RefittedZipGenerator;
use App\Common\Maintenance\Migrator\ConfigReader;
use App\Common\Maintenance\Upgrader\KernelUpgrader;
use App\Common\Maintenance\Upgrader\PackageUpgrader;
use App\Common\Maintenance\Upgrader\ModuleUpgrader;
use App\Common\Maintenance\Upgrader\PluginUpgrader;
use App\Console\Common\Ambassador;
use App\Console\Log\Logger;
use App\Console\Cloud\Model;
use App\Console\Cloud\CloudService\Patch\KernelPatchDownloader;
use App\Console\Cloud\CloudService\Patch\PackagePatchDownloader;
use App\Console\Cloud\CloudService\Patch\ModulePatchDownloader;
use App\Console\Cloud\CloudService\Patch\PluginPatchDownloader;
use App\Console\Cloud\CloudService\VersionDetector\KernelVersionDetector;
use App\Console\Cloud\CloudService\VersionDetector\PackageVersionDetector;
use App\Console\Cloud\CloudService\VersionDetector\ModuleVersionDetector;
use App\Console\Cloud\CloudService\VersionDetector\PluginVersionDetector;
use App\Universal\Plugin\Plugin;
use App\Universal\Plugin\PluginFinder;
use App\Universal\Plugin\PluginRecognizer;
use Config\App\Common\Maintenance\Migrator as Config;

class Diplomat extends Ambassador {
  public function kernel(Request $req)
  {
    $code = 0;
    $newVersion = strval($req -> get('new_version'));
    $premiumAccount = PremiumAccountLoader::getInstance();
    if ($premiumAccount -> isValidCertificate())
    {
      $code = 1;
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> data = [
      'new_version' => $newVersion,
    ];
    return $ss -> toJSON();
  }

  public function package(Request $req)
  {
    $code = 0;
    $status = 1;
    $newVersion = strval($req -> get('new_version'));
    $premiumAccount = PremiumAccountLoader::getInstance();
    if ($premiumAccount -> isValidCertificate())
    {
      $code = 1;
      $packageRecognizer = new PackageRecognizer();
      if (!$packageRecognizer -> isValid)
      {
        $status = 100;
      }
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> data = [
      'status' => $status,
      'new_version' => $newVersion,
    ];
    return $ss -> toJSON();
  }

  public function module(Request $req)
  {
    $code = 0;
    $data = [];
    $genre = strval($req -> get('genre'));
    $path = [['title' => '/', 'genre' => '']];
    $premiumAccount = PremiumAccountLoader::getInstance();
    if ($premiumAccount -> isValidCertificate())
    {
      $code = 1;
      $module = new Module($genre);
      $childGenreList = $module -> getChildGenreList();
      $parentGenreList = $module -> getParentGenreList(true);
      foreach ($childGenreList as $childGenre)
      {
        $item = new Substance();
        $childModule = new Module($childGenre);
        $moduleRecognizer = new ModuleRecognizer($childGenre);
        $moduleVersion = $moduleRecognizer -> moduleVersion;
        if (!$moduleRecognizer -> isConfusing())
        {
          $item -> name = $childModule -> getName();
          $item -> folder_name = $childModule -> getFolderName();
          $item -> title = $childModule -> getTitle(false);
          $item -> icon = $childModule -> guide -> icon;
          $item -> module_version = Converter::convertToVersionString($moduleVersion);
          $item -> isParentModule = $childModule -> isParentModule;
          $data[] = $item;
        }
      }
      foreach ($parentGenreList as $parentGenre)
      {
        if (!Validation::isEmpty($parentGenre))
        {
          $parentModule = new Module($parentGenre);
          $path[] = ['title' => $parentModule -> getFolderName() . '/', 'genre' => $parentModule -> getName()];
        }
      }
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> data = [
      'data' => $data,
      'path' => $path,
    ];
    return $ss -> toJSON();
  }

  public function plugin(Request $req)
  {
    $code = 1;
    $data = [];
    $pluginFinder = new PluginFinder();
    $plugins = $pluginFinder -> getPlugins();
    foreach ($plugins as $plugin)
    {
      $item = new Plugin($plugin);
      $data[] = [
        'name' => $item -> getName(),
        'title' => $item -> getTitle(),
        'intro' => $item -> getIntro(),
        'icon' => $item -> getIcon(),
        'genre' => $item -> getGenre(),
        'plugin_version' => Converter::convertToVersionString($item -> getVersion()),
      ];
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> data = [
      'data' => $data,
    ];
    return $ss -> toJSON();
  }

  public function kernelConfirm(Request $req)
  {
    $code = 0;
    $diff = null;
    $newVersion = null;
    $zipPath = strval($req -> get('zip_path'));
    $zipFullPath = Path::getActualRoute(ConfigReader::getBaseDir() . '/' . $zipPath);
    $premiumAccount = PremiumAccountLoader::getInstance();
    if ($premiumAccount -> isValidCertificate() && is_file($zipFullPath))
    {
      $code = 1;
      $taskScanner = new TaskScanner($zipFullPath);
      $diff = $taskScanner -> diff();
      $newVersion = Converter::convertToVersionString($taskScanner -> getMetaTargetVersion());
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> data = [
      'diff' => $diff,
      'new_version' => $newVersion,
      'genre' => null,
      'zip_path' => $zipPath,
    ];
    return $ss -> toJSON();
  }

  public function packageConfirm(Request $req)
  {
    $code = 0;
    $diff = null;
    $newVersion = null;
    $zipPath = strval($req -> get('zip_path'));
    $zipFullPath = Path::getActualRoute(ConfigReader::getBaseDir() . '/' . $zipPath);
    $premiumAccount = PremiumAccountLoader::getInstance();
    if ($premiumAccount -> isValidCertificate() && is_file($zipFullPath))
    {
      $code = 1;
      $taskScanner = new TaskScanner($zipFullPath);
      $diff = $taskScanner -> diff();
      $newVersion = Converter::convertToVersionString($taskScanner -> getMetaTargetVersion());
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> data = [
      'diff' => $diff,
      'new_version' => $newVersion,
      'genre' => null,
      'zip_path' => $zipPath,
    ];
    return $ss -> toJSON();
  }

  public function moduleConfirm(Request $req)
  {
    $code = 0;
    $diff = null;
    $newVersion = null;
    $genre = strval($req -> get('genre'));
    $zipPath = strval($req -> get('zip_path'));
    $zipFullPath = Path::getActualRoute(ConfigReader::getBaseDir() . '/' . $zipPath);
    $premiumAccount = PremiumAccountLoader::getInstance();
    if ($premiumAccount -> isValidCertificate() && is_file($zipFullPath))
    {
      $code = 1;
      $taskScanner = new TaskScanner($zipFullPath);
      $diff = $taskScanner -> diff();
      $newVersion = Converter::convertToVersionString($taskScanner -> getMetaTargetVersion());
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> data = [
      'diff' => $diff,
      'new_version' => $newVersion,
      'genre' => $genre,
      'zip_path' => $zipPath,
    ];
    return $ss -> toJSON();
  }

  public function pluginConfirm(Request $req)
  {
    $code = 0;
    $diff = null;
    $newVersion = null;
    $genre = strval($req -> get('genre'));
    $zipPath = strval($req -> get('zip_path'));
    $zipFullPath = Path::getActualRoute(ConfigReader::getBaseDir() . '/' . $zipPath);
    $premiumAccount = PremiumAccountLoader::getInstance();
    if ($premiumAccount -> isValidCertificate() && is_file($zipFullPath))
    {
      $code = 1;
      $taskScanner = new TaskScanner($zipFullPath);
      $diff = $taskScanner -> diff();
      $newVersion = Converter::convertToVersionString($taskScanner -> getMetaTargetVersion());
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> data = [
      'diff' => $diff,
      'new_version' => $newVersion,
      'genre' => $genre,
      'zip_path' => $zipPath,
    ];
    return $ss -> toJSON();
  }

  public function detectModuleVersion(Request $req)
  {
    $code = 0;
    $status = 0;
    $newVersion = null;
    $genre = strval($req -> get('genre'));
    $premiumAccount = PremiumAccountLoader::getInstance();
    if ($premiumAccount -> isValidCertificate())
    {
      $code = 1;
      $appId = $premiumAccount -> certificate -> getAppId();
      $appSecret = $premiumAccount -> certificate -> getAppSecret();
      if (!Validation::isEmpty($genre))
      {
        $status = 1;
        $moduleVersionDetector = new ModuleVersionDetector($appId, $appSecret, $genre);
        $cloudServerNewVersion = $moduleVersionDetector -> getNewVersionFromCloudServer();
        if (is_int($cloudServerNewVersion))
        {
          $status = 200;
          $newVersion = Converter::convertToVersionString($cloudServerNewVersion);
        }
      }
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> status = $status;
    $ss -> new_version = $newVersion;
    return $ss -> toJSON();
  }

  public function detectPluginVersion(Request $req)
  {
    $code = 0;
    $status = 0;
    $newVersion = null;
    $genre = strval($req -> get('genre'));
    $premiumAccount = PremiumAccountLoader::getInstance();
    if ($premiumAccount -> isValidCertificate())
    {
      $code = 1;
      $appId = $premiumAccount -> certificate -> getAppId();
      $appSecret = $premiumAccount -> certificate -> getAppSecret();
      if (!Validation::isEmpty($genre))
      {
        $status = 1;
        $pluginVersionDetector = new PluginVersionDetector($appId, $appSecret, $genre);
        $cloudServerNewVersion = $pluginVersionDetector -> getNewVersionFromCloudServer();
        if (is_int($cloudServerNewVersion))
        {
          $status = 200;
          $newVersion = Converter::convertToVersionString($cloudServerNewVersion);
        }
      }
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> status = $status;
    $ss -> new_version = $newVersion;
    return $ss -> toJSON();
  }

  public function downloadKernelPatch()
  {
    $message = '';
    $zipPath = '';
    $kernelPatchDownloader = new KernelPatchDownloader(Kernel::getVersion());
    $downloaded = $kernelPatchDownloader -> download();
    $code = $downloaded -> code;
    if ($code === 1)
    {
      $zipPath = $downloaded -> zip_path;
    }
    else if ($code === 4444)
    {
      $message = Jtbc::take('::communal.text-cloudservice-code-4444', 'lng');
    }
    else
    {
      $message = Jtbc::take('manageUpgrade.text-download-code-' . $code, 'lng');
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = $message;
    $ss -> zip_path = $zipPath;
    return $ss -> toJSON();
  }

  public function downloadPackagePatch()
  {
    $code = 0;
    $zipPath = '';
    $packageRecognizer = new PackageRecognizer();
    $packageId = $packageRecognizer -> packageId;
    if (is_int($packageId))
    {
      $packagePatchDownloader = new PackagePatchDownloader($packageId, $packageRecognizer -> packageVersion);
      $downloaded = $packagePatchDownloader -> download();
      $code = $downloaded -> code;
      if ($code === 1)
      {
        $zipPath = $downloaded -> zip_path;
      }
    }
    else
    {
      $code = 4404;
    }
    $message = $code === 4444? Jtbc::take('::communal.text-cloudservice-code-4444', 'lng'): Jtbc::take('manageUpgrade.text-download-code-' . $code, 'lng');
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = $message;
    $ss -> zip_path = $zipPath;
    return $ss -> toJSON();
  }

  public function downloadModulePatch(Request $req)
  {
    $code = 0;
    $zipPath = '';
    $genre = strval($req -> get('genre'));
    $moduleRecognizer = new ModuleRecognizer($genre);
    $moduleId = $moduleRecognizer -> moduleId;
    if (is_int($moduleId))
    {
      $modulePatchDownloader = new ModulePatchDownloader($moduleId, $moduleRecognizer -> moduleVersion);
      $downloaded = $modulePatchDownloader -> download();
      $downloadedCode = $downloaded -> code;
      if ($downloadedCode === 1)
      {
        $originalZipPath = $downloaded -> zip_path;
        $currentBaseDir = Path::getActualRoute(ConfigReader::getBaseDir() . '/');
        $originalZipFullPath = $currentBaseDir . $originalZipPath;
        $refittedZipGenerator = new RefittedZipGenerator($originalZipFullPath);
        if ($refittedZipGenerator -> generate($genre) === true)
        {
          $code = 1;
          $refittedTaskFilePath = $refittedZipGenerator -> getRefittedTaskFilePath();
          $zipPath = StringHelper::getClipedString($refittedTaskFilePath, $currentBaseDir, 'right+');
        }
        else
        {
          $code = 4403;
        }
      }
      else
      {
        $code = $downloadedCode;
      }
    }
    else
    {
      $code = 4404;
    }
    $message = $code === 4444? Jtbc::take('::communal.text-cloudservice-code-4444', 'lng'): Jtbc::take('manageUpgrade.text-download-code-' . $code, 'lng');
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = $message;
    $ss -> zip_path = $zipPath;
    return $ss -> toJSON();
  }

  public function downloadPluginPatch(Request $req)
  {
    $code = 0;
    $zipPath = '';
    $genre = strval($req -> get('genre'));
    $pluginRecognizer = new PluginRecognizer($genre);
    $pluginId = $pluginRecognizer -> pluginId;
    if (is_int($pluginId))
    {
      $pluginPatchDownloader = new PluginPatchDownloader($pluginId, $pluginRecognizer -> pluginVersion);
      $downloaded = $pluginPatchDownloader -> download();
      $code = $downloaded -> code;
      if ($code === 1)
      {
        $zipPath = $downloaded -> zip_path;
      }
    }
    else
    {
      $code = 4404;
    }
    $message = $code === 4444? Jtbc::take('::communal.text-cloudservice-code-4444', 'lng'): Jtbc::take('manageUpgrade.text-download-code-' . $code, 'lng');
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = $message;
    $ss -> zip_path = $zipPath;
    return $ss -> toJSON();
  }

  public function actionKernelUpgrade(Request $req)
  {
    $code = 0;
    $zipPath = strval($req -> post('zip_path'));
    $zipFullPath = Path::getActualRoute(ConfigReader::getBaseDir() . '/' . $zipPath);
    if (!is_file($zipFullPath))
    {
      $code = 4001;
    }
    else
    {
      $upgrader = new KernelUpgrader($zipFullPath, $req -> post());
      $upgraded = $upgrader -> upgrade();
      if ($upgraded === true)
      {
        $code = 1;
        $premiumAccount = PremiumAccountLoader::getInstance();
        if ($premiumAccount -> isValidCertificate())
        {
          $appId = $premiumAccount -> certificate -> getAppId();
          $appSecret = $premiumAccount -> certificate -> getAppSecret();
          $kernelVersionDetector = new KernelVersionDetector($appId, $appSecret);
          $kernelVersionDetector -> reset();
        }
        $logModel = new Model('migrate');
        $logModel -> pocket = $upgrader -> getMigrateLog();
        $logModel -> save();
        Logger::log($this, 'manageUpgrade.log-kernel-upgrade', ['zip_path' => $zipPath]);
      }
      else
      {
        $lastErrorCode = $upgrader -> getLastErrorCode();
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
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = Jtbc::take('manageUpgrade.text-action-upgrade-code-' . $code, 'lng');
    return $ss -> toJSON();
  }

  public function actionPackageUpgrade(Request $req)
  {
    $code = 0;
    $zipPath = strval($req -> post('zip_path'));
    $zipFullPath = Path::getActualRoute(ConfigReader::getBaseDir() . '/' . $zipPath);
    if (!is_file($zipFullPath))
    {
      $code = 4001;
    }
    else
    {
      $packageRecognizer = new PackageRecognizer();
      $packageId = $packageRecognizer -> packageId;
      if (is_int($packageId))
      {
        $upgrader = new PackageUpgrader($zipFullPath, $req -> post(), $packageId);
        $upgraded = $upgrader -> upgrade();
        if ($upgraded === true)
        {
          $code = 1;
          $premiumAccount = PremiumAccountLoader::getInstance();
          if ($premiumAccount -> isValidCertificate())
          {
            $appId = $premiumAccount -> certificate -> getAppId();
            $appSecret = $premiumAccount -> certificate -> getAppSecret();
            $packageVersionDetector = new PackageVersionDetector($appId, $appSecret);
            $packageVersionDetector -> reset();
          }
          $logModel = new Model('migrate');
          $logModel -> pocket = $upgrader -> getMigrateLog();
          $logModel -> save();
          Logger::log($this, 'manageUpgrade.log-package-upgrade', ['zip_path' => $zipPath]);
        }
        else
        {
          $lastErrorCode = $upgrader -> getLastErrorCode();
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
        $code = 4002;
      }
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = Jtbc::take('manageUpgrade.text-action-upgrade-code-' . $code, 'lng');
    return $ss -> toJSON();
  }

  public function actionModuleUpgrade(Request $req)
  {
    $code = 0;
    $genre = strval($req -> post('genre'));
    $zipPath = strval($req -> post('zip_path'));
    $zipFullPath = Path::getActualRoute(ConfigReader::getBaseDir() . '/' . $zipPath);
    if (!is_file($zipFullPath))
    {
      $code = 4001;
    }
    else
    {
      $moduleRecognizer = new ModuleRecognizer($genre);
      $moduleId = $moduleRecognizer -> moduleId;
      if (is_int($moduleId))
      {
        $upgrader = new ModuleUpgrader($zipFullPath, $req -> post(), $moduleRecognizer);
        $upgraded = $upgrader -> upgrade();
        if ($upgraded === true)
        {
          $code = 1;
          $logModel = new Model('migrate');
          $logModel -> pocket = $upgrader -> getMigrateLog();
          $logModel -> save();
          Logger::log($this, 'manageUpgrade.log-module-upgrade', ['zip_path' => $zipPath, 'genre' => $genre]);
        }
        else
        {
          $lastErrorCode = $upgrader -> getLastErrorCode();
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
        $code = 4002;
      }
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = Jtbc::take('manageUpgrade.text-action-upgrade-code-' . $code, 'lng');
    return $ss -> toJSON();
  }

  public function actionPluginUpgrade(Request $req)
  {
    $code = 0;
    $genre = strval($req -> post('genre'));
    $zipPath = strval($req -> post('zip_path'));
    $zipFullPath = Path::getActualRoute(ConfigReader::getBaseDir() . '/' . $zipPath);
    if (!is_file($zipFullPath))
    {
      $code = 4001;
    }
    else
    {
      $pluginRecognizer = new PluginRecognizer($genre);
      $pluginId = $pluginRecognizer -> pluginId;
      if (is_int($pluginId))
      {
        $upgrader = new PluginUpgrader($zipFullPath, $req -> post(), $pluginRecognizer);
        $upgraded = $upgrader -> upgrade();
        if ($upgraded === true)
        {
          $code = 1;
          $logModel = new Model('migrate');
          $logModel -> pocket = $upgrader -> getMigrateLog();
          $logModel -> save();
          Logger::log($this, 'manageUpgrade.log-plugin-upgrade', ['zip_path' => $zipPath, 'genre' => $genre]);
        }
        else
        {
          $lastErrorCode = $upgrader -> getLastErrorCode();
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
        $code = 4002;
      }
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = Jtbc::take('manageUpgrade.text-action-upgrade-code-' . $code, 'lng');
    return $ss -> toJSON();
  }
}