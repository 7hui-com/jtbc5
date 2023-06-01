<?php
namespace App\Common\Config;
use Jtbc\Jtbc;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\Exception\ErrorCollector;

class ConfigItemsValidator
{
  public static function validate(array $argFormSchema, array $argData)
  {
    $formSchema = $argFormSchema;
    $data = new Substance($argData);
    $errorCollector = new ErrorCollector();
    foreach ($formSchema as $item)
    {
      $code = null;
      $needToValidate = false;
      $ss = new Substance($item);
      $required = is_bool($ss -> required)? $ss -> required: true;
      $format = $ss -> format;
      $fieldName = $ss -> name;
      $fieldText = $ss -> text;
      $fieldValue = $data -> {$fieldName};
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
        if ($format == null)
        {
          if (Validation::isEmpty($fieldValue)) $code = 4901;
        }
        else if ($format == 'int')
        {
          if (!Validation::isInteger($fieldValue)) $code = 4902;
        }
        else if ($format == 'chinese')
        {
          if (!Validation::isChinese($fieldValue)) $code = 4916;
        }
        else if ($format == 'date')
        {
          if (!Validation::isDate($fieldValue)) $code = 4904;
        }
        else if ($format == 'dateRange')
        {
          if (!Validation::isDateRange($fieldValue)) $code = 4918;
        }
        else if ($format == 'datetime')
        {
          if (!Validation::isDateTime($fieldValue)) $code = 4905;
        }
        else if ($format == 'datetimeRange')
        {
          if (!Validation::isDateTimeRange($fieldValue)) $code = 4919;
        }
        else if ($format == 'email')
        {
          if (!Validation::isEmail($fieldValue)) $code = 4903;
        }
        else if ($format == 'idcard')
        {
          if (!Validation::isIDCard($fieldValue)) $code = 4906;
        }
        else if ($format == 'intSeries')
        {
          if (!Validation::isIntSeries($fieldValue)) $code = 4910;
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
        else if ($format == 'json')
        {
          if (!Validation::isJSON($fieldValue)) $code = 4909;
        }
        else if ($format == 'mobile')
        {
          if (!Validation::isMobile($fieldValue)) $code = 4908;
        }
        else if ($format == 'name')
        {
          if (!Validation::isName($fieldValue)) $code = 4907;
        }
        else if ($format == 'natural')
        {
          if (!Validation::isNatural($fieldValue)) $code = 4911;
        }
        else if ($format == 'slug')
        {
          if (!Validation::isSlug($fieldValue)) $code = 4917;
        }
        else if ($format == 'time')
        {
          if (!Validation::isTime($fieldValue)) $code = 4920;
        }
        else if ($format == 'timeRange')
        {
          if (!Validation::isTimeRange($fieldValue)) $code = 4921;
        }
        else if ($format == 'url')
        {
          if (!Validation::isURL($fieldValue)) $code = 4912;
        }
        else
        {
          $code = 4900;
        }
      }
      if (!is_null($code))
      {
        $message = match($code)
        {
          4901 => $fieldText . Jtbc::take('universal:phrases.can-not-be-empty', 'lng'),
          default => $fieldText . Jtbc::take('universal:phrases.incorrect-format', 'lng'),
        };
        $errorCollector -> collect(['code' => $code, 'message' => $message, 'field' => $fieldName, 'format' => $format]);
      }
    }
    return $errorCollector -> isEmpty()? true: $errorCollector -> getResult();
  }
}