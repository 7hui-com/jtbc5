<?php
namespace App\Common\Form;
use Jtbc\Substance;
use Jtbc\Validation;

class SchemaGenerator
{
  private $tableInfo;
  private $baseURI = '';
  private $lang = 0;
  public $tips = null;
  public $data = null;
  public $extra = null;
  public $value = null;

  public function setLang(int $argLang)
  {
    $this -> lang = $argLang;
  }

  public function generate(string $argScene = 'default')
  {
    $result = [];
    $scene = $argScene;
    $tableInfo = $this -> tableInfo;
    foreach ($tableInfo as $item)
    {
      $field = new Substance($item);
      $fieldName = $field -> field;
      $fieldComment = $field -> comment;
      if ($this -> ignore[$fieldName] != true)
      {
        if (!Validation::isEmpty($fieldComment))
        {
          $comment = new Substance($fieldComment);
          if ($comment -> exists('type'))
          {
            if (!is_array($comment -> hidden) || !in_array($scene, $comment -> hidden))
            {
              $schemaFormatter = new SchemaFormatter($fieldName, $this -> baseURI, $this -> lang);
              $schema = $schemaFormatter -> getSchema($comment);
              if ($this -> data -> exists($fieldName))
              {
                $schema['data'] = $this -> data[$fieldName];
              }
              if ($this -> extra -> exists($fieldName))
              {
                $schema['extra'] = array_merge($schema['extra'], $this -> extra[$fieldName]);
              }
              if ($this -> value -> exists($fieldName))
              {
                $schema['value'] = $this -> value[$fieldName];
              }
              $result[] = $schema;
              if ($this -> tips -> exists($fieldName))
              {
                $result[] = ['text' => '', 'name' => $fieldName, 'type' => 'tips', 'required' => false, 'tips' => $this -> tips[$fieldName]];
              }
            }
          }
        }
      }
    }
    return $result;
  }

  public function __construct(array $argTableInfo, string $argBaseURI, int $argLang = 0)
  {
    $this -> tableInfo = $argTableInfo;
    $this -> baseURI = $argBaseURI;
    $this -> lang = $argLang;
    $this -> tips = new Substance();
    $this -> data = new Substance();
    $this -> extra = new Substance();
    $this -> value = new Substance();
    $this -> ignore = new Substance();
  }
}