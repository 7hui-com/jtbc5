<?php
namespace Jtbc;
use Jtbc\Jtbc\JtbcWriter;
use Jtbc\Model\TinyModel;
use Jtbc\Model\Automatic\FieldNameHelper;
use Jtbc\Module\ModuleFinder;
use App\Common\Module\ModuleRecognizer;
use App\Console\Common\BasicSubstance;
use App\Console\Common\Ambassador;
use App\Console\Log\Logger;

class Diplomat extends Ambassador {
  public function setting(Request $req)
  {
    $genre = strval($req -> get('genre'));
    $tableName = strval($req -> get('tableName'));
    $data = [];
    $tableNameList = [];
    $path = [['title' => '/', 'genre' => '']];
    $module = new Module($genre);
    $parentGenreList = $module -> getParentGenreList();
    if ($module -> isSettingAble == true)
    {
      $moduleTableNameList = $module -> getTableNameList();
      if (Validation::isEmpty($tableName) || !in_array($tableName, $moduleTableNameList))
      {
        $tableName = current($moduleTableNameList);
      }
      foreach ($moduleTableNameList as $moduleTableName)
      {
        $tableNameList[] = ['tableName' => $moduleTableName];
      }
      if (!Validation::isEmpty($tableName))
      {
        $tinyModel = new TinyModel($tableName);
        $tableInfo = $tinyModel -> table -> getTableInfo();
        foreach ($tableInfo as $field)
        {
          $fieldControlLocked = true;
          $currentField = new Substance($field);
          $fieldComment = $currentField -> comment;
          $fieldText = FieldNameHelper::getFieldText($currentField -> field, $genre);
          if (Validation::isJSON($fieldComment))
          {
            $currentFieldComment = new Substance($fieldComment);
            if ($currentFieldComment -> locked != true)
            {
              if (!in_array($currentFieldComment -> mode, ['auto', 'manual']))
              {
                $fieldControlLocked = false;
              }
            }
            if (!is_null($currentFieldComment -> text))
            {
              $fieldText = $currentFieldComment -> text;
            }
          }
          $currentField -> field_control_locked = $fieldControlLocked;
          $currentField -> field_text = $fieldText;
          $data[] = $currentField;
        }
      }
    }
    else
    {
      $data = null;
    }
    foreach ($parentGenreList as $parentGenre)
    {
      if (!Validation::isEmpty($parentGenre))
      {
        $parentModule = new Module($parentGenre);
        $path[] = ['title' => $parentModule -> getFolderName() . '/', 'genre' => $parentModule -> getName()];
      }
    }
    $bs = new BasicSubstance($this);
    $bs -> data -> data = $data;
    $bs -> data -> path = $path;
    $bs -> data -> genre = $genre;
    $bs -> data -> tableName = $tableName;
    $bs -> data -> tableNameList = $tableNameList;
    return $bs -> toJSON();
  }

  public function list(Request $req)
  {
    $genre = strval($req -> get('genre'));
    $data = [];
    $path = [['title' => '/', 'genre' => '']];
    $module = new Module($genre);
    $childGenreList = $module -> getChildGenreList();
    $parentGenreList = $module -> getParentGenreList(true);
    foreach ($childGenreList as $childGenre)
    {
      $item = new Substance();
      $childModule = new Module($childGenre);
      $moduleRecognizer = new ModuleRecognizer($childGenre);
      if ($childModule -> isExists() && !$moduleRecognizer -> isConfusing())
      {
        $item -> name = $childModule -> getName();
        $item -> folder_name = $childModule -> getFolderName();
        $item -> title = $childModule -> getTitle(false);
        $item -> icon = $childModule -> guide -> icon;
        $item -> isCloneAble = $childModule -> isCloneAble;
        $item -> isUninstallAble = $childModule -> isUninstallAble;
        $item -> isSettingAble = $childModule -> isSettingAble;
        $item -> isParentModule = $childModule -> isParentModule;
        $item -> is_hide_mode = is_null($childModule -> guide -> link)? true: false;
        $item -> child_genre_count = count($childModule -> getChildGenreList());
        $data[] = $item;
      }
    }
    foreach ($parentGenreList as $parentGenre)
    {
      if (!Validation::isEmpty($parentGenre))
      {
        $parentModule = new Module($parentGenre);
        $path[] = ['title' => $parentModule -> getFolderName() . '/', 'genre' => $parentModule -> getName()];
      }
    }
    $bs = new BasicSubstance($this);
    $bs -> data -> data = $data;
    $bs -> data -> path = $path;
    $bs -> data -> genre = $genre;
    return $bs -> toJSON();
  }

  public function actionOrder(Request $req)
  {
    $code = 0;
    $message = '';
    $id = strval($req -> post('id'));
    $genre = strval($req -> get('genre'));
    if ($this -> guard -> role -> checkPermission('order'))
    {
      if (Validation::isEmpty($id))
      {
        $code = 4000;
      }
      else
      {
        $childFolders = JSON::decode($id);
        $genrePath = Path::getActualRoute(Validation::isEmpty($genre)? '.': $genre);
        if (is_array($childFolders) && is_dir($genrePath))
        {
          $guideFilePath = $genrePath . '/common/guide.jtbc';
          if (is_file($guideFilePath))
          {
            $folders = implode(',', $childFolders);
            $setConfigure = JtbcWriter::setConfigureValue($guideFilePath, 'order', $folders);
            if ($setConfigure === true)
            {
              $code = 1;
              $moduleFinder = new ModuleFinder();
              $moduleFinder -> removeCache();
              Logger::log($this, 'manage.log-order', ['folders' => $folders]);
            }
            else
            {
              $code = 4444;
            }
          }
          else
          {
            $code = 4002;
          }
        }
        else
        {
          $code = 4001;
        }
      }
    }
    else
    {
      $code = 4403;
      $message = Jtbc::take('::communal.text-tips-error-4403', 'lng');
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = $message;
    $result = $ss -> toJSON();
    return $result;
  }
}