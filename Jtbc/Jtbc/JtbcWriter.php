<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Jtbc;
use DOMXPath;
use DOMDocument;

class JtbcWriter
{
  public static function setConfigureValue(string $argSourcefile, string $argTagName, string $argTagValue)
  {
    $result = null;
    $sourceFile = $argSourcefile;
    $tagName = $argTagName;
    $tagValue = $argTagValue;
    $limitedTagName = ['node', 'field', 'base'];
    if (!in_array($tagName, $limitedTagName) && is_file($sourceFile))
    {
      $doc = new DOMDocument();
      $doc -> formatOutput = true;
      $doc -> preserveWhiteSpace = false;
      $doc -> load($sourceFile);
      $xpath = new DOMXPath($doc);
      $query = '//xml/configure/' . $tagName;
      $matchs = $xpath -> query($query);
      if ($matchs -> length == 1)
      {
        $currentTag = $matchs -> item(0);
        $currentTag -> nodeValue = $tagValue;
        $result = @$doc -> save($sourceFile)? true: false;
      }
    }
    return $result;
  }

  public static function addNodeContent(string $argSourcefile, string $argType, string $argNodeKey, string $argNodeData, $argNodeName = null)
  {
    $result = null;
    $sourceFile = $argSourcefile;
    $type = $argType;
    $nodeName = $argNodeName ?? JtbcReader::getCurrentNodeName($type);
    $nodeKey = $argNodeKey;
    $nodeData = $argNodeData;
    if (is_file($sourceFile))
    {
      $doc = new DOMDocument();
      $doc -> formatOutput = true;
      $doc -> preserveWhiteSpace = false;
      $doc -> load($sourceFile);
      $xpath = new DOMXPath($doc);
      $query = '//xml/item_list';
      $matchs = $xpath -> query($query);
      if ($matchs -> length == 1)
      {
        $itemList = $matchs -> item(0);
        $newItem = $doc -> createElement('item');
        $newItemName = $doc -> createElement('name');
        $newItemName -> appendChild($doc -> createCDATASection($nodeKey));
        $newItemData = $doc -> createElement($nodeName);
        $newItemData -> appendChild($doc -> createCDATASection($nodeData));
        $newItem -> appendChild($newItemName);
        $newItem -> appendChild($newItemData);
        $itemList -> appendChild($newItem);
        $result = @$doc -> save($sourceFile)? true: false;
      }
    }
    return $result;
  }

  public static function putNodeContent(string $argSourcefile, string $argType, string $argNodeKey, string $argNodeData, $argNodeName = null)
  {
    $result = null;
    $sourceFile = $argSourcefile;
    $type = $argType;
    $nodeName = $argNodeName ?? JtbcReader::getCurrentNodeName($type);
    $nodeKey = $argNodeKey;
    $nodeData = $argNodeData;
    if (is_file($sourceFile))
    {
      $doc = new DOMDocument();
      $doc -> formatOutput = true;
      $doc -> preserveWhiteSpace = false;
      $doc -> load($sourceFile);
      $xpath = new DOMXPath($doc);
      $query = '//xml/item_list/item/name[.="' . htmlspecialchars($nodeKey) . '"]';
      $matchs = $xpath -> query($query);
      if ($matchs -> length == 0)
      {
        $result = false;
      }
      else
      {
        foreach ($matchs as $match)
        {
          $item = $match -> parentNode;
          $targetNodeList = $item -> getElementsByTagName($nodeName);
          if ($targetNodeList -> length == 0)
          {
            $newNode = $doc -> createElement($nodeName);
            $newNode -> appendChild($doc -> createCDATASection($nodeData));
            $item -> appendChild($newNode);
          }
          else
          {
            foreach ($targetNodeList as $targetNode)
            {
              $targetNode -> nodeValue = '';
              $targetNode -> appendChild($doc -> createCDATASection($nodeData));
            }
          }
        }
        $result = @$doc -> save($sourceFile)? true: false;
      }
    }
    return $result;
  }

  public static function deleteNode(string $argSourcefile, string $argNodeKey)
  {
    $result = null;
    $sourceFile = $argSourcefile;
    $nodeKey = $argNodeKey;
    if (is_file($sourceFile))
    {
      $doc = new DOMDocument();
      $doc -> formatOutput = true;
      $doc -> preserveWhiteSpace = false;
      $doc -> load($sourceFile);
      $xpath = new DOMXPath($doc);
      $query = '//xml/item_list/item/name[.="' . htmlspecialchars($nodeKey) . '"]';
      $matchs = $xpath -> query($query);
      if ($matchs -> length == 0)
      {
        $result = false;
      }
      else
      {
        foreach ($matchs as $match)
        {
          $item = $match -> parentNode;
          $item -> parentNode -> removeChild($item);
        }
        $result = @$doc -> save($sourceFile)? true: false;
      }
    }
    return $result;
  }
}