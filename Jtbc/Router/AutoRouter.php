<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Router;
use Jtbc\Env;
use Jtbc\Path;
use Jtbc\Diplomat;
use Jtbc\Substance;
use Jtbc\File\MIMETypes;
use Jtbc\Exception\UnexpectedException;

class AutoRouter extends ManualRouter
{
  private $isMatched = false;
  private $diplomatDir = 'common/diplomat/';
  private $diplomatPath;
  private $realScriptName;
  private $realFilePath;
  private $realDirName;
  private $realExtension;

  private function match()
  {
    $baseName = basename($this -> realScriptName);
    $diplomatPath = $this -> diplomatDir . $baseName;
    if (is_file($this -> realDirName . '/' . $diplomatPath))
    {
      $this -> isMatched = true;
      $this -> diplomatPath = $diplomatPath;
    }
    return $this -> isMatched;
  }

  private function rematch()
  {
    $baseName = basename($this -> realScriptName);
    $rewriteFile = $this -> realDirName . '/.rewrite';
    if (is_file($rewriteFile))
    {
      $rewriteRules = require($rewriteFile);
      if (is_array($rewriteRules))
      {
        foreach ($rewriteRules as $rewriteRule)
        {
          $matchedResult = [];
          $rule = new Substance($rewriteRule);
          $query = $rule -> query;
          $matched = preg_match($rule -> pattern, $baseName, $matchedResult);
          if ($matched === 1 && is_array($query))
          {
            if (count($matchedResult) === count($query) + 1)
            {
              $diplomatPath = $this -> diplomatDir . $rule -> file;
              if (is_file($this -> realDirName . '/' . $diplomatPath))
              {
                $this -> isMatched = true;
                $this -> diplomatPath = $diplomatPath;
                $params = $rule -> params;
                if (is_array($params))
                {
                  foreach ($params as $key => $val)
                  {
                    $this -> di -> request -> source -> get[$key] = $val;
                  }
                }
                foreach ($query as $key => $val)
                {
                  $this -> di -> request -> source -> get[$val] = urldecode($matchedResult[$key + 1]);
                }
                break;
              }
            }
          }
        }
      }
    }
    return $this -> isMatched;
  }

  public function autoRun()
  {
    $isMatched = false;
    $hookResult = $this -> di -> hook -> beforeAutoRoute -> spark($this);
    if (is_null($hookResult))
    {
      if ($this -> match() || $this -> rematch())
      {
        Path::changeTo($this -> realDirName);
        require_once($this -> diplomatPath);
        $diplomat = new Diplomat();
        Env::setParams(['$this' => $diplomat]);
        $hookGetResult = $this -> di -> hook -> beforeAutoRouteGetResult -> provoke($this, $diplomat);
        $this -> output(is_string($hookGetResult)? $hookGetResult: $diplomat -> getResult());
      }
      else
      {
        $this -> manualRun();
      }
    }
    else if (is_string($hookResult))
    {
      $this -> output($hookResult);
    }
    else
    {
      throw new UnexpectedException('Unexpected result type', 50801);
    }
    $this -> di -> hook -> afterAutoRoute -> trigger($this);
  }

  public static function run()
  {
    $instance = new self();
    $filepath = $instance -> realFilePath;
    $extension = $instance -> realExtension;
    if (strtolower($extension) == 'php')
    {
      $instance -> autoRun();
    }
    else if (MIMETypes::isAssetFileType($extension) && is_file($filepath))
    {
      $instance -> di -> response -> header -> set('Content-Type', MIMETypes::getMIMEType($extension));
      $instance -> di -> response -> send(file_get_contents($filepath));
    }
    else
    {
      $instance -> autoRun();
    }
  }

  public function __construct()
  {
    parent::__construct();
    $this -> realScriptName = $this -> di -> request -> getRealScriptName();
    $this -> realFilePath = substr($this -> realScriptName, 1);
    $this -> realDirName = pathinfo($this -> realFilePath, PATHINFO_DIRNAME);
    $this -> realExtension = pathinfo($this -> realFilePath, PATHINFO_EXTENSION);
  }
}