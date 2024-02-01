<?php
namespace Jtbc\Outputter;
use Jtbc\Substance;

class JSONOutputter
{
  public static function output(int $argCode, string $argMessage = null, array $argData = null)
  {
    $code = $argCode;
    $message = $argMessage;
    $data = $argData;
    $ss = new Substance();
    $ss -> code = $code;
    if (is_string($message))
    {
      $ss -> message = $message;
    }
    if (is_array($data))
    {
      $ss -> data = $data;
    }
    return $ss -> toJSON();
  }
}