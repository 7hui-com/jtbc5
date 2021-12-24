<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Template;
use Jtbc\Encoder;
use Jtbc\Exception\NotSupportedException;

class Template
{
  private $template;
  private $placeHolder = 'JTBC_TEMPLATE_PLACEHOLDER';
  private $placeHolderIndex = 0;
  private $loopGroup = [];
  private $loopGroupLine = [];

  private function initLoopGroup(string $argIdentifier)
  {
    $identifier = $argIdentifier;
    $template = $this -> template;
    $substrCount = substr_count($template, $identifier);
    if ($substrCount == 0)
    {
      $this -> loopGroupLine[] = '';
      $this -> loopGroup[] = $this -> template;
      $this -> template = '<!--' . $this -> placeHolder . '_' . $this -> placeHolderIndex . '-->';
    }
    else if ($substrCount % 2 == 0)
    {
      $tempArray = explode($identifier, $template);
      for ($i = 1; $i < $substrCount; $i = $i + 2)
      {
        $this -> loopGroupLine[] = '';
        $this -> loopGroup[] = $tempArray[$i];
        $tempArray[$i] = '<!--' . $this -> placeHolder . '_' . $this -> placeHolderIndex . '-->';
        $this -> placeHolderIndex += 1;
      }
      $this -> placeHolderIndex -= 1;
      $this -> template = implode($tempArray);
    }
    else
    {
      throw new NotSupportedException('The sum of identifiers can only be even', 50415);
    }
  }

  public function assign(array $argVars, callable $loopCallBack = null)
  {
    $vars = $argVars;
    foreach ($vars as $item)
    {
      $this -> insertLoopGroupLine($item, $loopCallBack);
    }
    return $this;
  }

  public function insertLoopGroupLine(array $argData, callable $loopCallBack = null)
  {
    $data = $argData;
    $placeHolderIndex = $this -> placeHolderIndex;
    for ($i = 0; $i <= $placeHolderIndex; $i ++)
    {
      $loopGroup = $this -> loopGroup[$i];
      $loopGroupLine = $this -> loopGroupLine[$i];
      foreach ($data as $key => $val)
      {
        if (is_scalar($val) || is_null($val))
        {
          $loopGroup = str_replace('{$' . $key . '}', Encoder::htmlEncode($val), $loopGroup);
        }
      }
      if (is_callable($loopCallBack))
      {
        $loopGroup = $loopCallBack($loopGroup);
      }
      $this -> loopGroupLine[$i] = $loopGroupLine . $loopGroup;
    }
    return $this;
  }

  public function getResult(callable $templateParser = null)
  {
    $placeHolderIndex = $this -> placeHolderIndex;
    $result = is_null($templateParser)? $this -> template: $templateParser($this -> template);
    for ($i = 0; $i <= $placeHolderIndex; $i ++)
    {
      $loopGroupLine = $this -> loopGroupLine[$i];
      $result = str_replace('<!--' . $this -> placeHolder . '_' . $i . '-->', $loopGroupLine, $result);
    }
    return $result;
  }

  public function __construct(string $argTemplate, array $argVariables = [], string $argIdentifier = '{@}')
  {
    $template = $argTemplate;
    $variables = $argVariables;
    $identifier = $argIdentifier;
    foreach ($variables as $key => $val)
    {
      if (is_scalar($val) || is_null($val))
      {
        $template = str_replace('{$[' . $key . ']}', Encoder::htmlEncode($val), $template);
      }
    }
    $this -> template = $template;
    $this -> initLoopGroup($identifier);
  }
}