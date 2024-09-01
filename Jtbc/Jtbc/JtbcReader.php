<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Jtbc;
use DOMXPath;
use DOMDocument;
use Jtbc\Env;
use Jtbc\Jtbc;
use Jtbc\Validation;
use Jtbc\String\StringHelper;

class JtbcReader
{
  private static $param = [];

  public static function getCurrentNodeName($argType)
  {
    $result = null;
    $type = $argType;
    switch($type)
    {
      case 'lng':
        $result = Env::getLanguage();
        break;
      case 'tpl':
        $result = Env::getTemplate();
        break;
      default:
        $result = Env::getLanguage();
    }
    return $result;
  }

  public static function getDefaultNodeName(string $argField)
  {
    $result = null;
    $field = $argField;
    if (str_contains($field, ','))
    {
      $arr = explode(',', $field);
      if (count($arr) >= 2)
      {
        $result = $arr[1];
      }
    }
    return $result;
  }

  public static function getXMLAttr(string $argSourcefile, string $argAttrName)
  {
    $result = null;
    $sourceFile = $argSourcefile;
    $attrName = $argAttrName;
    if (is_file($sourceFile))
    {
      $doc = new DOMDocument();
      $doc -> load($sourceFile);
      $xpath = new DOMXPath($doc);
      $query = '//xml';
      $result = $xpath -> query($query) -> item(0) -> getAttribute($attrName);
    }
    return $result;
  }

  public static function getConfigure(string $argSourcefile, string $argTagName)
  {
    $result = null;
    $sourceFile = $argSourcefile;
    $tagName = $argTagName;
    if (is_file($sourceFile))
    {
      $doc = new DOMDocument();
      $doc -> load($sourceFile);
      $xpath = new DOMXPath($doc);
      $query = '//xml/configure/' . $tagName;
      $xq = $xpath -> query($query);
      if ($xq -> length == 1)
      {
        $result = $xq -> item(0) -> nodeValue;
      }
    }
    return $result;
  }

  public static function getData(string $argSourcefile, string $argType, $argNodeName = null, $argPointerVars = null)
  {
    $data = [];
    $sourceFile = $argSourcefile;
    $type = $argType;
    $nodeName = $argNodeName ?? self::getCurrentNodeName($type);
    $pointerVars = $argPointerVars;
    $dataKey = $sourceFile . ':' . $nodeName;
    if (array_key_exists($dataKey, self::$param))
    {
      $data = self::$param[$dataKey];
    }
    else
    {
      if (is_file($sourceFile))
      {
        $doc = new DOMDocument();
        $doc -> load($sourceFile);
        $xpath = new DOMXPath($doc);
        $query = '//xml/configure/node';
        $node = $xpath -> query($query) -> item(0) -> nodeValue;
        $query = '//xml/configure/field';
        $field = $xpath -> query($query) -> item(0) -> nodeValue;
        $query = '//xml/configure/base';
        $base = $xpath -> query($query) -> item(0) -> nodeValue;
        if (str_contains($field, ','))
        {
          $alias = [];
          $keyField = StringHelper::getClippedString($field, ',');
          if (!StringHelper::contains($field, $nodeName))
          {
            $nodeName = self::getDefaultNodeName($field);
          }
          $query = '//xml/' . $base . '/' . $node;
          $rests = $xpath -> query($query);
          foreach ($rests as $rest)
          {
            $nodeKey = $rest -> getElementsByTagName($keyField) -> item(0) -> nodeValue;
            $nodeDom = $rest -> getElementsByTagName($nodeName);
            if ($nodeDom -> length == 0)
            {
              $nodeDom = $rest -> getElementsByTagName(self::getDefaultNodeName($field));
            }
            $nodeDomObj = $nodeDom -> item(0);
            $nodeDomValue = $nodeDomObj -> nodeValue;
            if (!is_null($type) && Validation::isEmpty($nodeDomValue))
            {
              if ($nodeDomObj -> hasAttribute('pointer'))
              {
                $pointer = $nodeDomObj -> getAttribute('pointer');
                $pointerType = $nodeDomObj -> getAttribute('pointerType') ?? $type;
                if (!str_contains($pointer, '.')) $alias[$nodeKey] = $pointer;
                else
                {
                  if (is_array($pointerVars))
                  {
                    foreach ($pointerVars as $key => $val)
                    {
                      $pointer = str_replace('{$>' . $key . '}', $val, $pointer);
                    }
                  }
                  $nodeDomValue = Jtbc::take($pointer, $pointerType);
                }
              }
            }
            $data[$nodeKey] = $nodeDomValue;
          }
          if (!empty($alias))
          {
            foreach ($alias as $key => $val)
            {
              if (array_key_exists($val, $data)) $data[$key] = $data[$val];
            }
          }
        }
      }
      self::$param[$dataKey] = $data;
    }
    return $data;
  }

  public static function hasField(string $argSourcefile, string $argFieldName)
  {
    $result = null;
    $sourceFile = $argSourcefile;
    $fieldName = $argFieldName;
    if (is_file($sourceFile))
    {
      $result = StringHelper::contains(strval(self::getConfigure($sourceFile, 'field')), $fieldName);
    }
    return $result;
  }

  public static function hasNode(string $argSourcefile, string $argNodeKey)
  {
    $result = null;
    $sourceFile = $argSourcefile;
    $nodeKey = $argNodeKey;
    if (is_file($sourceFile))
    {
      $doc = new DOMDocument();
      $doc -> load($sourceFile);
      $xpath = new DOMXPath($doc);
      $query = '//xml/item_list/item/name[.="' . htmlspecialchars($nodeKey) . '"]';
      $finder = $xpath -> query($query);
      $result = $finder -> length == 0? false: true;
    }
    return $result;
  }
}