<?php
namespace Jtbc;
use Jtbc\Model\TinyModel;
use App\Console\Common\Ambassador;
use App\Console\Common\EmptySubstance;
use App\Console\Common\BasicSubstance;
use App\Universal\Category\Guide;
use App\Universal\Category\Category;
use App\Console\Common\Traits\Action;

class Diplomat extends Ambassador {
  use Action\Typical\Add;
  use Action\Typical\Edit;
  use Action\Typical\Delete;
  use Action\Typical\Batch;
  use Action\Typical\Order;
  use Action\Typical\Upload;

  public function __initialize()
  {
    if ($this -> di -> request -> get('type') == 'filter')
    {
      $this -> isPublic = true;
    }
  }

  public function __start()
  {
    $removeCache = function()
    {
      $this -> di -> cache -> removeByKey('universal-category-');
    };
    $this -> hook -> afterAutoSave = $removeCache;
    $this -> hook -> afterOrder = $removeCache;
    $this -> hook -> afterDelete = $removeCache;
    $this -> hook -> afterBatchDelete = $removeCache;
    $this -> hook -> afterBatchPublish = $removeCache;
  }

  public function add(Request $req)
  {
    $genre = strval($req -> get('genre'));
    $fatherId = intval($req -> get('father_id'));
    $extender = Guide::getGenreParam($genre, 'extender');
    $bs = new BasicSubstance($this);
    $bs -> data -> genre = $genre;
    $bs -> data -> fatherId = $fatherId;
    $bs -> data -> property = Guide::getGenreProperty($genre);
    $bs -> data -> extender = [
      'enabled' => is_null($extender)? false: true,
      'columns' => is_null($extender)? '[]': $extender,
    ];
    return $bs -> toJSON();
  }

  public function edit(Request $req)
  {
    $data = [];
    $property = [];
    $extender = null;
    $status = 200;
    $id = intval($req -> get('id'));
    $model = new TinyModel();
    $model -> where -> id = $id;
    $rs = $model -> get();
    $bs = new BasicSubstance($this);
    if (is_null($rs))
    {
      $status = 404;
    }
    else
    {
      $data = $rs -> toArray();
      $property = Guide::getGenreProperty($rs -> genre);
      $extender = Guide::getGenreParam($rs -> genre, 'extender');
    }
    $bs -> data -> data = $data;
    $bs -> data -> status = $status;
    $bs -> data -> property = $property;
    $bs -> data -> extender = [
      'enabled' => is_null($extender)? false: true,
      'columns' => is_null($extender)? '[]': $extender,
    ];
    return $bs -> toJSON();
  }

  public function list(Request $req)
  {
    $genre = strval($req -> get('genre'));
    $fatherId = intval($req -> get('father_id'));
    $lang = $this -> guard -> role -> getLang();
    $data = [];
    $genreTitle = '';
    $genreMode = 'normal';
    $allGenre = Guide::getAllGenre();
    $fatherGroup = [];
    if (Validation::isEmpty($genre) || !in_array($genre, $allGenre) || !Guide::isValidGenre($genre))
    {
      $genre = Guide::getFirstValidGenre();
    }
    if (!is_null($genre))
    {
      $model = new TinyModel();
      $model -> where -> genre = $genre;
      $model -> where -> father_id = $fatherId;
      $model -> where -> lang = $lang;
      $model -> orderBy('order', 'desc');
      $model -> orderBy('id', 'asc');
      $data = $model -> getAll(['id', 'title', 'published', 'time']);
      $category = new Category($genre, $lang);
      $genreMode = strval(Guide::getGenreMode($genre));
      $genreTitle = strval(Guide::getGenreTitle($genre));
      $fatherGroup = $category -> getFatherGroupById($fatherId, true);
    }
    $bs = new BasicSubstance($this);
    $bs -> data -> genre = $genre;
    $bs -> data -> genreMode = $genreMode;
    $bs -> data -> genreTitle = $genreTitle;
    $bs -> data -> allGenre = Guide::getAllGenreTitle();
    $bs -> data -> fatherId = $fatherId;
    $bs -> data -> fatherGroup = $fatherGroup;
    $bs -> data -> data = $data;
    return $bs -> toJSON();
  }

  public function filter(Request $req)
  {
    $data = [];
    $genreMode = 'normal';
    $genre = strval($req -> get('genre'));
    $fatherId = intval($req -> get('father_id'));
    $myCategory = strval($req -> get('myCategory'));
    if (Guide::isValidGenre($genre) && !Validation::isEmpty($myCategory))
    {
      $lang = $this -> guard -> role -> getLang();
      $genreMode = strval(Guide::getGenreMode($genre));
      $myCategoryArr = JSON::decode($myCategory);
      if (is_array($myCategoryArr))
      {
        $model = new TinyModel();
        $model -> where -> genre = $genre;
        $model -> where -> lang = $lang;
        if ($genreMode != 'flat')
        {
          $model -> where -> father_id = $fatherId;
        }
        $rsa = $model -> getAll(['id', 'title', 'genre']);
        foreach ($rsa as $item)
        {
          if (in_array($item -> id, $myCategoryArr))
          {
            $data[] = $item;
          }
        }
      }
    }
    $es = new EmptySubstance($this);
    $es -> data -> data = $data;
    return $es -> toJSON();
  }
}