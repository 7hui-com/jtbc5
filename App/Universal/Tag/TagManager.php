<?php
namespace App\Universal\Tag;
use Jtbc\JSON;
use Jtbc\Validation;

class TagManager
{
  private $genre;
  private $lang;
  private $associatedId;
  private $tagMapReader;
  private $tagMapManager;

  public function getTagId(string $argTag)
  {
    $tagId = 0;
    $tag = $argTag;
    if (!Validation::isEmpty($tag))
    {
      $model = new Model();
      $model -> where -> genre = $this -> genre;
      $model -> where -> lang = $this -> lang;
      $model -> where -> tag = $tag;
      $rs = $model -> get();
      if (!is_null($rs))
      {
        $tagId = intval($rs -> id);
      }
      else
      {
        $newTagModel = new Model();
        $newTagModel -> pocket -> genre = $this -> genre;
        $newTagModel -> pocket -> lang = $this -> lang;
        $newTagModel -> pocket -> tag = $tag;
        $save = $newTagModel -> save();
        if (is_numeric($save))
        {
          $tagId = intval($newTagModel -> lastInsertId);
        }
      }
    }
    return $tagId;
  }

  public function update(string $argTagJSON)
  {
    $result = false;
    $tagJSON = $argTagJSON;
    if (Validation::isJSON($tagJSON))
    {
      $result = true;
      $tagArr = JSON::decode($tagJSON);
      $this -> tagMapManager -> reset();
      foreach ($tagArr as $tag)
      {
        if (!Validation::isEmpty($tag))
        {
          $tagId = $this -> getTagId($tag);
          if (!$this -> tagMapManager -> update($tagId))
          {
            $result = false;
          }
        }
      }
      $associatedMapArr = $this -> tagMapReader -> getList($this -> associatedId);
      foreach ($associatedMapArr as $associatedMap)
      {
        $currentTagId = $associatedMap -> tag_id;
        $updateModel = new Model();
        $updateModel -> where -> id = $currentTagId;
        $updateModel -> pocket -> associated_count = $this -> tagMapReader -> getAssociatedCountByTagId($currentTagId);
        $updateModel -> save();
      }
    }
    return $result;
  }

  public function __construct(string $argGenre, int $argLang, int $argAssociatedId)
  {
    $this -> genre = $argGenre;
    $this -> lang = $argLang;
    $this -> associatedId = $argAssociatedId;
    $this -> tagMapReader = new TagMapReader($this -> genre);
    $this -> tagMapManager = new TagMapManager($this -> genre, $this -> associatedId);
  }
}