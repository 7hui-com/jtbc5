<?php
namespace App\Universal\Plugin;
use Jtbc\Jtbc;
use Jtbc\Path;
use Jtbc\Validation;
use Jtbc\Jtbc\JtbcWriter;
use App\Common\Hook\HooksGeneralManager;

class Plugin
{
  private $name;
  private $folderName;
  private $genre;
  private $fullPath;

  public function getId()
  {
    return intval($this -> id);
  }

  public function getName()
  {
    return $this -> name;
  }

  public function getTitle()
  {
    return $this -> title;
  }

  public function getGroup()
  {
    return $this -> group;
  }

  public function getIntro()
  {
    return $this -> intro;
  }

  public function getIcon()
  {
    return $this -> icon;
  }

  public function getVersion()
  {
    return intval($this -> version);
  }

  public function getGenre()
  {
    return $this -> genre;
  }

  public function getFullPath()
  {
    return $this -> fullPath;
  }

  public function getEntrance()
  {
    return $this -> entrance;
  }

  public function getConfigCodename()
  {
    return $this -> config_codename;
  }

  public function getConfigKeys()
  {
    return $this -> config_keys;
  }

  public function getConfigByKey(string $argKey)
  {
    $result = null;
    $key = $argKey;
    $fullConfigClass = $this -> getFullConfigClass();
    if (!is_null($fullConfigClass))
    {
      $constantName = $fullConfigClass . '::' . strtoupper($key);
      if (defined($constantName))
      {
        $result = constant($constantName);
      }
      else
      {
        $result = Jtbc::take('global.' . $this -> genre . ':config.' . $key, 'cfg');
      }
    }
    return $result;
  }

  public function getFullConfigClass()
  {
    $result = null;
    if ($this -> hasConfig())
    {
      $path = array_merge(['config', 'app'], explode('/', $this -> genre));
      foreach ($path as $key => $val)
      {
        $path[$key] = ucfirst($val);
      }
      $result = implode('\\', $path);
    }
    return $result;
  }

  public function getFullConfigPath()
  {
    $result = null;
    $fullConfigClass = $this -> getFullConfigClass();
    if (!is_null($fullConfigClass))
    {
      $configPath = '../' . str_replace('\\', '/', $fullConfigClass) . '.php';
      $result = Path::getActualRoute($configPath);
    }
    return $result;
  }

  public function isLocked()
  {
    return is_null($this -> locked)? false: true;
  }

  public function isEnabled()
  {
    return $this -> enabled == 'true'? true: false;
  }

  public function isExists()
  {
    return is_dir($this -> fullPath)? true: false;
  }

  public function hasConfig()
  {
    return is_null($this -> getConfigKeys())? false: true;
  }

  public function setEnabled(bool $argEnabled = true)
  {
    $result = false;
    $enabled = $argEnabled;
    if ($this -> isExists() && !$this -> isLocked())
    {
      $setable = false;
      $hooksGeneralManager = new HooksGeneralManager();
      $hooksAdded = $hooksGeneralManager -> batchAddFromModule($this -> genre, $this -> global_hook_handle, $this -> forestage_hook_handle, $this -> backstage_hook_handle);
      if ($hooksAdded !== true)
      {
        $setable = true;
      }
      else
      {
        $setable = $enabled == true? $hooksGeneralManager -> registerIfNotExists(): $hooksGeneralManager -> cancel();
      }
      if ($setable === true)
      {
        $pluginFilePath = Path::getActualRoute($this -> genre . '/common/plugin.jtbc');
        if (JtbcWriter::putNodeContent($pluginFilePath, 'cfg', 'enabled', $enabled === true? 'true': 'false'))
        {
          $result = true;
        }
      }
    }
    return $result;
  }

  public function __get($argName)
  {
    $result = null;
    $name = $argName;
    if (Validation::isNatural($name))
    {
      $result = Jtbc::take('global.' . $this -> genre . ':plugin.' . $name, 'cfg');
    }
    return $result;
  }

  public function __construct(string $argName)
  {
    $this -> name = $argName;
    $this -> folderName = PluginEnv::GENRE;
    $this -> genre = $this -> folderName . '/' . $this -> name;
    $this -> fullPath = Path::getActualRoute($this -> genre);
  }
}