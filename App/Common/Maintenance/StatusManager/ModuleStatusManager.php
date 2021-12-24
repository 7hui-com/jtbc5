<?php
namespace App\Common\Maintenance\StatusManager;
use Jtbc\Jtbc;
use Jtbc\Path;
use Jtbc\Jtbc\JtbcWriter;

trait ModuleStatusManager
{
  protected $moduleConfigPath = 'common/module.jtbc';
  protected $moduleConfigNodeName = 'zh-cn';

  public function getFullConfigPath()
  {
    return Path::getActualRoute($this -> genre . '/' . $this -> moduleConfigPath);
  }

  public function lock()
  {
    return JtbcWriter::putNodeContent($this -> getFullConfigPath(), 'cfg', 'status', 'locked', $this -> moduleConfigNodeName) === true? true: false;
  }

  public function unlock()
  {
    return JtbcWriter::putNodeContent($this -> getFullConfigPath(), 'cfg', 'status', 'ok', $this -> moduleConfigNodeName) === true? true: false;
  }

  public function hasLocked()
  {
    return Jtbc::take('global.' . $this -> genre . ':module.status', 'cfg') == 'ok'? false: true;
  }

  public function getCurrentVersion()
  {
    return intval($this -> moduleRecognizer -> moduleVersion);
  }

  public function updateVersion()
  {
    $wroteStatus1 = JtbcWriter::putNodeContent($this -> getFullConfigPath(), 'cfg', $this -> mode . 'd_at', time(), $this -> moduleConfigNodeName);
    $wroteStatus2 = JtbcWriter::putNodeContent($this -> getFullConfigPath(), 'cfg', 'version', $this -> getTargetVersion(), $this -> moduleConfigNodeName);
    $result = ($wroteStatus1 === true && $wroteStatus2 === true)? true: false;
    return $result;
  }
}