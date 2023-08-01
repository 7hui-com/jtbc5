<?php
namespace App\Common\Widgets\Breadcrumb;
use Jtbc\Jtbc;
use Jtbc\JSON;
use Jtbc\Path;
use Jtbc\Module;
use Jtbc\Substance;
use Jtbc\Validation;

class BreadcrumbBuilder
{
  private $genre;
  private $pocket = [];

  public function add(string $argText, string $argHref = null)
  {
    $text = $argText;
    $href = $argHref;
    $this -> pocket[] = is_null($href)? ['text' => $text]: ['text' => $text, 'href' => $href];
    return $this;
  }

  public function batchAdd(Substance $data)
  {
    foreach ($data as $item)
    {
      if (is_array($item))
      {
        if (array_key_exists('text', $item))
        {
          if (!array_key_exists('href', $item))
          {
            $this -> add($item['text']);
          }
          else
          {
            $this -> add($item['text'], $item['href']);
          }
        }
      }
    }
    return $this;
  }

  public function build()
  {
    return JSON::encode($this -> pocket);
  }

  public function getLastText()
  {
    $result = null;
    $count = count($this -> pocket);
    if ($count >= 1)
    {
      $item = $this -> pocket[$count - 1];
      if (is_array($item) && array_key_exists('text', $item))
      {
        $result = $item['text'];
      }
    }
    return $result;
  }

  public function getLastHref()
  {
    $result = null;
    $count = count($this -> pocket);
    if ($count >= 1)
    {
      for ($i = $count; $i > 0; $i --)
      {
        $item = $this -> pocket[$i - 1];
        if (is_array($item) && array_key_exists('text', $item) && array_key_exists('href', $item))
        {
          $result = $item;
          break;
        }
      }
    }
    return $result;
  }

  public function __get($argName)
  {
    return match($argName)
    {
      'genre' => $this -> genre,
      'pocket' => $this -> pocket,
      default => null,
    };
  }

  public function __construct(string $argGenre, $argWithHomePage = true)
  {
    $this -> genre = $genre = $argGenre;
    if ($argWithHomePage === true)
    {
      $this -> add(Jtbc::take('global.communal.home', 'lng'), Path::getActualRoute('./'));
    }
    if (!Validation::isEmpty($genre))
    {
      $currentFolder = '';
      $folders = explode('/', $genre);
      foreach ($folders as $folder)
      {
        $currentFolder = Validation::isEmpty($currentFolder)? $folder: $currentFolder . '/' . $folder;
        $currentModule = new Module($currentFolder);
        $this -> add($currentModule -> getTitle(), $currentModule -> getPath() . '/');
      }
    }
  }
}