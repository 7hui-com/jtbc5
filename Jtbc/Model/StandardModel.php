<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Model;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\Model\Automatic\Validator;
use Jtbc\Model\Automatic\SourceBuilder;

class StandardModel extends TinyModel
{
  private $validationRules;

  public function addValidationRule(string $argFormat, int $argErrorCode, callable $func)
  {
    $result = false;
    $format = $argFormat;
    $errorCode = $argErrorCode;
    if (Validation::isNatural($format))
    {
      if (!$this -> validationRules -> exists($format))
      {
        $result = true;
        $validationRule = new Substance();
        $validationRule -> func = $func;
        $validationRule -> errorCode = $errorCode;
        $this -> validationRules[$format] = $validationRule;
      }
    }
    return $result;
  }

  public function autoSave(?Substance $argPocket = null, ?Substance $argCoffer = null)
  {
    $pocket = $argPocket ?? $this -> pocket;
    $coffer = $argCoffer ?? $this -> coffer;
    $sourceBuilder = new SourceBuilder($this -> table -> getTableInfo());
    $newPocket = new Substance($sourceBuilder -> rebuild($pocket -> all(), $coffer -> all()));
    $result = $this -> save($newPocket);
    return $result;
  }

  public function autoSubmit(...$args): bool
  {
    return is_numeric($this -> autoSave(...$args));
  }

  public function autoValidate(?Substance $argPocket = null, ?Substance $argCoffer = null)
  {
    $pocket = $argPocket ?? $this -> pocket;
    $coffer = $argCoffer ?? $this -> coffer;
    $tableInfo = $this -> table -> getTableInfo();
    $validator = new Validator($tableInfo, $this -> validationRules);
    $sourceBuilder = new SourceBuilder($tableInfo);
    $result = $validator -> validate($sourceBuilder -> rebuild($pocket -> all(), $coffer -> all()));
    return $result;
  }

  public function __construct(...$args)
  {
    parent::__construct(...$args);
    $this -> validationRules = new Substance();
  }
}