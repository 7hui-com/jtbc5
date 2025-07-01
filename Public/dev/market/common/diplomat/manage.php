<?php
namespace Jtbc;
use Jtbc\HTTP\SimpleCURL;
use Jtbc\Module\ModuleFinder;
use Jtbc\String\StringHelper;
use App\Common\Official\OfficialCommunicator;
use App\Common\Premium\PremiumAccountLoader;
use App\Common\Maintenance\Migrator\ConfigReader;
use App\Common\Module\ModuleInstaller;
use App\Common\Module\BatchModuleUninstaller;
use App\Common\Package\PackageInstaller;
use App\Console\Common\BasicSubstance;
use App\Console\Common\EmptySubstance;
use App\Console\Common\Ambassador;
use App\Console\Log\Logger;
use App\Universal\Common\Setting;
use App\Universal\Common\DataCleaner;
use App\Universal\Plugin\PluginFinder;
use App\Universal\Plugin\PluginInstaller;

class Diplomat extends Ambassador {
  private $categories = ['package', 'module', 'plugin'];

  private function getDataCleanerSettings(array $argDataSource)
  {
    $result = new Substance();
    $dataSource = $argDataSource;
    foreach ($dataSource as $key => $value)
    {
      if (str_starts_with($key, 'clean_'))
      {
        $genre = StringHelper::getClipedString($key, '_', 'right+');
        $result[$genre] = intval($value) === 1? true: false;
      }
    }
    return $result;
  }

  private function getBatchUninstallAbleModules()
  {
    $result = [];
    $dataCleaner = new DataCleaner(new Substance());
    $batchModuleUninstaller = new BatchModuleUninstaller();
    $cleanableModules = $dataCleaner -> getCleanableModules();
    $batchUninstallAbleModules = $batchModuleUninstaller -> getBatchUninstallAbleModules(true);
    foreach ($batchUninstallAbleModules as $batchUninstallAbleModule)
    {
      if (is_array($batchUninstallAbleModule) && array_key_exists('genre', $batchUninstallAbleModule))
      {
        $currentGenre = $batchUninstallAbleModule['genre'];
        if (!array_key_exists($currentGenre, $cleanableModules))
        {
          $batchUninstallAbleModule['isCleanable'] = false;
        }
        else
        {
          $batchUninstallAbleModule['isCleanable'] = true;
          $batchUninstallAbleModule['batchTruncateMode'] = intval($cleanableModules[$currentGenre] -> config['batch-truncate-mode'] ?? -1);
        }
        $result[] = $batchUninstallAbleModule;
      }
    }
    return $result;
  }

  public function list(Request $req)
  {
    $category = strval($req -> get('category'));
    $filter = strval($req -> get('filter'));
    $orderBy = strval($req -> get('order_by'));
    $keyword = strval($req -> get('keyword'));
    $category = in_array($category, $this -> categories)? $category: current($this -> categories);
    $filter = in_array($filter, ['all', 'mine'])? $filter: 'all';
    $bs = new BasicSubstance($this);
    $bs -> data -> category = $category;
    $bs -> data -> filter = $filter;
    $bs -> data -> order_by = $orderBy;
    $bs -> data -> keyword = $keyword;
    return $bs -> toJSON();
  }

  public function originalList(Request $req)
  {
    $params = $req -> get();
    $es = new EmptySubstance();
    $officialCommunicator = new OfficialCommunicator();
    $premiumAccount = PremiumAccountLoader::getInstance();
    if ($premiumAccount -> isValidCertificate())
    {
      $appId = $premiumAccount -> certificate -> getAppId();
      $appSecret = $premiumAccount -> certificate -> getAppSecret();
      $officialCommunicator = new OfficialCommunicator($appId, $appSecret);
    }
    $officialCommunicator -> setData($params);
    $officialCommunicator -> service_id = 'M0001';
    $officialCommunicator -> kernel_version = Kernel::getVersion();
    $apiResult = $officialCommunicator -> getApiResult();
    if (!is_null($apiResult))
    {
      if ($apiResult -> code == 1)
      {
        $es -> data = $apiResult -> data;
      }
    }
    return $es -> toJSON();
  }

  public function originalDetail(Request $req)
  {
    $params = $req -> get();
    $es = new EmptySubstance();
    $officialCommunicator = new OfficialCommunicator();
    $officialCommunicator -> setData($params);
    $officialCommunicator -> service_id = 'M0002';
    $officialCommunicator -> kernel_version = Kernel::getVersion();
    $apiResult = $officialCommunicator -> getApiResult();
    if (!is_null($apiResult))
    {
      if ($apiResult -> code == 1)
      {
        $es -> data = $apiResult -> data;
      }
    }
    return $es -> toJSON();
  }

  public function actionPrepare(Request $req)
  {
    $code = 0;
    $data = [];
    $message = null;
    $id = intval($req -> get('id') ?? -1);
    $param = strval($req -> get('param'));
    $category = strval($req -> get('category'));
    $typeId = intval($req -> get('type_id') ?? -1);
    $premiumAccount = PremiumAccountLoader::getInstance();
    if (!$premiumAccount -> isValidCertificate())
    {
      $code = 4004;
    }
    else
    {
      $appId = $premiumAccount -> certificate -> getAppId();
      $appSecret = $premiumAccount -> certificate -> getAppSecret();
      $officialCommunicator = new OfficialCommunicator($appId, $appSecret);
      $officialCommunicator -> service_id = 'M0011';
      $officialCommunicator -> id = $id;
      $officialCommunicator -> kernel_version = Kernel::getVersion();
      $apiResult = $officialCommunicator -> getApiResult();
      if (!is_null($apiResult))
      {
        $code = $apiResult -> code;
        $message = $apiResult -> message;
        $data = $apiResult -> data;
        if (!array_key_exists('content', $data))
        {
          $data['content'] = [
            'id' => $id,
            'param' => $param,
            'type_id' => $typeId,
            'category' => $category,
            'modules' => $category == 'package'? $this -> getBatchUninstallAbleModules(): null,
          ];
        }
      }
      else
      {
        $code = 4444;
      }
    }
    $es = new EmptySubstance();
    $es -> code = $code;
    $es -> data = $data;
    $es -> message = $message ?? Jtbc::take('manage.text-action-prepare-code-' . $code, 'lng');
    return $es -> toJSON();
  }

  public function actionInstall(Request $req, Response $res, Cache $cache)
  {
    $code = 0;
    $message = null;
    $id = intval($req -> post('id') ?? -1);
    $category = strval($req -> post('category'));
    $param = strval($req -> post('param'));
    $typeId = intval($req -> post('type_id') ?? -1);
    $agree = intval($req -> post('agree') ?? -1);
    $moduleName = strval($req -> post('module_name'));
    $moduleTitle = strval($req -> post('module_title'));
    $moduleIcon = strval($req -> post('module_icon'));
    $premiumAccount = PremiumAccountLoader::getInstance();
    if (!in_array($category, $this -> categories))
    {
      $code = 4001;
    }
    else if (!$premiumAccount -> isValidCertificate())
    {
      $code = 4004;
    }
    else
    {
      $appId = $premiumAccount -> certificate -> getAppId();
      $appSecret = $premiumAccount -> certificate -> getAppSecret();
      $getInstallationZip = function(string $argCategory, int $argTypeId, int $argId) use ($appId, $appSecret, $premiumAccount)
      {
        $result = [];
        $id = $argId;
        $typeId = $argTypeId;
        $category = $argCategory;
        $targetFolder = ConfigReader::getBaseDir() . '/' . $category;
        $zipFullPath = $targetFolder . '/' . $typeId . '.zip';
        $targetPath = Path::getActualRoute($zipFullPath);
        $targetFolderPath = pathinfo($targetPath, PATHINFO_DIRNAME);
        if ((!is_dir($targetFolderPath) && !@mkdir($targetFolderPath, 0777, true)) || !is_writable($targetFolderPath))
        {
          $result = null;
        }
        else
        {
          $result = false;
          $officialCommunicator = new OfficialCommunicator($appId, $appSecret);
          $officialCommunicator -> service_id = 'M0012';
          $officialCommunicator -> id = $id;
          $apiResult = $officialCommunicator -> getApiResult();
          if (!is_null($apiResult))
          {
            $code = $apiResult -> code;
            $data = $apiResult -> data;
            $downloadURL = $apiResult -> download_url;
            if ($code == 1)
            {
              $simpleCURL = new SimpleCURL($downloadURL, 120);
              $curlResult = $simpleCURL -> get();
              if ($curlResult -> is_succeed)
              {
                $result = new Substance();
                if (@file_put_contents($targetPath, $curlResult -> content))
                {
                  $result -> data = $data;
                  $result -> zip_full_path = $zipFullPath;
                }
              }
            }
            else if ($code == 4)
            {
              $result = 4;
            }
          }
        }
        return $result;
      };
      if ($category == 'package')
      {
        $rootPath = Path::getActualRoute('./');
        if ($agree == -1)
        {
          $code = 4201;
        }
        else if (!@is_writable($rootPath))
        {
          $code = 4205;
        }
        else
        {
          $batchModuleUninstaller = new BatchModuleUninstaller();
          $dataCleaner = new DataCleaner($this -> getDataCleanerSettings($req -> post()));
          if ($batchModuleUninstaller -> uninstall() === false)
          {
            $code = 4211;
          }
          else if ($dataCleaner -> clean() === false)
          {
            $code = 4212;
          }
          else
          {
            $installationZip = $getInstallationZip($category, $typeId, $id);
            if (is_null($installationZip))
            {
              $code = 4010;
            }
            else if ($installationZip === 4)
            {
              $code = 4011;
            }
            else if ($installationZip === false)
            {
              $code = 4012;
            }
            else if ($installationZip instanceof Substance)
            {
              $data = $installationZip -> data;
              $zipFullPath = $installationZip -> zip_full_path;
              $packageInstaller = new PackageInstaller(Path::getActualRoute($zipFullPath));
              if (array_key_exists('sign', $data) && array_key_exists('premium_sign', $data))
              {
                $packageInstaller -> setPremiumSign($data['sign'], $data['premium_sign']);
              }
              $installed = $packageInstaller -> install();
              if ($installed === true)
              {
                $code = 1;
                $cache -> removeAll();
                Setting::restoreLanguage($res);
                Logger::log($this, 'manage.log-install-package', ['type_id' => $typeId]);
              }
              else
              {
                $code = 4848;
              }
            }
            else
            {
              $code = 4444;
            }
          }
        }
      }
      else if ($category == 'module')
      {
        $paramSS = new Substance($param);
        $rootPath = Path::getActualRoute('./');
        $targetFolderPath = Path::getActualRoute($moduleName);
        $moduleIcon = $moduleIcon ?: strval($paramSS -> module_icon);
        if (!Validation::isDirPath($moduleName))
        {
          $code = 4101;
        }
        else if (is_dir($targetFolderPath))
        {
          $code = 4102;
        }
        else if (Validation::isEmpty($moduleTitle))
        {
          $code = 4103;
        }
        else if (Validation::isEmpty($moduleIcon))
        {
          $code = 4104;
        }
        else if (!@is_writable($rootPath))
        {
          $code = 4105;
        }
        else
        {
          $installationZip = $getInstallationZip($category, $typeId, $id);
          if (is_null($installationZip))
          {
            $code = 4010;
          }
          else if ($installationZip === 4)
          {
            $code = 4011;
          }
          else if ($installationZip === false)
          {
            $code = 4012;
          }
          else if ($installationZip instanceof Substance)
          {
            $data = $installationZip -> data;
            $zipFullPath = $installationZip -> zip_full_path;
            $moduleInstaller = new ModuleInstaller(Path::getActualRoute($zipFullPath));
            if (array_key_exists('sign', $data) && array_key_exists('premium_sign', $data))
            {
              $moduleInstaller -> setPremiumSign($data['sign'], $data['premium_sign']);
            }
            $installed = $moduleInstaller -> installTo($moduleName, $moduleTitle, $moduleIcon);
            if ($installed === true)
            {
              $code = 1;
              $moduleFinder = new ModuleFinder();
              $moduleFinder -> removeCache();
              Logger::log($this, 'manage.log-install-module', ['type_id' => $typeId]);
            }
            else
            {
              $lastErrorCode = $moduleInstaller -> getLastErrorCode();
              if ($lastErrorCode == 1003)
              {
                $code = 4111;
              }
              else if ($lastErrorCode == 1020)
              {
                $code = 4112;
              }
              else if ($lastErrorCode == 1021)
              {
                $code = 4119;
                $message = Jtbc::take('manage.text-action-install-code-' . $code, 'lng', false, ['tables' => implode(',', $moduleInstaller -> getExistedDBTables())]);
              }
              else
              {
                $code = 4848;
              }
            }
          }
          else
          {
            $code = 4444;
          }
        }
      }
      else if ($category == 'plugin')
      {
        $paramSS = new Substance($param);
        $pluginFinder = new PluginFinder();
        if (is_null($paramSS -> name))
        {
          $code = 4301;
        }
        else if ($pluginFinder -> exists($paramSS -> name))
        {
          $code = 4302;
        }
        else if (!@is_writable($pluginFinder -> getFolderPath()))
        {
          $code = 4303;
        }
        else
        {
          $installationZip = $getInstallationZip($category, $typeId, $id);
          if (is_null($installationZip))
          {
            $code = 4010;
          }
          else if ($installationZip === 4)
          {
            $code = 4011;
          }
          else if ($installationZip === false)
          {
            $code = 4012;
          }
          else if ($installationZip instanceof Substance)
          {
            $data = $installationZip -> data;
            $zipFullPath = $installationZip -> zip_full_path;
            $pluginInstaller = new PluginInstaller(Path::getActualRoute($zipFullPath));
            if (array_key_exists('sign', $data) && array_key_exists('premium_sign', $data))
            {
              $pluginInstaller -> setPremiumSign($data['sign'], $data['premium_sign']);
            }
            $installed = $pluginInstaller -> install();
            if ($installed === true)
            {
              $code = 1;
              Logger::log($this, 'manage.log-install-plugin', ['type_id' => $typeId]);
            }
            else
            {
              $code = 4848;
            }
          }
          else
          {
            $code = 4444;
          }
        }
      }
    }
    $es = new EmptySubstance();
    $es -> code = $code;
    $es -> message = $message ?? Jtbc::take('manage.text-action-install-code-' . $code, 'lng');
    return $es -> toJSON();
  }
}