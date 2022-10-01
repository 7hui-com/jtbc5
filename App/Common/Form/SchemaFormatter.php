<?php
namespace App\Common\Form;
use Jtbc\Env;
use Jtbc\Jtbc;
use Jtbc\JSON;
use Jtbc\Converter;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\Model\TinyModel;
use Jtbc\Model\Automatic\FieldNameHelper;
use Jtbc\Fetcher\ModelFetcher;
use App\Universal\Dictionary\Dictionary;

class SchemaFormatter
{
  private $fieldName;
  private $baseURI;
  private $lang;
  private $withSource = ['radio', 'checkbox', 'select', 'flat-selector', 'transfer', 'input-with-datalist'];

  private function getData($argSource, string $argSourceType)
  {
    $result = [];
    $source = $argSource;
    $sourceType = $argSourceType;
    if ($sourceType == 'data')
    {
      if (is_array($source))
      {
        $result = $source;
      }
    }
    else if ($sourceType == 'dictionary')
    {
      if (is_string($source) && Validation::isNatural($source))
      {
        $sourceArr = Dictionary::get(argName: $source, argLang: $this -> lang);
        if (is_array($sourceArr))
        {
          $result = Converter::convertToOption($sourceArr);
        }
      }
    }
    else if (in_array($sourceType, ['model', 'module', 'table']))
    {
      if (is_array($source))
      {
        $ss = new Substance($source);
        $valueField = $ss -> valueField ?? 'id';
        $textField = $ss -> textField ?? 'title';
        if (!$ss -> exists('lang'))
        {
          $source['lang'] = $this -> lang;
        }
        $sourceArr = ModelFetcher::fetch($source);
        if (is_array($sourceArr))
        {
          foreach ($sourceArr as $rs)
          {
            if (is_array($rs) && array_key_exists($valueField, $rs) && array_key_exists($textField, $rs))
            {
              $result[] = ['text' => $rs[$textField], 'value' => $rs[$valueField]];
            }
          }
        }
      }
    }
    else
    {
      $sourceArr = Jtbc::take($source, 'lng', false, null, Env::getLanguageByID($this -> lang));
      if (is_array($sourceArr))
      {
        $result = Converter::convertToOption($sourceArr);
      }
    }
    return $result;
  }

  private function getExtra(Substance $comment)
  {
    $type = $comment -> type;
    $extra = FieldTextGenerator::generate($type);
    if (in_array($type, ['avatar', 'attachment', 'gallery', 'upload']))
    {
      $extra['action'] = $this -> baseURI . '?action=upload&scene=' . $this -> fieldName;
    }
    if (is_array($comment -> extra))
    {
      $extra = array_merge($extra, $comment -> extra);
      foreach ($extra as $key => $val)
      {
        if (str_starts_with($key, 'constant_') && defined($val))
        {
          $extra[$key] = constant($val);
        }
      }
      if (array_key_exists('href', $extra) && !array_key_exists('baseurl', $extra))
      {
        $extra['baseurl'] = Env::getMajorGenre();
      }
    }
    //*****************************************************************************//
    if (in_array($type, ['date', 'datetime', 'date-range', 'datetime-range']))
    {
      $extra = array_merge($extra, ['lang' => $this -> lang]);
    }
    else if (in_array($type, ['table', 'mix', 'multi']))
    {
      $extra = array_merge($extra, ['columns' => JSON::encode($this -> getSubSchema($comment -> columns))]);
    }
    else if ($type == 'multi-group')
    {
      $newGroup = [];
      $group = $comment -> group;
      if (is_null($group))
      {
        $proxyGroup = $comment -> proxy_group;
        if (is_string($proxyGroup) && str_contains($proxyGroup, '.'))
        {
          $group = JSON::decode(Jtbc::take($proxyGroup, 'cfg'));
        }
      }
      if (is_array($group))
      {
        foreach ($group as $item)
        {
          $current = new Substance($item);
          $name = $current -> name;
          $text = $current -> text ?? FieldNameHelper::getFieldText($name);
          $columns = $this -> getSubSchema($current -> columns);
          $newGroup[] = ['name' => $name, 'text' => $text, 'columns' => $columns];
        }
      }
      $extra = array_merge($extra, ['group' => JSON::encode($newGroup)]);
    }
    return $extra;
  }

  public function getSchema(Substance $comment)
  {
    $type = $comment -> type;
    $fieldName = $this -> fieldName;
    $required = $comment -> required === false? false: true;
    $text = $comment -> text ?? FieldNameHelper::getFieldText($fieldName);
    $result = ['text' => $text, 'name' => $fieldName, 'type' => $type, 'required' => $required, 'extra' => $this -> getExtra($comment)];
    if (in_array($type, $this -> withSource))
    {
      $source = $comment -> source;
      $sourceType = $comment -> sourceType ?? 'file';
      if (!is_null($source))
      {
        $result['data'] = $this -> getData($source, $sourceType);
      }
    }
    return $result;
  }

  public function getSubSchema($argColumns)
  {
    $result = [];
    $columns = $argColumns;
    if (is_array($columns))
    {
      foreach ($columns as $column)
      {
        $current = new Substance($column);
        $name = $current -> name;
        $type = $current -> type;
        $text = $current -> text ?? FieldNameHelper::getFieldText($name);
        $item = ['text' => $text, 'name' => $name, 'type' => $type, 'extra' => $this -> getExtra($current)];
        if (in_array($type, $this -> withSource))
        {
          $source = $current -> source;
          $sourceType = $current -> sourceType ?? 'file';
          if (!is_null($source))
          {
            $item['data'] = $this -> getData($source, $sourceType);
          }
        }
        $result[] = $item;
      }
    }
    return $result;
  }

  public function __construct(string $argFieldName, string $argBaseURI, int $argLang = 0)
  {
    $this -> fieldName = $argFieldName;
    $this -> baseURI = $argBaseURI;
    $this -> lang = $argLang;
  }
}