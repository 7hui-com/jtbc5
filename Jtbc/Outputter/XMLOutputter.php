<?php
namespace Jtbc\Outputter;
use DOMDocument;
use DOMElement;
use Jtbc\Substance;

class XMLOutputter
{
  public static function output(int $argCode, string $argMessage = null, array $argData = null)
  {
    $code = $argCode;
    $message = $argMessage;
    $data = $argData;
    $doc = new DOMDocument();
    $xml = $doc -> createElement('xml');
    $xml -> setAttribute('code', $code);
    if (is_string($message))
    {
      $xml -> setAttribute('message', $message);
    }
    if (is_array($data))
    {
      $createChildNode = function(DOMElement $parent, array $data) use (&$doc, &$createChildNode)
      {
        foreach ($data as $key => $value)
        {
          $el = $doc -> createElement((is_string($key)? $key: 'item') ?: 'item');
          if (is_bool($value))
          {
            $el -> appendChild($doc -> createCDATASection($value? 'true': 'false'));
          }
          else if (is_int($value) || is_float($value))
          {
            $el -> appendChild($doc -> createCDATASection(strval($value)));
          }
          else if (is_string($value))
          {
            $el -> appendChild($doc -> createCDATASection($value));
          }
          else if (is_array($value))
          {
            $createChildNode($el, $value);
          }
          else if ($value instanceof Substance)
          {
            $createChildNode($el, $value -> toArray());
          }
          $parent -> appendChild($el);
        }
      };
      $createChildNode($xml, $data);
    }
    return $doc -> saveXML($xml);
  }
}