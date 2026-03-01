<?php
namespace App\Universal\Tag;
use Jtbc\Path;
use Jtbc\Validation;
use Jtbc\Model\TinyModel;

class Model extends TinyModel
{
  public function __construct(?string $argSubTable = null)
  {
    $subTable = $argSubTable;
    $args = ['genre' => Path::getCurrentGenreByNS(__NAMESPACE__)];
    if (!Validation::isEmpty($subTable))
    {
      $args['subtable'] = $subTable;
    }
    parent::__construct(...$args);
  }
}