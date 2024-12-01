<?php
namespace App\Universal\Category;
use Jtbc\Env;

class CategoryHelper
{
  public static function getFamily(string $argGenre, int $argFatherId, bool $argIncludeSelf = true, ?int $argLang = null, ?int $argPublished = null)
  {
    $genre = $argGenre;
    $fatherId = $argFatherId;
    $includeSelf = $argIncludeSelf;
    $lang = $argLang ?? Env::getLang();
    $published = $argPublished;
    $category = new Category($genre, $lang, $published);
    return $category -> getChildIdById($fatherId, $includeSelf);
  }

  public static function getIdByTitle(string $argGenre, string $argTitle, ?int $argLang = null, ?int $argPublished = null)
  {
    $result = null;
    $genre = $argGenre;
    $title = $argTitle;
    $lang = $argLang ?? Env::getLang();
    $published = $argPublished;
    $category = new Category($genre, $lang, $published);
    $list = $category -> getList();
    foreach ($list as $item)
    {
      $currentId = intval($item['id']);
      $currentTitle = strval($item['title']);
      if (trim($currentTitle) == trim($title))
      {
        $result = $currentId;
        break;
      }
    }
    return $result;
  }

  public static function getNearestFatherId(string $argGenre, int $argId, ?int $argLang = null, ?int $argPublished = null)
  {
    $id = $argId;
    $genre = $argGenre;
    $lang = $argLang ?? Env::getLang();
    $published = $argPublished;
    $category = new Category($genre, $lang, $published);
    $children = $category -> getChildIdById($id);
    return empty($children)? intval(self::getRecordById($genre, $id, 'father_id', $lang, $published)): $id;
  }

  public static function getRecordById(string $argGenre, int $argId, ?string $argFieldName = null, ?int $argLang = null, ?int $argPublished = null)
  {
    $id = $argId;
    $genre = $argGenre;
    $fieldName = $argFieldName;
    $lang = $argLang ?? Env::getLang();
    $published = $argPublished;
    $category = new Category($genre, $lang, $published);
    return $category -> getRecordById($id, $fieldName);
  }

  public static function getTitleById(string $argGenre, int $argId, ?int $argLang = null, ?int $argPublished = null)
  {
    return strval(self::getRecordById($argGenre, $argId, 'title', $argLang, $argPublished));
  }
}