<?php
namespace App\Universal\Tag;

class TagMapManager
{
  private $genre;
  private $associatedId;

  public function reset()
  {
    $model = new Model('map');
    $model -> where -> genre = $this -> genre;
    $model -> where -> associated_id = $this -> associatedId;
    $model -> pocket -> status = 0;
    $save = $model -> save();
    return is_numeric($save)? true: false;
  }

  public function update(int $argTagId)
  {
    $tagId = $argTagId;
    $result = null;
    $model = new Model('map');
    $model -> where -> genre = $this -> genre;
    $model -> where -> associated_id = $this -> associatedId;
    $model -> where -> tag_id = $tagId;
    $rs = $model -> get();
    if (!is_null($rs))
    {
      $model -> pocket -> status = 1;
      $save = $model -> save();
      $result = is_numeric($save)? true: false;
    }
    else
    {
      $newTagModel = new Model('map');
      $newTagModel -> pocket -> genre = $this -> genre;
      $newTagModel -> pocket -> associated_id = $this -> associatedId;
      $newTagModel -> pocket -> tag_id = $tagId;
      $newTagModel -> pocket -> status = 1;
      $save = $newTagModel -> save();
      $result = is_numeric($save)? true: false;
    }
    return $result;
  }

  public function batchUpdate(array $argTagIdArr)
  {
    $result = true;
    $tagIdArr = $argTagIdArr;
    foreach ($tagIdArr as $tagId)
    {
      if (!$this -> update($tagId))
      {
        $result = false;
      }
    }
    return $result;
  }

  public function __construct(string $argGenre, int $argAssociatedId)
  {
    $this -> genre = $argGenre;
    $this -> associatedId = $argAssociatedId;
  }
}