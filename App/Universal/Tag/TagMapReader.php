<?php
namespace App\Universal\Tag;

class TagMapReader
{
  private $genre;

  public function getList(int $argAssociatedId = null, int $argStatus = null)
  {
    $status = $argStatus;
    $associatedId = $argAssociatedId;
    $model = new Model('map');
    $model -> where -> genre = $this -> genre;
    if (!is_null($associatedId))
    {
      $model -> where -> associated_id = $associatedId;
    }
    if (!is_null($status))
    {
      $model -> where -> status = $status;
    }
    return $model -> getAll();
  }

  public function getAssociatedCountByTagId(int $argTagId)
  {
    $tagId = $argTagId;
    $model = new Model('map');
    $model -> where -> genre = $this -> genre;
    $model -> where -> tag_id = $tagId;
    $model -> where -> status = 1;
    return $model -> getCount();
  }

  public function __construct(string $argGenre)
  {
    $this -> genre = $argGenre;
  }
}