<?php
namespace App\Universal\Plugin;
use Jtbc\Encoder;
use Jtbc\Substance;
use Jtbc\Config\ClassicConfigManager;

class PluginConfigWriter
{
  private $plugin;
  private $pluginName;
  private $lastErrorCode = 0;

  public function getLastErrorCode()
  {
    return $this -> lastErrorCode;
  }

  public function write(Substance $config)
  {
    $result = false;
    if (!$this -> plugin -> isExists())
    {
      $this -> lastErrorCode = 1001;
    }
    else if ($this -> plugin -> isLocked())
    {
      $this -> lastErrorCode = 1002;
    }
    else
    {
      $configClass = $this -> plugin -> getFullConfigClass();
      if (is_null($configClass))
      {
        $this -> lastErrorCode = 1011;
      }
      else
      {
        $classicConfigManager = new ClassicConfigManager($configClass, true);
        foreach ($config as $key => $value)
        {
          $classicConfigManager -> {strtoupper($key)} = $value;
        }
        $result = $classicConfigManager -> save();
      }
    }
    return $result;
  }

  public function __construct(string $argPluginName)
  {
    $this -> pluginName = $argPluginName;
    $this -> plugin = new Plugin($this -> pluginName);
  }
}