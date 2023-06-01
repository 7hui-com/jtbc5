<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Template;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\Exception\UnexpectedException;

class TinyRenderer
{
  public static function render(...$args)
  {
    $result = null;
    if (Validation::isArrayList($args))
    {
      $argLength = count($args);
      if ($argLength >= 2 && $argLength <= 3)
      {
        if ($argLength == 2)
        {
          array_push($args, []);
        }
        list($firstArg, $secondArg, $variables) = $args;
        if (is_string($firstArg) && is_array($secondArg))
        {
          $renderer = new Renderer($firstArg, $variables);
          $result = $renderer -> render($secondArg);
        }
        else if (is_array($firstArg) && is_string($secondArg))
        {
          $renderer = new Renderer(null, $variables);
          $result = $renderer -> setTemplate($secondArg) -> render($firstArg);
        }
        else
        {
          throw new UnexpectedException('Unexpected argument(s)', 50801);
        }
      }
      else
      {
        throw new UnexpectedException('Unexpected argument(s)', 50801);
      }
    }
    else
    {
      $namedArgs = new Substance($args);
      $codename = $namedArgs -> codename;
      $template = $namedArgs -> template;
      $data = $namedArgs -> data;
      $variables = $namedArgs -> variables;
      if (is_array($data))
      {
        if (!is_array($variables))
        {
          $variables = [];
        }
        if (is_string($template))
        {
          $renderer = new Renderer(null, $variables);
          $result = $renderer -> setTemplate($template) -> render($data);
        }
        else if (is_string($codename))
        {
          $renderer = new Renderer($codename, $variables);
          $result = $renderer -> render($data);
        }
        else
        {
          throw new UnexpectedException('Unexpected argument(s)', 50801);
        }
      }
      else
      {
        throw new UnexpectedException('Unexpected argument(s)', 50801);
      }
    }
    return $result;
  }
}