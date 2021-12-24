<?php
namespace App\Common\Maintenance\StatusManager;
use Jtbc\Jtbc;
use Jtbc\Path;
use Jtbc\Jtbc\JtbcWriter;

trait PackageStatusManager
{
  protected $packageConfigPath = 'common/package.jtbc';
  protected $packageConfigNodeName = 'zh-cn';

  public function getFullConfigPath()
  {
    return Path::getActualRoute($this -> packageConfigPath);
  }

  public function lock()
  {
    return JtbcWriter::putNodeContent($this -> getFullConfigPath(), 'cfg', 'status', 'locked', $this -> packageConfigNodeName) === true? true: false;
  }

  public function unlock()
  {
    return JtbcWriter::putNodeContent($this -> getFullConfigPath(), 'cfg', 'status', 'ok', $this -> packageConfigNodeName) === true? true: false;
  }

  public function hasLocked()
  {
    return Jtbc::take('global.package.status', 'cfg') == 'ok'? false: true;
  }

  public function getCurrentVersion()
  {
    return intval(Jtbc::take('global.package.version', 'cfg'));
  }

  public function updateVersion()
  {
    $wroteStatus1 = JtbcWriter::putNodeContent($this -> getFullConfigPath(), 'cfg', $this -> mode . 'd_at', time(), $this -> packageConfigNodeName);
    $wroteStatus2 = JtbcWriter::putNodeContent($this -> getFullConfigPath(), 'cfg', 'version', $this -> getTargetVersion(), $this -> packageConfigNodeName);
    $result = ($wroteStatus1 === true && $wroteStatus2 === true)? true: false;
    return $result;
  }
}