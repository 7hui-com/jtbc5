<?php
namespace App\Common\Maintenance;
use Jtbc\Kernel;
use Jtbc\Substance;
use App\Common\ThirdParty\PharUpdater;

abstract class Upgrader
{
  private $dbLink;
  private $taskFilePath;
  private $guideMap;
  private $lastErrorCode;
  private $migrator;
  private $migrateLog;
  protected $type;
  protected $typeId;
  protected $mode = 'upgrade';

  abstract public function lock();
  abstract public function unlock();
  abstract public function hasLocked();
  abstract public function getCurrentVersion();
  abstract public function updateVersion();

  private function createMigrateLog(int $argVersion, int $argTargetVersion, $argMetaGenre)
  {
    $version = $argVersion;
    $targetVersion = $argTargetVersion;
    $metaGenre = $argMetaGenre;
    $pocket = new Substance();
    $pocket -> mode = 0;
    $pocket -> type = $this -> type;
    $pocket -> type_id = $this -> typeId;
    $pocket -> version = $version;
    $pocket -> target_version = $targetVersion;
    $pocket -> timestamp = time();
    if (is_string($metaGenre))
    {
      $pocket -> genre = $metaGenre;
    }
    $this -> migrateLog = $pocket;
  }

  private function updatePhars($argPharNames)
  {
    $result = false;
    $pharNames = $argPharNames;
    if (!is_array($pharNames) || empty($pharNames))
    {
      $result = true;
    }
    else
    {
      $pharUpdater = new PharUpdater($pharNames);
      $result = $pharUpdater -> update()? true: false;
    }
    return $result;
  }

  public function getLastErrorCode()
  {
    return $this -> lastErrorCode;
  }

  public function getMigrateLog()
  {
    return $this -> migrateLog;
  }

  public function getTargetVersion()
  {
    return $this -> migrator -> getMetaTargetVersion();
  }

  public function setType(string $argType, int $argTypeId = 0)
  {
    $this -> type = $argType;
    $this -> typeId = $argTypeId;
  }

  public function isSameType()
  {
    $result = false;
    $metaInfo = $this -> migrator -> getMetaType();
    if ($this -> type == 'kernel')
    {
      $result = $this -> type == $metaInfo -> type? true: false;
    }
    else
    {
      if ($this -> type == $metaInfo -> type && $this -> typeId === $metaInfo -> type_id)
      {
        $result = true;
      }
    }
    return $result;
  }

  public function isLowerPHPVersion()
  {
    $result = false;
    $metaMinimumPHPVersion = $this -> migrator -> getMetaMinimumPHPVersion();
    if (is_string($metaMinimumPHPVersion))
    {
      $result = version_compare(phpversion(), $metaMinimumPHPVersion, '<');
    }
    return $result;
  }

  public function isLowerKernelVersion()
  {
    $result = false;
    $currentKernelVersion = Kernel::getVersion();
    $metaMinimumKernelVersion = $this -> migrator -> getMetaMinimumKernelVersion();
    if ($currentKernelVersion < $metaMinimumKernelVersion)
    {
      $result = true;
    }
    return $result;
  }

  public function upgrade()
  {
    $result = false;
    if (!$this -> isSameType())
    {
      $this -> lastErrorCode = 2000;
    }
    else if ($this -> hasLocked())
    {
      $this -> lastErrorCode = 2001;
    }
    else if ($this -> isLowerPHPVersion())
    {
      $this -> lastErrorCode = 2002;
    }
    else if ($this -> type != 'kernel' && $this -> isLowerKernelVersion())
    {
      $this -> lastErrorCode = 2003;
    }
    else
    {
      $targetVersion = $this -> getTargetVersion();
      $currentVersion = $this -> getCurrentVersion();
      $metaUpdatePhars = $this -> migrator -> getMetaUpdatePhars();
      $metaOriginalVersion = $this -> migrator -> getMetaOriginalVersion();
      if ($currentVersion != $metaOriginalVersion)
      {
        $this -> lastErrorCode = 2010;
      }
      else if (!$this -> updatePhars($metaUpdatePhars))
      {
        $this -> lastErrorCode = 2011;
      }
      else
      {
        if (!$this -> lock())
        {
          $this -> lastErrorCode = 2020;
        }
        else
        {
          $migrated = $this -> migrator -> migrate();
          if ($migrated === true)
          {
            $updated = $this -> updateVersion();
            if ($updated === true)
            {
              $result = true;
              $this -> createMigrateLog($currentVersion, $targetVersion, $this -> migrator -> getMetaGenre());
            }
          }
          else
          {
            $this -> lastErrorCode = $this -> migrator -> getLastErrorCode();
          }
          $this -> unlock();
        }
      }
    }
    return $result;
  }

  public function __construct(string $argTaskFilePath, array $argGuideMap, $argDBLink = null)
  {
    $this -> dbLink = $argDBLink;
    $this -> taskFilePath = $argTaskFilePath;
    $this -> guideMap = $argGuideMap;
    $this -> migrator = new Migrator($this -> taskFilePath, $this -> guideMap, $this -> dbLink);
  }
}