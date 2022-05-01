<?php
namespace App\Universal\Category;
use Jtbc\Env;
use Jtbc\Substance;

class CategoryHelper
{
  public static function getTitleById(string $argGenre, int $argId, int $argLang = null)
  {
    return strval(self::getRecordById($argGenre, $argId, 'title', $argLang));
  }

  public static function getRecordById(string $argGenre, int $argId, string $argFieldName = null, int $argLang = null)
  {
    $id = $argId;
    $genre = $argGenre;
    $fieldName = $argFieldName;
    $lang = $argLang ?? Env::getLang();
    $category = new Category($genre, $lang);
    return $category -> getRecordById($id, $fieldName);
  }

  public static function getFamily(string $argGenre, int $argFatherId, bool $argIncludeSelf = true, int $argLang = null, int $argPublished = null)
  {
    $genre = $argGenre;
    $fatherId = $argFatherId;
    $includeSelf = $argIncludeSelf;
    $lang = $argLang ?? Env::getLang();
    $published = $argPublished;
    $category = new Category($genre, $lang, $published);
    return $category -> getChildIdById($fatherId, $includeSelf);
  }
}