<?php
namespace App\Universal\Category;
use Jtbc\Substance;

class Navigation
{
  public static function getBreadcrumb(Category $category, int $argId, string $argHrefTemplate)
  {
    $id = $argId;
    $hrefTemplate = $argHrefTemplate;
    $result = new Substance();
    $fatherGroup = $category -> getFatherGroupById($id, true);
    foreach ($fatherGroup as $item)
    {
      $result[] = ['text' => $item['title'], 'href' => str_replace('#category#', $item['id'], $hrefTemplate)];
    }
    return $result;
  }

  public static function getNavById(Category $category, int $argId, string $argBaseURL)
  {
    $id = $argId;
    $baseurl = $argBaseURL;
    $result = [];
    $fatherGroup = $category -> getFatherGroupById($id, true);
    foreach ($fatherGroup as $item)
    {
      $result[] = ['title' => $item['title'], 'link' => $baseurl . '&category=' . $item['id']];
    }
    return $result;
  }
}