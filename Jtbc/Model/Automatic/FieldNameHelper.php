<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Model\Automatic;
use Jtbc\Jtbc;
use Jtbc\Path;
use Jtbc\Validation;

class FieldNameHelper
{
  public static function getFieldText(string $argFieldName, string $argGenre = null)
  {
    $result = null;
    $fieldName = $argFieldName;
    $genre = $argGenre ?? Path::getCurrentGenre();
    if (Validation::isNatural($fieldName))
    {
      if (Validation::isEmpty($genre))
      {
        $result = Jtbc::take('global.config.' . $fieldName, 'lng') ?? ucfirst($fieldName);
      }
      else
      {
        $result = Jtbc::take('global.' . $genre . ':config.' . $fieldName, 'lng') ?? Jtbc::take('universal:config.' . $fieldName, 'lng') ?? ucfirst($fieldName);
      }
    }
    return $result;
  }
}