<?php
namespace Jtbc;
use Jtbc\Jtbc\JtbcWriter;
use Jtbc\Model\TinyModel;
use Jtbc\DB\DBFactory;
use Jtbc\DB\Schema\Column;
use Jtbc\DB\Schema\ColumnLoader;
use Jtbc\DB\Schema\ColumnManager;
use Jtbc\DB\Schema\SchemaViewer;
use Jtbc\String\StringHelper;
use App\Common\Config\ConfigSourcesScanner;
use App\Console\Common\BasicSubstance;
use App\Console\Common\Ambassador;
use App\Console\Log\Logger;
use App\Universal\Dictionary\Dictionary;

class Diplomat extends Ambassador {
  private function getColumn(Substance $argInfo)
  {
    $info = $argInfo;
    $hasDefaultValue = false;
    $fieldName = $info -> field_name;
    $fieldText = $info -> field_text;
    $fieldTextAuto = intval($info -> field_text_auto);
    $fieldDefault = $info -> field_default;
    $fieldset = intval($info -> fieldset);
    $commentType = $info -> comment_type;
    $commentFormat = $info -> comment_format;
    $commentSourceType = $info -> comment_sourceType;
    $commentSource = match($commentSourceType) {
      'dictionary' => $info -> comment_source_dictionary,
      'jtbc' => StringHelper::getClipedString(strval($info -> comment_source_jtbc), '.', 'left+') . '.*',
      'module' => JSON::decode(strval($info -> comment_source_module)),
      default => '',
    };
    $commentRequired = intval($info -> comment_required) === 1? true: false;
    $commentHiddenAdd = intval($info -> comment_hidden_add) === 1? true: false;
    $column = new Column($fieldName);
    if (!Validation::isEmpty($fieldDefault))
    {
      $hasDefaultValue = true;
      $column -> setDefaultValue($fieldDefault);
    }
    $tryTochangeDataType = function(string $argDataType) use (&$column, $hasDefaultValue, $fieldDefault)
    {
      $result = false;
      $dataType = $argDataType;
      if ($dataType == 'int')
      {
        if ($hasDefaultValue === false)
        {
          $result = true;
          $column -> setDataType('int', 11);
          $column -> setDefaultValue(0);
        }
        else
        {
          if (is_numeric($fieldDefault))
          {
            $newFieldDefault = intval($fieldDefault);
            if ($newFieldDefault >= -2147483648 && $newFieldDefault <= 2147483647)
            {
              $result = true;
              $column -> setDataType('int', 11);
              $column -> setDefaultValue($newFieldDefault);
            }
          }
        }
      }
      return $result;
    };
    switch($commentType)
    {
      case 'text':
      case 'select':
      case 'radio':
      case 'checkbox':
      case 'upload':
      case 'avatar':
      case 'date-range':
      case 'datetime-range':
      case 'time-range':
      case 'icon-picker':
      case 'location-picker':
      case 'input-with-datalist':
      case 'cascader':
      case 'linkage-selector':
        $column -> setDataType('varchar', 200);
        break;
      case 'color':
      case 'ipv4':
        $column -> setDataType('varchar', 20);
        break;
      case 'tag':
        $column -> setDataType('varchar', 1000);
        break;
      case 'range':
      case 'number':
      case 'star':
      case 'currency-input':
        $column -> setDataType('int', 11);
        break;
      case 'date':
        $column -> setDataType('date');
        break;
      case 'datetime':
        $column -> setDataType('datetime');
        break;
      case 'time':
        $column -> setDataType('time');
        break;
      case 'switch':
        $column -> setDataType('tinyint', 4);
        break;
      default:
        $column -> setDataType('text');
        break;
    }
    $comment = new Substance();
    $comment -> type = $commentType;
    if ($fieldTextAuto != 1 && !Validation::isEmpty($fieldText))
    {
      $comment -> text = $fieldText;
    }
    if ($commentType == 'text' && $commentFormat == 'int')
    {
      $tryTochangeDataType('int');
    }
    if ($commentFormat != 'nothing')
    {
      $comment -> format = $commentFormat;
    }
    $comment -> required = $commentRequired;
    if ($commentHiddenAdd == true)
    {
      $comment -> hidden = ['add'];
    }
    if (in_array($commentType, ['avatar', 'upload', 'gallery', 'attachment', 'mix', 'table', 'multi', 'multi-group', 'block-editor']))
    {
      $comment -> has_upload = true;
    }
    if ($fieldset == 2)
    {
      if (Validation::isJSON($info -> comment_columns))
      {
        $comment -> columns = JSON::decode($info -> comment_columns);
      }
    }
    else if ($fieldset == 3)
    {
      if (Validation::isJSON($info -> comment_group))
      {
        $comment -> group = JSON::decode($info -> comment_group);
      }
    }
    else if ($fieldset == 4)
    {
      if ($commentFormat == 'int')
      {
        $tryTochangeDataType('int');
      }
      $comment -> source = $commentSource;
      $comment -> sourceType = $commentSourceType;
    }
    else if (in_array($fieldset, [1, 5, 6, 7, 8, 9, 10]))
    {
      $extra = [];
      foreach ($info as $key => $value)
      {
        if (str_starts_with($key, 'extra_') && !Validation::isEmpty($value))
        {
          $extra[StringHelper::getClipedString($key, '_', 'right+')] = $value;
        }
      }
      $comment -> extra = $extra;
    }
    $column -> setComment($comment -> toJSON());
    return $column;
  }

  public function config(Request $req)
  {
    $genre = strval($req -> get('genre'));
    $module = new Module($genre);
    $bs = new BasicSubstance($this);
    $bs -> data -> genre = $genre;
    $bs -> data -> module_title = strval($module -> getTitle(false));
    $bs -> data -> module_icon = strval($module -> guide -> icon);
    return $bs -> toJSON();
  }

  public function getSourceList(Request $req)
  {
    $genre = strval($req -> get('genre'));
    $module = new Module($genre);
    $sourcesScanner = new ConfigSourcesScanner();
    $bs = new BasicSubstance($this);
    $bs -> data -> dictionary = Dictionary::getList();
    $bs -> data -> jtbc = $module -> getFileList('language');
    $bs -> data -> module = $sourcesScanner -> getSourcesOptions();
    return $bs -> toJSON();
  }

  public function editField(Request $req)
  {
    $genre = strval($req -> get('genre'));
    $tableName = strval($req -> get('tableName'));
    $field = strval($req -> get('field'));
    $data = [];
    $module = new Module($genre);
    if ($module -> isSettingAble === true && in_array($tableName, $module -> getTableNameList()))
    {
      $tinyModel = new TinyModel($tableName);
      $fieldInfo = $tinyModel -> table -> getFieldInfo($field);
      if (!is_null($fieldInfo))
      {
        $data = $fieldInfo;
      }
    }
    $bs = new BasicSubstance($this);
    $bs -> data -> genre = $genre;
    $bs -> data -> tableName = $tableName;
    $bs -> data -> data = $data;
    return $bs -> toJSON();
  }

  public function actionAddField(Request $req)
  {
    $code = 0;
    $message = '';
    $genre = strval($req -> post('genre'));
    $tableName = strval($req -> post('tableName'));
    $fieldName = strval($req -> post('field_name'));
    $commentType = strval($req -> post('comment_type'));
    $commentFormat = strval($req -> post('comment_format'));
    if ($this -> guard -> role -> checkPermission('setting'))
    {
      if (Validation::isEmpty($commentType) || Validation::isEmpty($commentFormat))
      {
        $code = 4000;
      }
      else
      {
        $module = new Module($genre);
        if ($module -> isSettingAble !== true)
        {
          $code = 4001;
        }
        else if (!in_array($tableName, $module -> getTableNameList()))
        {
          $code = 4002;
        }
        else if (!Validation::isNatural($fieldName))
        {
          $code = 4003;
        }
        else
        {
          $model = new TinyModel($tableName);
          if ($model -> table -> hasField($fieldName))
          {
            $code = 4004;
          }
          else
          {
            $db = DBFactory::getInstance();
            $info = new Substance($req -> post());
            $columnManager = new ColumnManager($db, $tableName);
            $addColumn = $columnManager -> addColumn($this -> getColumn($info));
            if (is_numeric($addColumn))
            {
              $code = 1;
              $schemaViewer = new SchemaViewer($db);
              $schemaViewer -> removeCache($tableName);
              Logger::log($this, 'manageSetting.log-addField', ['tableName' => $tableName, 'fieldName' => $fieldName]);
            }
            else
            {
              $code = 4040;
              $message = $columnManager -> lastErrorInfo;
            }
          }
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
    $ss -> message = Jtbc::take('manageSetting.text-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }

  public function actionEditField(Request $req)
  {
    $code = 0;
    $message = '';
    $genre = strval($req -> post('genre'));
    $tableName = strval($req -> post('tableName'));
    $fieldName = strval($req -> post('field_name'));
    $newFieldName = strval($req -> post('new_field_name'));
    $tabMode = intval($req -> post('tab_mode'));
    $comment = strval($req -> post('comment'));
    $commentType = strval($req -> post('comment_type'));
    $commentFormat = strval($req -> post('comment_format'));
    if ($this -> guard -> role -> checkPermission('setting'))
    {
      if ($tabMode != 0 && (Validation::isEmpty($commentType) || Validation::isEmpty($commentFormat)))
      {
        $code = 4000;
      }
      else
      {
        $module = new Module($genre);
        if ($module -> isSettingAble !== true)
        {
          $code = 4001;
        }
        else if (!in_array($tableName, $module -> getTableNameList()))
        {
          $code = 4002;
        }
        else if (!Validation::isNatural($fieldName) || !Validation::isNatural($newFieldName))
        {
          $code = 4003;
        }
        else
        {
          $model = new TinyModel($tableName);
          if (!$model -> table -> hasField($fieldName))
          {
            $code = 4005;
          }
          else if ($tabMode == 0 && !Validation::isJSON($comment))
          {
            $code = 4006;
          }
          else
          {
            $db = DBFactory::getInstance();
            $columnManager = new ColumnManager($db, $tableName);
            $changeColumn = null;
            if ($tabMode == 0)
            {
              $currentColumn = new ColumnLoader($columnManager -> getColumnInfo($fieldName));
              $currentColumn -> setComment($comment);
              $changeColumn = $columnManager -> changeColumn($currentColumn -> get(), $newFieldName);
            }
            else
            {
              $info = new Substance($req -> post());
              $changeColumn = $columnManager -> changeColumn($this -> getColumn($info), $newFieldName);
            }
            if (is_numeric($changeColumn))
            {
              $code = 1;
              $schemaViewer = new SchemaViewer($db);
              $schemaViewer -> removeCache($tableName);
              Logger::log($this, 'manageSetting.log-editField', ['tableName' => $tableName, 'fieldName' => $fieldName, 'newFieldName' => $newFieldName]);
            }
            else
            {
              $code = 4040;
              $message = $columnManager -> lastErrorInfo;
            }
          }
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
    $ss -> message = Jtbc::take('manageSetting.text-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }

  public function actionDropField(Request $req)
  {
    $code = 0;
    $message = '';
    $genre = strval($req -> get('genre'));
    $tableName = strval($req -> get('tableName'));
    $fieldName = strval($req -> get('field_name'));
    if ($this -> guard -> role -> checkPermission('setting'))
    {
      $module = new Module($genre);
      if ($module -> isSettingAble === true && in_array($tableName, $module -> getTableNameList()))
      {
        $model = new TinyModel($tableName);
        if (!$model -> table -> hasField($fieldName))
        {
          $code = 4005;
        }
        else
        {
          $db = DBFactory::getInstance();
          $columnManager = new ColumnManager($db, $tableName);
          $dropColumn = $columnManager -> dropColumn($fieldName);
          if (is_numeric($dropColumn))
          {
            $code = 1;
            $schemaViewer = new SchemaViewer($db);
            $schemaViewer -> removeCache($tableName);
            Logger::log($this, 'manageSetting.log-dropField', ['tableName' => $tableName, 'fieldName' => $fieldName]);
          }
          else
          {
            $code = 4040;
            $message = $columnManager -> lastErrorInfo;
          }
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
    $ss -> message = Jtbc::take('manageSetting.text-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }

  public function actionOrderField(Request $req)
  {
    $code = 0;
    $message = '';
    $genre = strval($req -> get('genre'));
    $tableName = strval($req -> get('tableName'));
    $fieldName = strval($req -> post('identity'));
    $fieldNameList = JSON::decode($req -> post('id'));
    if ($this -> guard -> role -> checkPermission('setting'))
    {
      $module = new Module($genre);
      if ($module -> isSettingAble === true && in_array($tableName, $module -> getTableNameList()))
      {
        if (is_array($fieldNameList) && in_array($fieldName, $fieldNameList))
        {
          $afterColumnName = '';
          foreach ($fieldNameList as $currentFieldName)
          {
            if ($currentFieldName != $fieldName)
            {
              $afterColumnName = $currentFieldName;
            }
            else
            {
              break;
            }
          }
          $db = DBFactory::getInstance();
          $columnManager = new ColumnManager($db, $tableName);
          $currentColumn = new ColumnLoader($columnManager -> getColumnInfo($fieldName));
          $modifyColumn = $columnManager -> modifyColumn($currentColumn -> get(), $afterColumnName);
          if (is_numeric($modifyColumn))
          {
            $code = 1;
            $schemaViewer = new SchemaViewer($db);
            $schemaViewer -> removeCache($tableName);
            Logger::log($this, 'manageSetting.log-orderField', ['tableName' => $tableName, 'fieldName' => $fieldName]);
          }
          else
          {
            $code = 4040;
            $message = $columnManager -> lastErrorInfo;
          }
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

  public function actionConfig(Request $req)
  {
    $code = 0;
    $message = '';
    $genre = strval($req -> post('genre'));
    $moduleTitle = strval($req -> post('module_title'));
    $moduleIcon = strval($req -> post('module_icon'));
    if ($this -> guard -> role -> checkPermission('setting'))
    {
      $module = new Module($genre);
      if ($module -> isExists())
      {
        $moduleNodeName = 'zh-cn';
        $moduleTitlePathType = 'cfg';
        $modulePath = $module -> getPath();
        $moduleTitlePath = $modulePath . '/common/guide.jtbc';
        $changedIcon = empty($moduleIcon)? false: JtbcWriter::putNodeContent($moduleTitlePath, $moduleTitlePathType, 'icon', $moduleIcon, $moduleNodeName);
        if ($module -> getTitle(true) ==  $module -> getTitle(false))
        {
          if (!is_null(Jtbc::take('global.' . $genre . ':index.title', 'lng')))
          {
            $moduleTitlePathType = 'lng';
            $moduleTitlePath = $modulePath . '/common/language/index.jtbc';
          }
        }
        $changedTitle = JtbcWriter::putNodeContent($moduleTitlePath, $moduleTitlePathType, 'title', $moduleTitle, $moduleNodeName);
        if ($changedIcon === true || $changedTitle === true)
        {
          $code = 1;
          Logger::log($this, 'manageSetting.log-config', ['genre' => $genre]);
        }
        else
        {
          $code = 4444;
        }
      }
      else
      {
        $code = 4001;
      }
    }
    else
    {
      $code = 4403;
      $message = Jtbc::take('::communal.text-tips-error-4403', 'lng');
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = Jtbc::take('manageSetting.text-code-config-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }
}