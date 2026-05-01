<?php
namespace App\Universal\Tag;
use Jtbc\Validation;

class BatchProcessor
{
  public static function transfer(string $argGenre, string $argTargetGenre)
  {
    $result = false;
    $genre = $argGenre;
    $targetGenre = $argTargetGenre;
    if (!Validation::isEmpty($genre) && !Validation::isEmpty($targetGenre))
    {
      $model = new Model();
      $model -> where -> genre = $genre;
      $model -> pocket -> genre = $targetGenre;
      $re = $model -> save();
      if (is_numeric($re))
      {
        $result = true;
      }
    }
    return $result;
  }
}