<?php
namespace App\Universal\Category;
use Jtbc\Path;
use Jtbc\Model\TinyModel;

class Model extends TinyModel
{
  public function __construct($argAutoFilter = true)
  {
    $this -> autoFilter = $argAutoFilter;
    parent::__construct(genre: Path::getCurrentGenreByNS(__NAMESPACE__));
  }
}