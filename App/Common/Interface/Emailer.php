<?php
namespace App\Common\Interface;

interface Emailer
{
  public function send(string $argAddress, string $argSubject, string $argBody, array $argExtension = null): bool;
}