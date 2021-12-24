<?php
namespace App\Common\Hook;
use Jtbc\Path;
use Jtbc\Hook\GlobalHookManager;
use Jtbc\Exception\UnexpectedException;
use Jtbc\Exception\NotCallableException;

class HooksGeneralManager
{
  private $globalHook = [];
  private $foreStageHook = [];
  private $backStageHook = [];
  private $lastErrorCode;

  public function addGlobalHook(string $argKey, string $argHandle)
  {
    $this -> globalHook[$argKey] = $argHandle;
    return $this;
  }

  public function addForeStageHook(string $argKey, string $argHandle)
  {
    $this -> foreStageHook[$argKey] = $argHandle;
    return $this;
  }

  public function addBackStageHook(string $argKey, string $argHandle)
  {
    $this -> backStageHook[$argKey] = $argHandle;
    return $this;
  }

  public function batchAddFromModule(string $argGenre, $argGlobalHookHandle = null, $argForeStageHookHandle = null, $argBackStageHookHandle = null)
  {
    $result = false;
    $genre = $argGenre;
    $globalHookHandle = $argGlobalHookHandle;
    $foreStageHookHandle = $argForeStageHookHandle;
    $backStageHookHandle = $argBackStageHookHandle;
    if (!is_null($globalHookHandle))
    {
      $globalHookFullName = Path::getInteriorNameSpace($genre) . '\\' . $globalHookHandle;
      if (is_callable($globalHookFullName))
      {
        $result = true;
        $this -> addGlobalHook($genre, $globalHookFullName);
      }
    }
    if (!is_null($foreStageHookHandle))
    {
      $foreStageHookFullName = Path::getInteriorNameSpace($genre) . '\\' . $foreStageHookHandle;
      if (is_callable($foreStageHookFullName))
      {
        $result = true;
        $this -> addForeStageHook($genre, $foreStageHookFullName);
      }
    }
    if (!is_null($backStageHookHandle))
    {
      $backStageHookFullName = Path::getInteriorNameSpace($genre) . '\\' . $backStageHookHandle;
      if (is_callable($backStageHookFullName))
      {
        $result = true;
        $this -> addBackStageHook($genre, $backStageHookFullName);
      }
    }
    return $result;
  }

  public function cancel()
  {
    $result = true;
    $globalHook = $this -> globalHook;
    $foreStageHook = $this -> foreStageHook;
    $backStageHook = $this -> backStageHook;
    if ($this -> isEmpty())
    {
      $result = false;
    }
    else
    {
      $hasError = false;
      if (!empty($globalHook))
      {
        $globalHookManager = new GlobalHookManager();
        foreach ($globalHook as $key => $handle)
        {
          $itemResult = $globalHookManager -> cancel($key);
          if ($itemResult !== true)
          {
            $hasError = true;
            $this -> lastErrorCode = $globalHookManager -> getLastErrorCode();
            break;
          }
        }
        $globalHookManager -> clean();
      }
      if ($hasError === true)
      {
        $result = false;
      }
      else
      {
        if (!empty($foreStageHook))
        {
          $foreStageHookManager = new ForeStageHookManager();
          foreach ($foreStageHook as $key => $handle)
          {
            $itemResult = $foreStageHookManager -> cancel($key);
            if ($itemResult !== true)
            {
              $hasError = true;
              $this -> lastErrorCode = $foreStageHookManager -> getLastErrorCode();
              break;
            }
          }
          $foreStageHookManager -> clean();
        }
        if ($hasError === true)
        {
          $result = false;
        }
        else
        {
          if (!empty($backStageHook))
          {
            $backStageHookManager = new BackStageHookManager();
            foreach ($backStageHook as $key => $handle)
            {
              $itemResult = $backStageHookManager -> cancel($key);
              if ($itemResult !== true)
              {
                $result = false;
                $hasError = true;
                $this -> lastErrorCode = $backStageHookManager -> getLastErrorCode();
                break;
              }
            }
            $backStageHookManager -> clean();
          }
        }
      }
    }
    return $result;
  }

  public function getLastErrorCode()
  {
    return $this -> lastErrorCode;
  }

  public function isEmpty()
  {
    return (empty($this -> globalHook) && empty($this -> foreStageHook) && empty($this -> backStageHook))? true: false;
  }

  public function registerIfNotExists()
  {
    $result = true;
    $globalHook = $this -> globalHook;
    $foreStageHook = $this -> foreStageHook;
    $backStageHook = $this -> backStageHook;
    if ($this -> isEmpty())
    {
      $result = false;
    }
    else
    {
      $hasError = false;
      if (!empty($globalHook))
      {
        $globalHookManager = new GlobalHookManager();
        foreach ($globalHook as $key => $handle)
        {
          $itemResult = $globalHookManager -> registerIfNotExists($key, $handle);
          if ($itemResult !== true)
          {
            $hasError = true;
            $this -> lastErrorCode = $globalHookManager -> getLastErrorCode();
            break;
          }
        }
        $globalHookManager -> clean();
      }
      if ($hasError === true)
      {
        $result = false;
      }
      else
      {
        if (!empty($foreStageHook))
        {
          $foreStageHookManager = new ForeStageHookManager();
          foreach ($foreStageHook as $key => $handle)
          {
            $itemResult = $foreStageHookManager -> registerIfNotExists($key, $handle);
            if ($itemResult !== true)
            {
              $hasError = true;
              $this -> lastErrorCode = $foreStageHookManager -> getLastErrorCode();
              break;
            }
          }
          $foreStageHookManager -> clean();
        }
        if ($hasError === true)
        {
          $result = false;
        }
        else
        {
          if (!empty($backStageHook))
          {
            $backStageHookManager = new BackStageHookManager();
            foreach ($backStageHook as $key => $handle)
            {
              $itemResult = $backStageHookManager -> registerIfNotExists($key, $handle);
              if ($itemResult !== true)
              {
                $result = false;
                $hasError = true;
                $this -> lastErrorCode = $backStageHookManager -> getLastErrorCode();
                break;
              }
            }
            $backStageHookManager -> clean();
          }
        }
      }
    }
    return $result;
  }

  public function __construct(array $argGlobalHook = [], array $argForeStageHook = [], array $argBackStageHook = [])
  {
    foreach ($argGlobalHook as $key => $handle)
    {
      if (!is_string($key))
      {
        throw new UnexpectedException('Unexpected argument(s)', 50801);
      }
      else if (!is_callable($handle))
      {
        throw new NotCallableException('Not callable', 50406);
      }
      else
      {
        $this -> addGlobalHook($key, $handle);
      }
    }
    foreach ($argForeStageHook as $key => $handle)
    {
      if (!is_string($key))
      {
        throw new UnexpectedException('Unexpected argument(s)', 50801);
      }
      else if (!is_callable($handle))
      {
        throw new NotCallableException('Not callable', 50406);
      }
      else
      {
        $this -> addForeStageHook($key, $handle);
      }
    }
    foreach ($argBackStageHook as $key => $handle)
    {
      if (!is_string($key))
      {
        throw new UnexpectedException('Unexpected argument(s)', 50801);
      }
      else if (!is_callable($handle))
      {
        throw new NotCallableException('Not callable', 50406);
      }
      else
      {
        $this -> addBackStageHook($key, $handle);
      }
    }
  }
}