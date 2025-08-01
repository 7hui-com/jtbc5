<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Jtbc;
use DOMXPath;
use DOMDocument;
use Jtbc\Encoder;

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
      $result = false;
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
        $fileContent = $doc -> saveXML();
        if (is_string($fileContent))
        {
          if (@file_put_contents($sourceFile, trim(Encoder::unifyLineEndings($fileContent))) !== false)
          {
            $result = true;
          }
        }
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
      $result = false;
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
        $fileContent = $doc -> saveXML();
        if (is_string($fileContent))
        {
          if (@file_put_contents($sourceFile, trim(Encoder::unifyLineEndings($fileContent))) !== false)
          {
            $result = true;
          }
        }
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
      $result = false;
      $doc = new DOMDocument();
      $doc -> formatOutput = true;
      $doc -> preserveWhiteSpace = false;
      $doc -> load($sourceFile);
      $xpath = new DOMXPath($doc);
      $query = '//xml/item_list/item/name[.="' . htmlspecialchars($nodeKey) . '"]';
      $matchs = $xpath -> query($query);
      if ($matchs -> length != 0)
      {
        foreach ($matchs as $match)
        {
          $item = $match -> parentNode;
          if (!is_null($item))
          {
            $isFound = false;
            foreach ($item -> childNodes as $childNode)
            {
              if ($childNode -> nodeName == $nodeName)
              {
                $isFound = true;
                $childNode -> nodeValue = '';
                $childNode -> appendChild($doc -> createCDATASection($nodeData));
              }
            }
            if ($isFound === false)
            {
              $newNode = $doc -> createElement($nodeName);
              $newNode -> appendChild($doc -> createCDATASection($nodeData));
              $item -> appendChild($newNode);
            }
          }
        }
        $fileContent = $doc -> saveXML();
        if (is_string($fileContent))
        {
          if (@file_put_contents($sourceFile, trim(Encoder::unifyLineEndings($fileContent))) !== false)
          {
            $result = true;
          }
        }
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
      $result = false;
      $doc = new DOMDocument();
      $doc -> formatOutput = true;
      $doc -> preserveWhiteSpace = false;
      $doc -> load($sourceFile);
      $xpath = new DOMXPath($doc);
      $query = '//xml/item_list/item/name[.="' . htmlspecialchars($nodeKey) . '"]';
      $matchs = $xpath -> query($query);
      if ($matchs -> length != 0)
      {
        foreach ($matchs as $match)
        {
          $item = $match -> parentNode;
          $item -> parentNode -> removeChild($item);
        }
        $fileContent = $doc -> saveXML();
        if (is_string($fileContent))
        {
          if (@file_put_contents($sourceFile, trim(Encoder::unifyLineEndings($fileContent))) !== false)
          {
            $result = true;
          }
        }
      }
    }
    return $result;
  }
}