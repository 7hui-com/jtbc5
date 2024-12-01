<?php
namespace App\Common\Interface;
use Jtbc\Substance;

interface SMS
{
  public function send(string $argMobile, string $argTemplateCode, array $argParam, ?array $argExtension = null): Substance;
}