<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Model\Automatic;
use Jtbc\JSON;
use Jtbc\Substance;
use Jtbc\Validation;

class SourceBuilder
{
  private $tableInfo;

  public function rebuild(array $argPocketSource, array $argCofferSource)
  {
    $result = [];
    $pocketSource = $argPocketSource;
    $cofferSource = $argCofferSource;
    if (!empty($pocketSource) || !empty($cofferSource))
    {
      $result = $pocketSource;
      $tableInfo = $this -> tableInfo;
      if (is_array($tableInfo))
      {
        foreach ($tableInfo as $item)
        {
          $mode = 'normal';
          $field = new Substance($item);
          $fieldName = $field -> field;
          $fieldComment = $field -> comment;
          if (!Validation::isEmpty($fieldComment))
          {
            $commentArr = JSON::decode($fieldComment);
            if (array_key_exists('mode', $commentArr))
            {
              $mode = $commentArr['mode'];
            }
          }
          if (in_array($mode, ['auto', 'manual']))
          {
            if (array_key_exists($fieldName, $result))
            {
              unset($result[$fieldName]);
            }
            if ($mode == 'manual')
            {
              if (array_key_exists($fieldName, $cofferSource))
              {
                $result[$fieldName] = $cofferSource[$fieldName];
              }
            }
          }
        }
      }
    }
    return $result;
  }

  public function __construct(array $argTableInfo)
  {
    $this -> tableInfo = $argTableInfo;
  }
}