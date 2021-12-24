<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Model\Automatic;
use Jtbc\Jtbc;
use Jtbc\JSON;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\Exception\ErrorCollector;

class Validator
{
  private $tableInfo;

  public function validate(array $argSource, array $argMessageMap = [])
  {
    $result = false;
    $source = $argSource;
    $messageMap = $argMessageMap;
    $pocket = new Substance($source);
    $tableInfo = $this -> tableInfo;
    if (is_array($tableInfo))
    {
      $errorCollector = new ErrorCollector();
      foreach ($tableInfo as $item)
      {
        $mode = 'normal';
        $required = true;
        $format = null;
        $field = new Substance($item);
        $fieldName = $field -> field;
        $fieldComment = $field -> comment;
        $fieldText = FieldNameHelper::getFieldText($fieldName);
        if (!Validation::isEmpty($fieldComment))
        {
          $commentArr = JSON::decode($fieldComment);
          if (array_key_exists('mode', $commentArr))
          {
            $mode = $commentArr['mode'];
          }
          if (array_key_exists('required', $commentArr))
          {
            $required = $commentArr['required'];
          }
          if (array_key_exists('format', $commentArr))
          {
            $format = $commentArr['format'];
          }
          if (array_key_exists('text', $commentArr))
          {
            $fieldText = $commentArr['text'];
          }
        }
        if ($mode != 'auto')
        {
          $needToValidate = false;
          $fieldValue = $pocket -> {$fieldName};
          if ($required == true)
          {
            $needToValidate = true;
          }
          else
          {
            if ($format != null && $fieldValue != null)
            {
              $needToValidate = true;
            }
          }
          if ($needToValidate == true)
          {
            $code = null;
            if ($format == null)
            {
              if (Validation::isEmpty($fieldValue)) $code = 4901;
            }
            else if ($format == 'int')
            {
              if (!Validation::isInteger($fieldValue)) $code = 4902;
            }
            else if ($format == 'email')
            {
              if (!Validation::isEmail($fieldValue)) $code = 4903;
            }
            else if ($format == 'date')
            {
              if (!Validation::isDate($fieldValue)) $code = 4904;
            }
            else if ($format == 'datetime')
            {
              if (!Validation::isDateTime($fieldValue)) $code = 4905;
            }
            else if ($format == 'idcard')
            {
              if (!Validation::isIDCard($fieldValue)) $code = 4906;
            }
            else if ($format == 'name')
            {
              if (!Validation::isName($fieldValue)) $code = 4907;
            }
            else if ($format == 'mobile')
            {
              if (!Validation::isMobile($fieldValue)) $code = 4908;
            }
            else if ($format == 'json')
            {
              if (!Validation::isJSON($fieldValue)) $code = 4909;
            }
            else if ($format == 'intSeries')
            {
              if (!Validation::isIntSeries($fieldValue)) $code = 4910;
            }
            else if ($format == 'natural')
            {
              if (!Validation::isNatural($fieldValue)) $code = 4911;
            }
            else if ($format == 'url')
            {
              if (!Validation::isURL($fieldValue)) $code = 4912;
            }
            else if ($format == 'ip')
            {
              if (!Validation::isIP($fieldValue)) $code = 4913;
            }
            else if ($format == 'ipv4')
            {
              if (!Validation::isIPv4($fieldValue)) $code = 4914;
            }
            else if ($format == 'ipv6')
            {
              if (!Validation::isIPv6($fieldValue)) $code = 4915;
            }
            else if ($format == 'chinese')
            {
              if (!Validation::isChinese($fieldValue)) $code = 4916;
            }
            else if ($format == 'slug')
            {
              if (!Validation::isSlug($fieldValue)) $code = 4917;
            }
            else if ($format == 'dateRange')
            {
              if (!Validation::isDateRange($fieldValue)) $code = 4918;
            }
            else if ($format == 'datetimeRange')
            {
              if (!Validation::isDateTimeRange($fieldValue)) $code = 4919;
            }
            else
            {
              $code = 4900;
            }
            if (!is_null($code))
            {
              $message = '';
              if (array_key_exists($fieldName, $messageMap))
              {
                $message = $messageMap[$fieldName];
              }
              else
              {
                if ($code == 4901)
                {
                  $message = $fieldText . Jtbc::take('universal:phrases.can-not-be-empty', 'lng');
                }
                else
                {
                  $message = $fieldText . Jtbc::take('universal:phrases.incorrect-format', 'lng');
                }
              }
              $errorCollector -> collect(['code' => $code, 'message' => $message, 'field' => $fieldName, 'format' => $format]);
            }
          }
        }
      }
      $result = $errorCollector -> isEmpty()? true: $errorCollector -> getResult();
    }
    return $result;
  }

  public function __construct(array $argTableInfo)
  {
    $this -> tableInfo = $argTableInfo;
  }
}