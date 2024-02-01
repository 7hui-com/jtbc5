<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Auth;
use Jtbc\Substance;

interface Account
{
  public function getId(): ?int;
  public function getProfile(): ?Substance;
  public function isLogin(): bool;
  public function getRole(): Role;
}