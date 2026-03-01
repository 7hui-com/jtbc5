<?php
namespace App\Universal\Dictionary;
use Jtbc\Path;
use Jtbc\Model\TinyModel;

class Model extends TinyModel
{
  public function __construct()
  {
    parent::__construct(genre: Path::getCurrentGenreByNS(__NAMESPACE__));
  }
}