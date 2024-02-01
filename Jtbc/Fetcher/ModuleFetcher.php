<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Fetcher;
use Jtbc\Substance;
use Jtbc\Module\ModuleHelper;

class ModuleFetcher
{
  public static function fetch(array $argParam)
  {
    $param = $argParam;
    $prefixFolderName = '';
    $ss = new Substance($param);
    if ($ss -> exists('parent'))
    {
      $parent = $ss -> parent;
      if (is_string($parent))
      {
        $prefixFolderName = str_ends_with($parent, '/')? $parent: $parent . '/';
      }
    }
    $guideFileName = $ss -> exists('guide')? strval($ss -> guide): 'guide';
    $isCacheable = $ss -> exists('cacheable')? boolval($ss -> cacheable): true;
    return ModuleHelper::fetch($prefixFolderName, $guideFileName, $isCacheable);
  }
}