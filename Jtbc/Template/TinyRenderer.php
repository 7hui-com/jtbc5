<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Template;

class TinyRenderer
{
  public static function render(string $argCodeName, array $argData, array $argVariables = [])
  {
    $renderer = new Renderer($argCodeName, $argVariables);
    return $renderer -> render($argData);
  }
}