<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;

class Kernel
{
  public static function getVersion()
  {
    return intval(Jtbc::take('global.root.version', 'cfg'));
  }

  public static function getVersionString()
  {
    return Converter::convertToVersionString(self::getVersion());
  }
}