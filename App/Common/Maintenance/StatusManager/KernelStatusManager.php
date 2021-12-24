<?php
namespace App\Common\Maintenance\StatusManager;
use Jtbc\Jtbc;
use Jtbc\Path;
use Jtbc\Jtbc\JtbcWriter;

trait KernelStatusManager
{
  protected $rootConfigPath = 'common/root.jtbc';
  protected $rootConfigNodeName = 'zh-cn';

  public function getFullConfigPath()
  {
    return Path::getActualRoute($this -> rootConfigPath);
  }

  public function lock()
  {
    return JtbcWriter::putNodeContent($this -> getFullConfigPath(), 'cfg', 'status', 'locked', $this -> rootConfigNodeName) === true? true: false;
  }

  public function unlock()
  {
    return JtbcWriter::putNodeContent($this -> getFullConfigPath(), 'cfg', 'status', 'ok', $this -> rootConfigNodeName) === true? true: false;
  }

  public function hasLocked()
  {
    return Jtbc::take('global.root.status', 'cfg') == 'ok'? false: true;
  }

  public function getCurrentVersion()
  {
    return intval(Jtbc::take('global.root.version', 'cfg'));
  }

  public function updateVersion()
  {
    $wroteStatus1 = JtbcWriter::putNodeContent($this -> getFullConfigPath(), 'cfg', $this -> mode . 'd_at', time(), $this -> rootConfigNodeName);
    $wroteStatus2 = JtbcWriter::putNodeContent($this -> getFullConfigPath(), 'cfg', 'version', $this -> getTargetVersion(), $this -> rootConfigNodeName);
    $result = ($wroteStatus1 === true && $wroteStatus2 === true)? true: false;
    return $result;
  }
}