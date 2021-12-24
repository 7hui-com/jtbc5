<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Exception;
use Jtbc\Template\Renderer;

class Handler
{
  public static function output($argException)
  {
    $exception = $argException;
    $variables = [
      'code' => $exception -> getCode(),
      'message' => $exception -> getMessage(),
      'file' => $exception -> getFile(),
      'line' => $exception -> getLine(),
    ];
    $data = [];
    $trace = $exception -> getTrace();
    foreach ($trace as $item)
    {
      $data[] = [
        'file' => array_key_exists('file', $item)? $item['file']: null,
        'line' => array_key_exists('line', $item)? $item['line']: null,
        'function' => array_key_exists('function', $item)? $item['function']: null,
        'class' => array_key_exists('class', $item)? $item['class']: null,
        'type' => array_key_exists('type', $item)? $item['type']: null,
      ];
    }
    http_response_code(500);
    $renderer = new Renderer('universal:httpStatus.500', $variables);
    print($renderer -> render($data));
  }
}