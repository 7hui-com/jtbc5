<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Auth;

interface Role
{
  public function getId();
  public function getName();
  public function getPermission(): Permission;
}