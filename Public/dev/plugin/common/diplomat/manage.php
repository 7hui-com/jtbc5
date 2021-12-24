<?php
namespace Jtbc;
use Jtbc\Config\ClassicConfigManager;
use App\Console\Common\BasicSubstance;
use App\Console\Common\Ambassador;
use App\Console\Log\Logger;
use App\Universal\Plugin\Plugin;
use App\Universal\Plugin\PluginFinder;
use App\Universal\Plugin\PluginUninstaller;
use App\Universal\Plugin\PluginConfigWriter;
use Config\App\Universal\Plugin as PluginConfig;

class Diplomat extends Ambassador {
  public function getPluginConfig(Request $req)
  {
    $code = 1;
    $data = [];
    $name = strval($req -> get('name'));
    $plugin = new Plugin($name);
    if ($plugin -> hasConfig())
    {
      $configKeys = $plugin -> getConfigKeys();
      $configKeysArr = explode(',', $configKeys);
      foreach ($configKeysArr as $key)
      {
        $data[$key] = $plugin -> getConfigByKey($key) ?? '';
      }
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> data = $data;
    return $ss -> toJSON();
  }

  public function list(Request $req)
  {
    $data = [];
    $pluginFinder = new PluginFinder();
    $plugins = $pluginFinder -> getPlugins();
    $enabled = intval($req -> get('enabled') ?? -1);
    if ($enabled == 0)
    {
      $plugins = $pluginFinder -> getDisabledPlugins();
    }
    else if ($enabled == 1)
    {
      $plugins = $pluginFinder -> getEnabledPlugins();
    }
    foreach ($plugins as $plugin)
    {
      $item = new Plugin($plugin);
      $data[] = [
        'name' => $item -> getName(),
        'title' => $item -> getTitle(),
        'intro' => $item -> getIntro(),
        'icon' => $item -> getIcon(),
        'genre' => $item -> getGenre(),
        'isLocked' => $item -> isLocked(),
        'isEnabled' => $item -> isEnabled(),
        'hasConfig' => $item -> hasConfig(),
        'config_codename' => $item -> getConfigCodename(),
      ];
    }
    $bs = new BasicSubstance($this);
    $bs -> data -> data = $data;
    return $bs -> toJSON();
  }

  public function actionDisable(Request $req)
  {
    $code = 0;
    $message = '';
    $name = strval($req -> get('name'));
    if ($this -> guard -> role -> checkPermission('disable'))
    {
      $plugin = new Plugin($name);
      if ($plugin -> isLocked())
      {
        $code = 4001;
      }
      else
      {
        if ($plugin -> setEnabled(false) === true)
        {
          $code = 1;
          Logger::log($this, 'manage.log-disable', ['name' => $name]);
        }
        else
        {
          $code = 4002;
        }
      }
    }
    else
    {
      $code = 4403;
      $message = Jtbc::take('::communal.text-tips-error-4403', 'lng');
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = Jtbc::take('manage.text-disable-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }

  public function actionEnable(Request $req)
  {
    $code = 0;
    $message = '';
    $name = strval($req -> get('name'));
    if ($this -> guard -> role -> checkPermission('enable'))
    {
      $plugin = new Plugin($name);
      if ($plugin -> isLocked())
      {
        $code = 4001;
      }
      else
      {
        if ($plugin -> setEnabled(true) === true)
        {
          $code = 1;
          $pluginGroup = $plugin -> getGroup();
          if (!is_null($pluginGroup))
          {
            $pluginFinder = new PluginFinder();
            $sameGroupPlugins = $pluginFinder -> getPluginsByGroup($pluginGroup);
            foreach ($sameGroupPlugins as $sameGroupPlugin)
            {
              if ($sameGroupPlugin != $name)
              {
                $currentPlugin = new Plugin($sameGroupPlugin);
                if (!$currentPlugin -> isLocked())
                {
                  $currentPlugin -> setEnabled(false);
                }
              }
            }
            $classicConfigManager = new ClassicConfigManager(PluginConfig::class, true);
            $classicConfigManager -> {strtoupper($pluginGroup)} = $name;
            $classicConfigManager -> save();
          }
          Logger::log($this, 'manage.log-enable', ['name' => $name]);
        }
        else
        {
          $code = 4002;
        }
      }
    }
    else
    {
      $code = 4403;
      $message = Jtbc::take('::communal.text-tips-error-4403', 'lng');
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = Jtbc::take('manage.text-enable-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }

  public function actionUninstall(Request $req)
  {
    $code = 0;
    $message = '';
    $name = strval($req -> get('name'));
    if ($this -> guard -> role -> checkPermission('uninstall'))
    {
      $pluginUninstaller = new PluginUninstaller($name);
      $uninstalled = $pluginUninstaller -> uninstall();
      if ($uninstalled === true)
      {
        $code = 1;
        Logger::log($this, 'manage.log-uninstall', ['name' => $name]);
      }
      else
      {
        $lastErrorCode = $pluginUninstaller -> getLastErrorCode();
        if ($lastErrorCode == 1401)
        {
          $code = 4001;
        }
        else if ($lastErrorCode == 1402)
        {
          $code = 4002;
        }
        else
        {
          $code = 4003;
        }
      }
    }
    else
    {
      $code = 4403;
      $message = Jtbc::take('::communal.text-tips-error-4403', 'lng');
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = Jtbc::take('manage.text-uninstall-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }

  public function actionConfig(Request $req)
  {
    $code = 0;
    $message = '';
    $name = strval($req -> get('name'));
    if ($this -> guard -> role -> checkPermission('config'))
    {
      $plugin = new Plugin($name);
      $configKeys = $plugin -> getConfigKeys();
      if (is_null($configKeys))
      {
        $code = 4001;
      }
      else
      {
        $config = [];
        $configKeysArr = explode(',', $configKeys);
        foreach ($configKeysArr as $key)
        {
          $config[$key] = $req -> post($key);
        }
        $pluginConfigWriter = new PluginConfigWriter($name);
        $wrote = $pluginConfigWriter -> write(new Substance($config));
        if ($wrote === true)
        {
          $code = 1;
          Logger::log($this, 'manage.log-config', ['name' => $name]);
        }
        else
        {
          $lastErrorCode = $pluginConfigWriter -> getLastErrorCode();
          if ($lastErrorCode == 1002)
          {
            $code = 4011;
          }
          else if ($lastErrorCode == 1011)
          {
            $code = 4012;
          }
          else
          {
            $code = 4013;
          }
        }
      }
    }
    else
    {
      $code = 4403;
      $message = Jtbc::take('::communal.text-tips-error-4403', 'lng');
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = Jtbc::take('manage.text-config-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }
}