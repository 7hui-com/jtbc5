<?php
namespace App\Console\Common\Lang;
use Jtbc\Path;
use Jtbc\JSON;
use Jtbc\Jtbc;
use Config\Diplomatist as Config;

class LangManager
{
  private $dir;
  private $availableLanguages;
  private $lastErrorCode = 0;

  public function getLastErrorCode()
  {
    return $this -> lastErrorCode;
  }

  public function setLang(array $argLanguages)
  {
    $result = false;
    $languages = $argLanguages ?: ['zh-cn'];
    $availableLanguages = $this -> availableLanguages;
    if (is_array($availableLanguages))
    {
      $allLanguages = [];
      $hasUnknownLanguage = false;
      $filePath = Path::getActualRoute($this -> dir . '/common/language/sel_lang.jtbc');
      foreach ($languages as $language)
      {
        if (!is_string($language))
        {
          $hasUnknownLanguage = true;
          break;
        }
        else
        {
          if (!array_key_exists($language, $availableLanguages))
          {
            $hasUnknownLanguage = true;
            break;
          }
          else
          {
            $allLanguages[] = $availableLanguages[$language];
          }
        }
      }
      if ($hasUnknownLanguage !== false)
      {
        $this -> lastErrorCode = 1002;
      }
      else if (empty($allLanguages))
      {
        $this -> lastErrorCode = 1003;
      }
      else if (!is_file($filePath))
      {
        $this -> lastErrorCode = 1004;
      }
      else if (!is_writable($filePath))
      {
        $this -> lastErrorCode = 1005;
      }
      else
      {
        $content = [];
        $content[] = '<?xml version="1.0" encoding="utf-8"?>';
        $content[] = '<xml mode="jtbc" author="jetiben">';
        $content[] = '  <configure>';
        $content[] = '    <node>item</node>';
        $content[] = '    <field>name,zh-cn</field>';
        $content[] = '    <base>item_list</base>';
        $content[] = '  </configure>';
        $content[] = '  <item_list>';
        foreach ($allLanguages as $language)
        {
          if (is_array($language) && array_key_exists('key', $language) && array_key_exists('text', $language))
          {
            $content[] = '    <item>';
            $content[] = '      <name><![CDATA[' . intval($language['key']) . ']]></name>';
            $content[] = '      <zh-cn><![CDATA[' . strval($language['text']) . ']]></zh-cn>';
            $content[] = '    </item>';
          }
        }
        $content[] = '  </item_list>';
        $content[] = '</xml>';
        if (@file_put_contents($filePath, implode(chr(13) . chr(10), $content)))
        {
          $result = true;
        }
        else
        {
          $this -> lastErrorCode = 1444;
        }
      }
    }
    else
    {
      $this -> lastErrorCode = 1001;
    }
    return $result;
  }

  public function __construct()
  {
    $this -> dir = Config::CONSOLE_DIR;
    $this -> availableLanguages = JSON::decode(Jtbc::take('global.' . $this -> dir . ':config.available-languages', 'cfg'));
  }
}