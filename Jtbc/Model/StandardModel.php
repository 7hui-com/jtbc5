<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Model;
use Jtbc\Substance;
use Jtbc\Model\Automatic\Validator;
use Jtbc\Model\Automatic\SourceBuilder;

class StandardModel extends TinyModel
{
  public function autoSave(Substance $argPocket = null, Substance $argCoffer = null)
  {
    $pocket = $argPocket ?? $this -> pocket;
    $coffer = $argCoffer ?? $this -> coffer;
    $sourceBuilder = new SourceBuilder($this -> table -> getTableInfo());
    $newPocket = new Substance($sourceBuilder -> rebuild($pocket -> all(), $coffer -> all()));
    $result = $this -> save($newPocket);
    return $result;
  }

  public function autoValidate(Substance $argPocket = null, Substance $argCoffer = null)
  {
    $pocket = $argPocket ?? $this -> pocket;
    $coffer = $argCoffer ?? $this -> coffer;
    $tableInfo = $this -> table -> getTableInfo();
    $validator = new Validator($tableInfo);
    $sourceBuilder = new SourceBuilder($tableInfo);
    $result = $validator -> validate($sourceBuilder -> rebuild($pocket -> all(), $coffer -> all()));
    return $result;
  }
}