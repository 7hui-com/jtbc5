<?php
namespace Jtbc;
use Throwable;
use Jtbc\DB\DBFactory;
use Jtbc\DB\Schema\SchemaViewer;
use Jtbc\Jtbc\JtbcReader;
use Jtbc\Jtbc\JtbcParser;
use Jtbc\Model\TinyModel;
use Jtbc\Model\Automatic\FieldNameHelper;
use Jtbc\Module\ModuleFinder;
use Jtbc\Config\ConfigReader;
use Jtbc\String\StringHelper;
use App\Common\Form\FieldTextGenerator;
use App\Common\Module\ModuleRecognizer;
use App\Console\Common\Ambassador;
use App\Console\Common\BasicSubstance;
use App\Console\Common\EmptySubstance;
use Config\Diplomatist as DiplomatistConfig;

class Diplomat extends Ambassador {
  private function generate(Substance $source)
  {
    $result = new Substance();
    $mode = strval($source -> mode);
    $genre = strval($source -> genre);
    $tableName = strval($source -> table);
    $where = strval($source -> where);
    $orderby = strval($source -> orderby);
    $whereAuto = intval($source -> where_auto);
    $orderbyMode = intval($source -> orderby_mode);
    $limitOffset = intval($source -> limit_offset);
    $limitCount = max(1, intval($source -> limit_count));
    $fields = strval($source -> fields);
    $templateFile = strval($source -> template_file);
    $templateNode = strval($source -> template_node);
    $module = new Module($genre);
    $db = DBFactory::getInstance();
    $schemaViewer = new SchemaViewer($db);
    $hasDuplicateFields = function($argJSONString)
    {
      $result = false;
      $fields = [];
      $JSONString = strval($argJSONString);
      $fieldsArr = JSON::decode($JSONString);
      if (is_array($fieldsArr))
      {
        foreach ($fieldsArr as $item)
        {
          if (is_array($item) && array_key_exists('field', $item))
          {
            if (in_array($item['field'], $fields))
            {
              $result = true;
              break;
            }
            else
            {
              $fields[] = $item['field'];
            }
          }
        }
      }
      return $result;
    };
    $convertArray2Code = function(array $argArray) use (&$convertArray2Code)
    {
      $result = '[';
      $array = $argArray;
      $isArrayList = Validation::isArrayList($array);
      if (!empty($array))
      {
        foreach ($array as $key => $value)
        {
          $item = '';
          if ($isArrayList !== true)
          {
            $item .= is_int($key)? $key: '\'' . Encoder::addslashes($key) . '\' => ';
          }
          if (is_int($value) || is_float($value))
          {
            $item .= $value . ', ';
          }
          else if (is_string($value))
          {
            $item .= '\'' . Encoder::addslashes($value) . '\', ';
          }
          else if (is_bool($value))
          {
            $item .= ($value === true? 'true': 'false') . ', ';
          }
          else if (is_array($value))
          {
            $item .= $convertArray2Code($value) . ', ';
          }
          else
          {
            $item = '';
          }
          $result .= $item;
        }
        $result = StringHelper::getClipedString($result, ',', 'left+');
      }
      $result .= ']';
      return $result;
    };
    if (!$module -> isExists())
    {
      $result -> code = 4101;
    }
    else if (!$db -> hasTable($tableName))
    {
      $result -> code = 4102;
    }
    else if ($hasDuplicateFields($where))
    {
      $result -> code = 4103;
    }
    else if ($orderbyMode == 3 && $hasDuplicateFields($orderby))
    {
      $result -> code = 4104;
    }
    else
    {
      $param = [];
      $result -> code = 1;
      if ($module -> getTableName() == $tableName)
      {
        $param['genre'] = $genre;
      }
      else if (str_contains($tableName, '-') && $module -> getTableNameByKey(StringHelper::getClipedString($tableName, '-', 'right')) == $tableName)
      {
        $param['genre'] = $genre;
        $param['subtable'] = StringHelper::getClipedString($tableName, '-', 'right');
      }
      else
      {
        $param['table'] = $tableName;
      }
      if ($whereAuto === 0)
      {
        $param['autoFilter'] = false;
      }
      if (Validation::isJSON($fields))
      {
        $param['fields'] = JSON::decode($fields);
      }
      if (Validation::isJSON($where))
      {
        $whereParam = [];
        $whereArr = JSON::decode($where);
        foreach ($whereArr as $arr)
        {
          $item = new Substance($arr);
          $field = strval($item -> field);
          $condition = intval($item -> condition);
          $fieldInfo = $schemaViewer -> getFieldInfo($tableName, $field);
          if (is_array($fieldInfo) && array_key_exists('type', $fieldInfo))
          {
            $value = strval($item -> value);
            $fieldType = strval($fieldInfo['type']);
            if (in_array($condition, [1, 2, 3, 4, 5, 6]))
            {
              if (str_contains($fieldType, 'int'))
              {
                $value = intval($item -> value);
              }
            }
            $whereParam[$field] = match($condition)
            {
              1 => $value,
              2 => ['unEqual' => $value],
              3 => ['min' => [$value, false]],
              4 => ['min' => $value],
              5 => ['max' => [$value, false]],
              6 => ['max' => $value],
              7 => ['in' => Validation::isIntSeries($value)? $value: explode('|', $value)],
              8 => ['notIn' => Validation::isIntSeries($value)? $value: explode('|', $value)],
              9 => ['like' => $value],
              10 => ['notLike' => $value],
              default => $value,
            };
          }
        }
        $param['where'] = $whereParam;
      }
      if ($orderbyMode == 2)
      {
        $param['orderBy'] = [['rand()', 'desc']];
      }
      else if ($orderbyMode == 3)
      {
        if (Validation::isJSON($orderby))
        {
          $orderbyParam = [];
          $orderbyArr = JSON::decode($orderby);
          foreach ($orderbyArr as $arr)
          {
            $item = new Substance($arr);
            if (is_string($item -> field))
            {
              $orderbyParam[] = [$item -> field, match(intval($item -> descorasc)){1 => 'desc', default => 'asc'}];
            }
          }
          $param['orderBy'] = $orderbyParam;
        }
      }
      $param['limit'] = $limitOffset == 0? $limitCount: [$limitOffset, $limitCount];
      $fetchSourceCode = '$fetch(' . $convertArray2Code($param) . ')';
      if ($mode == 'backend')
      {
        $templateGenre = StringHelper::getClipedString($templateFile, '::', 'left');
        $templateName = StringHelper::getClipedString(StringHelper::getClipedString($templateFile, '::', 'right'), '.', 'left+');
        $codename = match($templateGenre)
        {
          '' => 'global.' . $templateName . '.' . $templateNode,
          'universal' => 'universal:' . $templateName . '.' . $templateNode,
          default => 'global.' . $templateGenre . ':' . $templateName . '.' . $templateNode,
        };
        $sourceCode = '{$=$render(\'' . Encoder::addslashes($codename) . '\', ' . $fetchSourceCode . ')}';
        $renderCode = 1;
        $renderResult = null;
        $renderMessage = null;
        try
        {
          $renderResult = JtbcParser::parse($sourceCode);
        }
        catch(Throwable $e)
        {
          $renderCode = 0;
          $renderResult = null;
          $renderMessage = $e -> getMessage();
        }
        $result -> source_code = $sourceCode;
        $result -> render_code = $renderCode;
        $result -> render_result = $renderResult;
        $result -> render_message = $renderMessage;
      }
      else if ($mode == 'frontend')
      {
        $sourceData = '{$=$jsonEncode(' . $fetchSourceCode . ')}';
        $sourceCode = '<jtbc-view data="{$=$htmlEncode($jsonEncode(' . $fetchSourceCode . '))}">' . chr(13) . chr(10);
        $sourceCode .= '  <template>' . chr(13) . chr(10);
        if (Validation::isJSON($fields))
        {
          $fieldsArr = JSON::decode($fields);
          if (is_array($fieldsArr))
          {
            foreach ($fieldsArr as $field)
            {
              $sourceCode .= '    <p>${$' . $field . '}</p>' . chr(13) . chr(10);
            }
          }
        }
        $sourceCode .= '  </template>' . chr(13) . chr(10);
        $sourceCode .= '</jtbc-view>';
        $fetchCode = 1;
        $fetchResult = null;
        $fetchMessage = null;
        try
        {
          $fetchResult = JtbcParser::parse($sourceData);
        }
        catch(Throwable $e)
        {
          $fetchCode = 0;
          $fetchResult = null;
          $fetchMessage = $e -> getMessage();
        }
        $result -> source_code = $sourceCode;
        $result -> fetch_code = $fetchCode;
        $result -> fetch_result = $fetchResult;
        $result -> fetch_message = $fetchMessage;
      }
    }
    return $result;
  }

  private function getModules()
  {
    $configReader = new ConfigReader(DiplomatistConfig::class);
    $consoleFolder = strval($configReader -> console_dir);
    $moduleFinder = new ModuleFinder();
    $folders = $moduleFinder -> getModules();
    $getModules = function(string $argBaseFolder = '') use ($folders, $consoleFolder, &$getModules)
    {
      $result = [];
      $baseFolder = $argBaseFolder;
      foreach ($folders as $folder)
      {
        $canBeGuide = true;
        $currentFolder = $folder;
        if (!Validation::isEmpty($baseFolder))
        {
          if (str_starts_with($folder, $baseFolder))
          {
            $currentFolder = substr($folder, strlen($baseFolder));
          }
          else
          {
            $canBeGuide = false;
          }
        }
        if ($canBeGuide === true && !str_contains($currentFolder, '/'))
        {
          $moduleRecognizer = new ModuleRecognizer($folder);
          if (!$moduleRecognizer -> isConfusing())
          {
            $module = new Module($folder);
            if (!is_null($module -> guide -> link))
            {
              $item = ['text' => $module -> getTitle(false), 'subtext' => $folder, 'value' => $folder];
              if ($folder == $consoleFolder || str_starts_with($folder, $consoleFolder . '/') || $module -> hasNoTable == true)
              {
                $item['disabled'] = true;
              }
              if ($module -> isParentModule == true)
              {
                $item['children'] = $getModules($baseFolder . $currentFolder . '/');
              }
              $result[] = $item;
            }
          }
        }
      }
      return $result;
    };
    return $getModules();
  }

  private function getTemplatePath(string $argTemplateFile)
  {
    $templateFile = $argTemplateFile;
    $folder = StringHelper::getClipedString($templateFile, '::', 'left');
    $filename = StringHelper::getClipedString($templateFile, '::', 'right');
    return $folder . (empty($folder)? '': '/') . 'common/template/' . $filename;
  }

  private function getTemplateFiles(string $argGenre = null)
  {
    $result = [];
    $genre = $argGenre;
    $folders = ['', 'universal'];
    if (!empty($genre))
    {
      $folders[] = $genre;
    }
    foreach ($folders as $folder)
    {
      $files = [];
      $module = new Module($folder);
      foreach($module -> getFileList('template') as $file)
      {
        $value = $folder . '::' . $file['filename'];
        if (str_ends_with($value, '.jtbc'))
        {
          $files[] = ['text' => $this -> getTemplatePath($value), 'value' => $value];
        }
      }
      $text = match($folder)
      {
        '' => Jtbc::take('manage.text-template-group-1', 'lng'),
        'universal' => Jtbc::take('manage.text-template-group-2', 'lng'),
        default => Jtbc::take('manage.text-template-group-3', 'lng'),
      };
      $result[] = ['text' => $text, 'value' => $folder, 'disabled' => true, 'children' => $files];
    }
    return $result;
  }

  private function getTemplateNodes(string $argTemplateFile)
  {
    $result = [];
    $templateFile = $argTemplateFile;
    $templateFilePath = Path::getActualRoute($this -> getTemplatePath($templateFile));
    if (is_file($templateFilePath) && str_contains($templateFilePath, 'common/template/'))
    {
      $data = JtbcReader::getData($templateFilePath, 'tpl');
      if (is_array($data))
      {
        foreach($data as $key => $value)
        {
          $result[] = ['text' => $key, 'value' => $key];
        }
      }
    }
    return $result;
  }

  public function getTemplateNodesByFile(Request $req)
  {
    $es = new EmptySubstance();
    $templateFile = strval($req -> get('templateFile'));
    $templateNodes = $this -> getTemplateNodes($templateFile);
    $es -> data -> template_nodes = JSON::encode($templateNodes);
    return $es -> toJSON();
  }

  public function getTableOptions(Request $req)
  {
    $es = new EmptySubstance();
    $genre = strval($req -> get('genre'));
    $tableName = strval($req -> get('tableName'));
    $defaultTemplateFile = 'universal::render.jtbc';
    $module = new Module($genre);
    if (!$module -> isExists() || $module -> hasNoTable == true)
    {
      $es -> code = 4001;
    }
    else
    {
      $tables = [];
      $whereColumns = [];
      $orderbyColumns = [];
      $tableNameList = $module -> getTableNameList();
      if (is_array($tableNameList) && !empty($tableNameList))
      {
        foreach ($tableNameList as $value)
        {
          $tables[] = ['text' => $value, 'value' => $value];
        }
        if (Validation::isEmpty($tableName) || !in_array($tableName, $tableNameList))
        {
          $tableName = $tableNameList[0];
        }
        $fieldOptions = [];
        $fieldsOptions = [];
        $fieldsSelected = [];
        $model = new TinyModel($tableName);
        $tableInfo = $model -> table -> getTableInfo();
        foreach ($tableInfo as $field)
        {
          $currentField = new Substance($field);
          $fieldName = $currentField -> field;
          $fieldComment = $currentField -> comment;
          $fieldText = FieldNameHelper::getFieldText($fieldName, $genre);
          if (Validation::isJSON($fieldComment))
          {
            $currentFieldComment = new Substance($fieldComment);
            if (!is_null($currentFieldComment -> text))
            {
              $fieldText = $currentFieldComment -> text;
            }
          }
          $fieldOptionText = $fieldName . (strtolower($fieldText) == strtolower($fieldName)? '': ' - ' . $fieldText);
          $fieldOption = ['text' => $fieldOptionText, 'value' => $fieldName];
          if ($fieldName == 'deleted')
          {
            $fieldOption['disabled'] = true;
          }
          else
          {
            if (!str_contains($currentField -> type, 'text'))
            {
              $fieldsSelected[] = $fieldName;
            }
          }
          $fieldOptions[] = $fieldOption;
          $fieldsOptions[] = ['text' => $fieldName, 'value' => $fieldName];
        }
        $whereColumns[] = ['name' => 'field', 'type' => 'select', 'text' => Jtbc::take('manage.text-where-field', 'lng'), 'data' => $fieldOptions, 'extra' => ['width' => '100%']];
        $whereColumns[] = ['name' => 'condition', 'type' => 'select', 'text' => Jtbc::take('manage.text-where-condition', 'lng'), 'data' => Converter::convertToOption(Jtbc::take('sel_field_condition.*', 'lng')), 'extra' => ['width' => '100%']];
        $whereColumns[] = ['name' => 'value', 'type' => 'text', 'text' => Jtbc::take('manage.text-where-value', 'lng'), 'extra' => ['width' => '100%']];
        $orderbyColumns[] = ['name' => 'field', 'type' => 'select', 'text' => Jtbc::take('manage.text-orderby-field', 'lng'), 'data' => $fieldOptions, 'extra' => ['width' => '100%']];
        $orderbyColumns[] = ['name' => 'descorasc', 'type' => 'select', 'text' => Jtbc::take('manage.text-orderby-descorasc', 'lng'), 'data' => Converter::convertToOption(Jtbc::take('sel_field_descorasc.*', 'lng')), 'extra' => ['width' => '100%']];
        $es -> data -> genre = $genre;
        $es -> data -> tableName = $tableName;
        $es -> data -> tables = JSON::encode($tables);
        $es -> data -> whereColumns = JSON::encode($whereColumns);
        $es -> data -> orderbyColumns = JSON::encode($orderbyColumns);
        $es -> data -> fieldsOptions = JSON::encode($fieldsOptions);
        $es -> data -> fieldsSelected = JSON::encode($fieldsSelected);
        $es -> data -> template_files = JSON::encode($this -> getTemplateFiles($genre));
        $es -> data -> default_template_file = $defaultTemplateFile;
      }
      else
      {
        $es -> code = 4002;
      }
    }
    return $es -> toJSON();
  }

  public function backend(Request $req)
  {
    $whereText = '';
    $orderbyText = '';
    $defaultTemplateFile = 'universal::render.jtbc';
    $defaultTableText = FieldTextGenerator::generate('table');
    if (array_key_exists('text', $defaultTableText))
    {
      $whereTextSS = new Substance($defaultTableText['text']);
      $whereTextSS -> emptyTips = Jtbc::take('manage.text-tips-where-empty', 'lng');
      $whereText = $whereTextSS -> toJSON();
      $orderbyTextSS = new Substance($defaultTableText['text']);
      $orderbyTextSS -> emptyTips = Jtbc::take('manage.text-tips-orderby-empty', 'lng');
      $orderbyText = $orderbyTextSS -> toJSON();
    }
    $bs = new BasicSubstance($this);
    $bs -> data -> modules = JSON::encode($this -> getModules());
    $bs -> data -> where_text = $whereText;
    $bs -> data -> orderby_text = $orderbyText;
    $bs -> data -> template_files = JSON::encode($this -> getTemplateFiles());
    $bs -> data -> default_template_file = $defaultTemplateFile;
    $bs -> data -> template_nodes = JSON::encode($this -> getTemplateNodes($defaultTemplateFile));
    return $bs -> toJSON();
  }

  public function frontend(Request $req)
  {
    $whereText = '';
    $orderbyText = '';
    $defaultTemplateFile = 'universal::render.jtbc';
    $defaultTableText = FieldTextGenerator::generate('table');
    if (array_key_exists('text', $defaultTableText))
    {
      $whereTextSS = new Substance($defaultTableText['text']);
      $whereTextSS -> emptyTips = Jtbc::take('manage.text-tips-where-empty', 'lng');
      $whereText = $whereTextSS -> toJSON();
      $orderbyTextSS = new Substance($defaultTableText['text']);
      $orderbyTextSS -> emptyTips = Jtbc::take('manage.text-tips-orderby-empty', 'lng');
      $orderbyText = $orderbyTextSS -> toJSON();
    }
    $bs = new BasicSubstance($this);
    $bs -> data -> modules = JSON::encode($this -> getModules());
    $bs -> data -> where_text = $whereText;
    $bs -> data -> orderby_text = $orderbyText;
    return $bs -> toJSON();
  }

  public function actionGenerate(Request $req)
  {
    $code = 0;
    $data = [];
    $message = '';
    $source = new Substance($req -> post());
    $mode = strval($source -> mode);
    $tableName = strval($source -> table);
    $orderby = strval($source -> orderby);
    $orderbyMode = intval($source -> orderby_mode);
    $templateNode = strval($source -> template_node);
    if (Validation::isEmpty($tableName))
    {
      $code = 4001;
    }
    else if ($orderbyMode == 3 && Validation::isEmpty($orderby))
    {
      $code = 4002;
    }
    else if ($mode == 'backend' && Validation::isEmpty($templateNode))
    {
      $code = 4003;
    }
    else
    {
      $outcome = $this -> generate($source);
      if ($outcome -> code == 1)
      {
        $code = 1;
        $data['mode'] = $mode;
        if ($mode == 'backend')
        {
          $data['source_code'] = $outcome -> source_code;
          $data['render_code'] = $outcome -> render_code;
          $data['render_result'] = $outcome -> render_result;
          $data['render_message'] = $outcome -> render_message;
        }
        else if ($mode == 'frontend')
        {
          $data['source_code'] = $outcome -> source_code;
          $data['fetch_code'] = $outcome -> fetch_code;
          $data['fetch_result'] = $outcome -> fetch_result;
          $data['fetch_message'] = $outcome -> fetch_message;
        }
      }
      else
      {
        $code = $outcome -> code;
      }
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> data = $data;
    $ss -> message = Jtbc::take('manage.text-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }
}