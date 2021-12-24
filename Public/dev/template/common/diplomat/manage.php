<?php
namespace Jtbc;
use Jtbc\Jtbc\Codename;
use Jtbc\Jtbc\JtbcReader;
use Jtbc\Jtbc\JtbcWriter;
use App\Console\Common\BasicSubstance;
use App\Console\Log\Logger;
use App\Console\Common\Ambassador;

class Diplomat extends Ambassador {
  public function selector(Request $req)
  {
    $mode = strval($req -> get('mode'));
    $genre = strval($req -> get('genre'));
    $bs = new BasicSubstance($this);
    $module = new Module($genre);
    if ($mode == 'genre')
    {
      $genreList = [];
      $childGenreList = $module -> getChildGenreList();
      foreach ($childGenreList as $childGenre)
      {
        $genreList[] = ['genre' => $childGenre, 'title' => Jtbc::take('global.' . $childGenre . ':guide.title', 'cfg')];
      }
      $bs -> data -> genreList = $genreList;
    }
    else if ($mode == 'file')
    {
      $bs -> data -> fileList = $module -> getFileList('template');
    }
    return $bs -> toJSON();
  }

  public function add(Request $req)
  {
    $file = strval($req -> get('file'));
    $genre = strval($req -> get('genre'));
    $filepath = strval($req -> get('filepath'));
    $bs = new BasicSubstance($this);
    $bs -> data -> filePath = $filepath;
    $bs -> data -> param = ['file' => $file, 'genre' => $genre];
    return $bs -> toJSON();
  }

  public function list(Request $req)
  {
    $file = strval($req -> get('file'));
    $genre = strval($req -> get('genre'));
    $node = strval($req -> get('node'));
    $nodeList = [];
    $filePath = $currentNode = $currentContent = null;
    $codename = Validation::isEmpty($genre)? 'global.' . $file . '.*': 'global.' . $genre . ':' . $file . '.*';
    $all = Jtbc::take($codename, 'tpl');
    if (!empty($all))
    {
      $myCodename = new Codename($codename, 'tpl');
      $filePath = realpath($myCodename -> getFilepath());
      $currentNode = array_key_exists($node, $all)? $node: array_key_first($all);
      $currentContent = $all[$currentNode];
      foreach (array_keys($all) as $key)
      {
        $nodeList[] = ['node' => $key];
      }
    }
    $bs = new BasicSubstance($this);
    $bs -> data -> filePath = $filePath;
    $bs -> data -> nodeList = $nodeList;
    $bs -> data -> param = ['file' => $file, 'genre' => $genre];
    $bs -> data -> data = ['node' => $currentNode, 'content' => $currentContent];
    return $bs -> toJSON();
  }

  public function actionAdd(Request $req)
  {
    $code = 0;
    $message = '';
    $ss = new Substance();
    $node = strval($req -> post('node'));
    $filepath = strval($req -> post('filepath'));
    $content = strval($req -> post('content'));
    if ($this -> guard -> role -> checkPermission('add'))
    {
      if (!is_file($filepath))
      {
        $code = 4001;
      }
      else if (!Validation::isNatural($node))
      {
        $code = 4002;
      }
      else if (JtbcReader::hasNode($filepath, $node))
      {
        $code = 4003;
      }
      else if (JtbcWriter::addNodeContent($filepath, 'tpl', $node, $content) === true)
      {
        $code = 1;
        Logger::log($this, 'manage.log-add', ['filepath' => $filepath, 'node' => $node]);
      }
      else
      {
        $code = 4040;
      }
    }
    else
    {
      $code = 4403;
      $message = Jtbc::take('::communal.text-tips-error-4403', 'lng');
    }
    $ss -> code = $code;
    $ss -> message = Jtbc::take('manage.text-add-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }

  public function actionEdit(Request $req)
  {
    $code = 0;
    $message = '';
    $ss = new Substance();
    $node = strval($req -> post('node'));
    $filepath = strval($req -> post('filepath'));
    $content = strval($req -> post('content'));
    if ($this -> guard -> role -> checkPermission('edit'))
    {
      if (!is_file($filepath))
      {
        $code = 4001;
      }
      else if (!Validation::isNatural($node))
      {
        $code = 4002;
      }
      else if (JtbcWriter::putNodeContent($filepath, 'tpl', $node, $content) === true)
      {
        $code = 1;
        Logger::log($this, 'manage.log-edit', ['filepath' => $filepath, 'node' => $node]);
      }
      else
      {
        $code = 4040;
      }
    }
    else
    {
      $code = 4403;
      $message = Jtbc::take('::communal.text-tips-error-4403', 'lng');
    }
    $ss -> code = $code;
    $ss -> message = Jtbc::take('manage.text-edit-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }

  public function actionDelete(Request $req)
  {
    $code = 0;
    $message = '';
    $ss = new Substance();
    $node = strval($req -> get('node'));
    $filepath = strval($req -> get('filepath'));
    if ($this -> guard -> role -> checkPermission('delete'))
    {
      if (!is_file($filepath))
      {
        $code = 4001;
      }
      else if (JtbcWriter::deleteNode($filepath, $node) === true)
      {
        $code = 1;
        Logger::log($this, 'manage.log-delete', ['filepath' => $filepath, 'node' => $node]);
      }
      else
      {
        $code = 4040;
      }
    }
    else
    {
      $code = 4403;
      $message = Jtbc::take('::communal.text-tips-error-4403', 'lng');
    }
    $ss -> code = $code;
    $ss -> message = Jtbc::take('manage.text-delete-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }
}