<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Auth;

interface Guard
{
  public function checkLogin();
  public function checkToken();
  public function createToken(array $argInfo, int $argRemember);
  public function getRole(): Role;
  public function login(string $argUsername, string $argPassword, int $argRemember);
  public function logout();
}