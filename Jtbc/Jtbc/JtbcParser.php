<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Jtbc;
use Closure;
use Jtbc\Config;
use Jtbc\Converter;
use Jtbc\Env;
use Jtbc\Encoder;
use Jtbc\Date;
use Jtbc\Fetcher;
use Jtbc\JSON;
use Jtbc\Jtbc;
use Jtbc\Kernel;
use Jtbc\Path;
use Jtbc\Random;
use Jtbc\Validation;
use Jtbc\Fetcher\DataLoader;
use Jtbc\File\FileHelper;
use Jtbc\Security\CSRFToken;
use Jtbc\String\StringHelper;
use Jtbc\Template\TinyRenderer;
use Jtbc\Exception\NotCallableException;

class JtbcParser
{
  private static $alias = [];

  private static function execute($argString, $argEnvParamPrefix = '')
  {
    $result = '';
    $string = $argString;
    $envParamPrefix = $argEnvParamPrefix;
    if (!Validation::isEmpty($string))
    {
      if (Validation::isEmpty($envParamPrefix) || Validation::isNatural($envParamPrefix))
      {
        $string = preg_replace('/\#(.[0-9a-zA-Z_]*)/', Env::class . '::getParam(trim(\'' . $envParamPrefix . '${1}\'))', $string);
      }
      $string = preg_replace('/\$([^\_].[0-9a-zA-Z_]*)\(/', self::class . '::getAliasFunction(\'${1}\')(', $string);
      $string = preg_replace('/\$([^\_].[0-9a-zA-Z_]*)/', Env::class . '::getParam(\'$this\') -> getParam(trim(\'${1}\'))', $string);
      $result = eval('return ' . $string . ';');
    }
    return $result;
  }

  private static function rematch(array $argFirstMatchResult)
  {
    $result = [];
    $firstMatchResult = $argFirstMatchResult;
    $cut = function($argString)
    {
      $result = '';
      $string = $argString;
      if (!Validation::isEmpty($string))
      {
        $number = 0;
        $started = false;
        $newStringArr = [];
        $stringArr = str_split($string);
        foreach ($stringArr as $str)
        {
          if ($str == '{')
          {
            $number += 1;
            if ($started == false)
            {
              $started = true;
            }
          }
          else if ($str == '}')
          {
            $number -= 1;
          }
          $newStringArr[] = $str;
          if ($started === true && $number === 0)
          {
            break;
          }
        }
        $result = implode($newStringArr);
      }
      return $result;
    };
    foreach ($firstMatchResult as $item)
    {
      $newItem = $cut($item);
      $result[] = [
        0 => $newItem,
        1 => substr($newItem, 3, strlen($newItem) - 4),
      ];
    }
    return $result;
  }

  public static function getAliasMap()
  {
    $aliasMap = [
      'convertJSONToArray' => Converter::class,
      'convertToArrayWithKey' => Converter::class,
      'convertToOption' => Converter::class,
      'convertToVersionString' => Converter::class,
      'createCSRFToken' => CSRFToken::class . '::create',
      'dataLoader' => DataLoader::class . '::load',
      'desensitize' => StringHelper::class,
      'fetch' => Fetcher::class,
      'formatDate' => Date::class . '::format',
      'formatFileSize' => FileHelper::class,
      'formatTimestamp' => Date::class,
      'getActualRoute' => Path::class,
      'getBestMatchedString' => StringHelper::class,
      'getClipedString' => StringHelper::class,
      'getKernelVersion' => Kernel::class . '::getVersion',
      'getLeftString' => StringHelper::class,
      'getMajorGenre' => Env::class,
      'getMajorLang' => Env::class,
      'getNumeric28' => Random::class,
      'getRandom' => Random::class,
      'getValueFromJSON' => JSON::class,
      'htmlEncode' => Encoder::class,
      'jsonDecode' => JSON::class . '::decode',
      'jsonEncode' => JSON::class . '::encode',
      'now' => Date::class,
      'render' => TinyRenderer::class,
      'saltedMD5' => Encoder::class,
      'take' => Jtbc::class,
      'takeAndFormatToCheckbox' => JtbcFormatter::class . '::checkbox',
      'takeAndFormatToOption' => JtbcFormatter::class . '::option',
      'takeAndFormatToRadio' => JtbcFormatter::class . '::radio',
      'thisDay' => Date::class,
      'today' => Date::class,
      'tomorrow' => Date::class,
      'theDayAfterTomorrow' => Date::class,
      'unifyLineEndings' => Encoder::class,
    ];
    $configAliasMap = Config::get('Jtbc/JtbcParser', 'alias_map');
    if (is_array($configAliasMap) && !empty($configAliasMap))
    {
      $aliasMap = array_merge($aliasMap, $configAliasMap);
    }
    return $aliasMap;
  }

  public static function getAliasFunction(string $argName)
  {
    $aliasFunction = null;
    $name = $argName;
    if (array_key_exists($name, self::$alias))
    {
      $aliasFunction = self::$alias[$name];
    }
    else
    {
      $aliasMap = self::getAliasMap();
      if (array_key_exists($name, $aliasMap))
      {
        $currentAlias = $aliasMap[$name];
        $aliasFunction = self::$alias[$name] = function(...$args) use ($name, $currentAlias)
        {
          $functionName = $currentAlias;
          if (!str_contains($functionName, '::'))
          {
            $functionName .= '::' . $name;
          }
          return call_user_func_array($functionName, $args);
        };
      }
      else
      {
        $aliasFunction = function(...$args) use ($name)
        {
          $result = null;
          $that = Env::getParam('$this');
          if (is_object($that) && method_exists($that, 'getParam'))
          {
            $function = $that -> getParam(trim($name));
            if ($function instanceof Closure)
            {
              $result = $function(...$args);
            }
            else
            {
              throw new NotCallableException('Call to undefined function "$' . $name . '"', 50406);
            }
          }
          return $result;
        };
      }
    }
    return $aliasFunction;
  }

  public static function preParse($argString)
  {
    $tmpstr = $argString;
    if (!Validation::isEmpty($tmpstr))
    {
      $pregMatch = [];
      preg_match_all('/{\$<(.[^\}]*)}/', $tmpstr, $pregMatch, PREG_SET_ORDER);
      foreach ($pregMatch as $item)
      {
        if (count($item) == 2)
        {
          $key = $item[0];
          $value = self::execute($item[1]) ?? '';
          $tmpstr = str_replace($key, $value, $tmpstr);
        }
      }
    }
    return $tmpstr;
  }

  public static function parse($argString, $argEnvParamPrefix = '')
  {
    $tmpstr = $argString;
    $envParamPrefix = $argEnvParamPrefix;
    if (!Validation::isEmpty($tmpstr))
    {
      $firstMatchResult = [];
      $tempArr = explode('{$=', $tmpstr);
      foreach ($tempArr as $key => $value)
      {
        if ($key !== 0)
        {
          $firstMatchResult[] = '{$=' . StringHelper::getClipedString($value, '}', 'left+') . '}';
        }
      }
      $matchResult = self::rematch($firstMatchResult);
      foreach ($matchResult as $item)
      {
        if (count($item) == 2)
        {
          $key = $item[0];
          $value = self::execute($item[1], $envParamPrefix) ?? '';
          $tmpstr = str_replace($key, $value, $tmpstr);
        }
      }
    }
    return $tmpstr;
  }
}