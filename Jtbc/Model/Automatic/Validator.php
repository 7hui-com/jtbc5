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
        $between = null;
        $maxlength = null;
        $field = new Substance($item);
        $fieldName = $field -> field;
        $fieldComment = $field -> comment;
        $fieldText = FieldNameHelper::getFieldText($fieldName);
        if (!Validation::isEmpty($fieldComment))
        {
          $comment = new Substance($fieldComment);
          if ($comment -> exists('mode'))
          {
            $mode = $comment -> mode;
          }
          if ($comment -> exists('required'))
          {
            $required = is_bool($comment -> required)? $comment -> required: true;
          }
          if ($comment -> exists('format'))
          {
            $format = strval($comment -> format);
          }
          if ($comment -> exists('between'))
          {
            $between = is_array($comment -> between)? $comment -> between: null;
          }
          if ($comment -> exists('maxlength'))
          {
            $maxlength = intval($comment -> maxlength);
          }
          if ($comment -> exists('text'))
          {
            $fieldText = strval($comment -> text);
          }
        }
        if ($mode != 'auto')
        {
          $code = null;
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
          if (is_int($maxlength) && mb_strlen($fieldValue) > $maxlength)
          {
            $code = 4999;
          }
          else if ($needToValidate == true)
          {
            if ($format == null)
            {
              if (Validation::isEmpty($fieldValue)) $code = 4901;
            }
            else if ($format == 'int')
            {
              if (!Validation::isInteger($fieldValue)) $code = 4902;
              else
              {
                if (is_array($between) && count($between) == 2)
                {
                  if (intval($fieldValue) < intval($between[0]) || intval($fieldValue) > intval($between[1]))
                  {
                    $code = 4998;
                  }
                }
              }
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
              $message = match($code)
              {
                4901 => $fieldText . Jtbc::take('universal:phrases.can-not-be-empty', 'lng'),
                4998 => $fieldText . Jtbc::take('universal:phrases.number-out-of-range', 'lng'),
                4999 => $fieldText . Jtbc::take('universal:phrases.maxlength-limit', 'lng'),
                default => $fieldText . Jtbc::take('universal:phrases.incorrect-format', 'lng'),
              };
            }
            $errorCollector -> collect(['code' => $code, 'message' => $message, 'field' => $fieldName, 'format' => $format]);
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