<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Template;
use Jtbc\Env;
use Jtbc\Jtbc;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\Jtbc\JtbcParser;

class Renderer
{
  private $template;
  private $variables;
  private $envParamPrefix;
  private static $envParamPrefixCounter;

  private function getEnvParamPrefix()
  {
    self::$envParamPrefixCounter += 1;
    return 'RD' . self::$envParamPrefixCounter . '_';
  }

  public function getTemplate()
  {
    return $this -> template;
  }

  public function render(array $argData = [], ?callable $loopCallBack = null)
  {
    $result = '';
    $data = $argData;
    $template = $this -> template;
    $envParamPrefix = $this -> envParamPrefix;
    if (!Validation::isEmpty($template))
    {
      $tpl = new Template($template, $this -> variables);
      if (!empty($data))
      {
        $index = 0;
        foreach ($data as $item)
        {
          $index += 1;
          if ($item instanceof Substance)
          {
            $item = $item -> all();
          }
          $envParams = $item;
          if (!array_key_exists('raw', $envParams))
          {
            $envParams['raw'] = $item;
          }
          if (!array_key_exists('index', $envParams))
          {
            $envParams['index'] = $index;
          }
          Env::setParams($envParams, $envParamPrefix);
          $tpl -> insertLoopGroupLine($item, function($argLoopBody) use ($loopCallBack, $envParamPrefix){
            $loopBody = $argLoopBody;
            if (is_callable($loopCallBack))
            {
              $loopCallBack($loopBody);
            }
            $loopBody = JtbcParser::parse($loopBody, $envParamPrefix);
            return $loopBody;
          });
        }
      }
      $result = $tpl -> getResult(fn(...$args) => JtbcParser::parse(...$args));
    }
    return $result;
  }

  public function setTemplate(string $argTemplate)
  {
    $this -> template = $argTemplate;
    return $this;
  }

  public function __construct(?string $argCodename = null, array $argVariables = [], string $argEnvParamPrefix = '')
  {
    $codename = $argCodename;
    $variables = $argVariables;
    $envParamPrefix = $argEnvParamPrefix;
    $this -> variables = $variables;
    $this -> envParamPrefix = $envParamPrefix ?: $this -> getEnvParamPrefix();
    if (!Validation::isEmpty($codename))
    {
      $this -> setTemplate(Jtbc::take($codename, 'tpl'));
    }
  }
}