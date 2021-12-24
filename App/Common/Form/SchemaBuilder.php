<?php
namespace App\Common\Form;
use Jtbc\Validation;
use Jtbc\String\StringHelper;
use Jtbc\Model\Automatic\FieldNameHelper;

class SchemaBuilder
{
  public $fields = [];

  private function addField(string $argType, string $argName, string $argText = null)
  {
    $type = $argType;
    $name = $argName;
    $text = $argText ?? FieldNameHelper::getFieldText($name);
    $this -> fields[] = ['text' => $text, 'name' => $name, 'type' => $type, 'required' => false];
    $currentKey = array_key_last($this -> fields);
    $result = new class($this, $currentKey) {
      private $self;
      private $key;

      public function __get($name)
      {
        return $this -> self -> fields[$this -> key][$name];
      }

      public function __set($name, $value)
      {
        $this -> self -> fields[$this -> key][$name] = $value;
      }

      public function __call($argName, $args) 
      {
        $result = null;
        $name = $argName;
        if (str_starts_with($name, 'set') && count($args) == 1)
        {
          $currentName = strtolower(preg_replace('/(?<=[a-z])([A-Z])/', '-$1', $name));
          if (StringHelper::getClipedString($currentName, '-', 'left') == 'set')
          {
            $currentValue = $args[0];
            if ($name == 'setData' && is_array($currentValue))
            {
              if (!Validation::isArrayList($currentValue))
              {
                $changedValue = [];
                foreach ($currentValue as $key => $value)
                {
                  $changedValue[] = ['text' => $value, 'value' => $key];
                }
                $currentValue = $changedValue;
              }
            }
            $this -> self -> fields[$this -> key][StringHelper::getClipedString($currentName, '-', 'right+')] = $currentValue;
            $result = $this;
          }
        }
        return $result;
      }

      public function __construct($self, $key)
      {
        $this -> self = $self;
        $this -> key = $key;
      }
    };
    return $result;
  }

  public function addTips(string $argName, string $argTips)
  {
    $this -> fields[] = ['text' => '', 'name' => $argName, 'type' => 'tips', 'required' => false, 'tips' => $argTips];
  }

  public function build()
  {
    return $this -> fields;
  }

  public function __call($argName, $args) 
  {
    $result = null;
    $name = $argName;
    if (str_starts_with($name, 'add'))
    {
      $currentName = strtolower(preg_replace('/(?<=[a-z])([A-Z])/', '-$1', $name));
      if (StringHelper::getClipedString($currentName, '-', 'left') == 'add')
      {
        $result = $this -> addField(StringHelper::getClipedString($currentName, '-', 'right+'), ...$args);
      }
    }
    return $result;
  }
}