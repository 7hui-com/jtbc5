<?php
namespace App\Universal\Upload;
use Jtbc\Request;
use Jtbc\Substance;

class chunkFile
{
  public $file;
  public $fileSize;
  public $chunkCount;
  public $chunkCurrentIndex;
  public $chunkParam;
  public $randomString;
  private $req;
  private $info;

  public function getName()
  {
    return $this -> info -> name;
  }

  public function getTmpName()
  {
    return $this -> info -> tmp_name;
  }

  public function getFileName()
  {
    return pathinfo($this -> getName(), PATHINFO_FILENAME);
  }

  public function getFileExtension()
  {
    return pathinfo($this -> getName(), PATHINFO_EXTENSION);
  }

  public function getCurrentURLScheme()
  {
    return $this -> req -> isHTTPS()? 'https://': 'http://';
  }

  public function __construct(Request $req)
  {
    $this -> req = $req;
    $this -> file = $req -> files('file');
    $this -> fileSize = intval($req -> post('fileSize'));
    $this -> chunkCount = intval($req -> post('chunkCount'));
    $this -> chunkCurrentIndex = intval($req -> post('chunkCurrentIndex'));
    $this -> chunkParam = strval($req -> post('chunkParam'));
    $this -> randomString = strval($req -> post('randomString'));
    $this -> info = new Substance($this -> file);
  }
}