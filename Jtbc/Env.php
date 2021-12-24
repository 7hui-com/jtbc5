<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;

class Env
{
  private static $param = [];
  private static $language = null;
  private static $template = null;
  private static $majorGenre = null;
  private static $majorLang = null;

  private static function getConfig(string $argName)
  {
    return Config::get(substr(strrchr(__CLASS__, chr(92)), 1), $argName);
  }

  private static function getAllLanguages()
  {
    return self::getConfig('language_map');
  }

  public static function getParam($argName)
  {
    $param = null;
    $name = $argName;
    if (self::hasParam($name))
    {
      $param = self::$param[$name];
    }
    return $param;
  }

  public static function hasParam($argName)
  {
    $bool = false;
    $name = $argName;
    if (array_key_exists($name, self::$param))
    {
      $bool = true;
    }
    return $bool;
  }

  public static function setParam($argName, $argValue)
  {
    $name = $argName;
    $value = $argValue;
    self::$param[$name] = $value;
    return $value;
  }

  public static function setParams(array $argParams, $argPrefix = '')
  {
    $params = $argParams;
    $prefix = $argPrefix;
    foreach ($params as $key => $val)
    {
      self::setParam($prefix . $key, $val);
    }
  }

  public static function getLang(string $argLanguage = null)
  {
    $lang = 0;
    $language = $argLanguage ?? self::getLanguage();
    $allLanguages = self::getAllLanguages();
    foreach ($allLanguages as $key => $val)
    {
      if ($key == $language)
      {
        $lang = intval($val);
        break;
      }
    }
    return $lang;
  }

  public static function getDefaultLang()
  {
    return self::getLang(self::getDefaultLanguage());
  }

  public static function getLanguage()
  {
    return self::$language ?? self::getDefaultLanguage();
  }

  public static function getDefaultLanguage()
  {
    return self::getConfig('language');
  }

  public static function getLanguageByID(int $argLang)
  {
    $lang = $argLang;
    $result = self::getLanguage();
    $allLanguages = self::getAllLanguages();
    foreach ($allLanguages as $key => $val)
    {
      if ($lang === intval($val))
      {
        $result = $key;
        break;
      }
    }
    return $result;
  }

  public static function setLanguage($argLanguage)
  {
    $language = $argLanguage;
    self::$language = $language;
  }

  public static function getTemplate()
  {
    return self::$template ?? self::getDefaultTemplate();
  }

  public static function getDefaultTemplate()
  {
    return self::getConfig('template');
  }

  public static function setTemplate($argTemplate)
  {
    $template = $argTemplate;
    self::$template = $template;
  }

  public static function getMajorGenre()
  {
    return self::$majorGenre;
  }

  public static function getMajorLang()
  {
    return self::$majorLang ?? self::getLang();
  }

  public static function setMajorGenre(string $argMajorGenre)
  {
    self::$majorGenre = $argMajorGenre;
  }

  public static function setMajorLang(int $argMajorLang)
  {
    self::$majorLang = $argMajorLang;
  }
}