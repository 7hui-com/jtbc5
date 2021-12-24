<?php
namespace App\Common\Maintenance\StatusManager;
use Jtbc\Jtbc;
use Jtbc\Path;
use Jtbc\Jtbc\JtbcWriter;

trait PluginStatusManager
{
  protected $pluginConfigPath = 'common/plugin.jtbc';
  protected $pluginConfigNodeName = 'zh-cn';

  public function getFullConfigPath()
  {
    return Path::getActualRoute($this -> genre . '/' . $this -> pluginConfigPath);
  }

  public function lock()
  {
    return JtbcWriter::putNodeContent($this -> getFullConfigPath(), 'cfg', 'status', 'locked', $this -> pluginConfigNodeName) === true? true: false;
  }

  public function unlock()
  {
    return JtbcWriter::putNodeContent($this -> getFullConfigPath(), 'cfg', 'status', 'ok', $this -> pluginConfigNodeName) === true? true: false;
  }

  public function hasLocked()
  {
    return Jtbc::take('global.' . $this -> genre . ':plugin.status', 'cfg') == 'ok'? false: true;
  }

  public function getCurrentVersion()
  {
    return intval($this -> pluginRecognizer -> pluginVersion);
  }

  public function updateVersion()
  {
    $wroteStatus1 = JtbcWriter::putNodeContent($this -> getFullConfigPath(), 'cfg', $this -> mode . 'd_at', time(), $this -> pluginConfigNodeName);
    $wroteStatus2 = JtbcWriter::putNodeContent($this -> getFullConfigPath(), 'cfg', 'version', $this -> getTargetVersion(), $this -> pluginConfigNodeName);
    $result = ($wroteStatus1 === true && $wroteStatus2 === true)? true: false;
    return $result;
  }
}