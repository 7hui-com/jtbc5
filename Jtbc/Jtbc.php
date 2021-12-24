<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;
use Jtbc\Jtbc\Codename;
use Jtbc\Jtbc\JtbcReader;
use Jtbc\Jtbc\JtbcParser;
use Jtbc\String\StringHelper;

class Jtbc
{
  public static function getConfig(string $argName)
  {
    $result = null;
    $name = $argName;
    if (!Validation::isEmpty($name))
    {
      $result = self::take('config.' . $name, 'cfg');
      if (is_null($result))
      {
        $genre = Path::getCurrentGenre();
        while (str_contains($genre, '/') && is_null($result))
        {
          $genre = Path::getParentGenre($genre);
          $result = self::take('global.' . $genre . ':config.' . $name, 'cfg');
        }
      }
    }
    $result = $result ?? self::take('global.config.' . $name, 'cfg');
    return $result;
  }

  public static function take($argCodename, $argType = null, bool $argParse = false, $argVars = null, $argNodeName = null)
  {
    $result = null;
    $type = $argType;
    $codename = $argCodename;
    $parse = $argParse;
    $vars = $argVars;
    $nodeName = $argNodeName;
    $ns = __NAMESPACE__;
    if (is_array($codename))
    {
      $result = [];
      foreach ($codename as $val)
      {
        $result[$val] = self::take($val, $type, $parse, $vars, $nodeName);
      }
    }
    else
    {
      $genre = Path::getCurrentGenre();
      if (is_null($type)) list($type, $parse) = ['tpl', true];
      $myCodename = new Codename($codename, $type, debug_backtrace());
      $thisPath = $myCodename -> getPath();
      $thisGenre = $myCodename -> getGenre();
      $thisFilename = $myCodename -> getFilename();
      $filePath = $myCodename -> getFilepath();
      $keyword = $myCodename -> getKeyword();
      $jtbcData = JtbcReader::getData($filePath, $type, $nodeName, ['genre' => $genre, 'this.genre' => $thisGenre]);
      if ($keyword == '*') $result = $jtbcData;
      else if (str_contains($keyword, ','))
      {
        $result = [];
        $keywordAry = explode(',', $keyword);
        foreach($keywordAry as $val)
        {
          $result[$val] = self::take($thisPath . '.' . $val, $type, $parse, $vars, $nodeName);
        }
      }
      else if (array_key_exists($keyword, $jtbcData)) $result = $jtbcData[$keyword];
      else
      {
        if (str_contains($keyword, '->'))
        {
          $realKeyword = StringHelper::getClipedString($keyword, '->', 'left');
          $childKeyword = StringHelper::getClipedString($keyword, '->', 'right+');
          $resultTemp = $jtbcData[$realKeyword];
          $result = JSON::getValueFromJSON($resultTemp, $childKeyword);
        }
      }
      if (is_string($result))
      {
        $result = str_replace('{$>genre}', $genre, $result);
        $result = str_replace('{$>this.genre}', $thisGenre, $result);
        if ($type == 'tpl')
        {
          $result = str_replace('{$>ns}', $ns . '\\', $result);
          $result = str_replace('{$>lang}', Env::getLang(), $result);
          $result = str_replace('{$>this.path}', $thisPath, $result);
          $result = str_replace('{$>this.filename}', $thisFilename, $result);
          $result = str_replace('{$>self.path}', 'global.' . $thisGenre . ':' . $thisFilename, $result);
          $result = str_replace('{$>self.prefix}', 'global.' . $thisGenre . ':', $result);
          $result = JtbcParser::preParse($result);
        }
        if (is_array($vars))
        {
          foreach ($vars as $key => $val) $result = str_replace('{$[' . $key . ']}', $val, $result);
        }
        if ($parse == true)
        {
          $result = JtbcParser::parse($result);
        }
      }
    }
    return $result;
  }
}