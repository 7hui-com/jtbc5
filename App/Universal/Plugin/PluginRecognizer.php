<?php
namespace App\Universal\Plugin;
use Jtbc\Jtbc;
use Jtbc\Path;
use Jtbc\Validation;
use Jtbc\String\StringHelper;
use App\Common\Official\OfficialRSAEncrypter;
use App\Common\Premium\PremiumAccountLoader;

class PluginRecognizer
{
  private $genre;
  private $pluginId;
  private $pluginName;
  private $pluginVersion;
  private $pluginPremiumSign;
  private $pluginSign;
  private $isPremium;

  private function isPremiumPlugin()
  {
    $result = false;
    if (!Validation::isEmpty($this -> pluginSign))
    {
      if (OfficialRSAEncrypter::publicVerify($this -> pluginPremiumSign, $this -> pluginSign))
      {
        $premiumAccount = PremiumAccountLoader::getInstance();
        if ($premiumAccount -> isValidCertificate())
        {
          $data = 'plugin:' . strval($this -> pluginId) . ':' . $this -> pluginName;
          if ($premiumAccount -> certificate -> isValidPremiumSign($data, $this -> pluginPremiumSign))
          {
            $result = true;
          }
        }
      }
    }
    return $result;
  }

  public function __get($argName)
  {
    $result = null;
    $name = $argName;
    if ($name == 'isPremium')
    {
      $result = $this -> isPremium;
    }
    else if ($name == 'genre')
    {
      $result = $this -> genre;
    }
    else if ($name == 'pluginId')
    {
      $result = $this -> pluginId;
    }
    else if ($name == 'pluginVersion')
    {
      $result = $this -> pluginVersion;
    }
    return $result;
  }

  public function __construct(string $argGenre = null)
  {
    $this -> pluginId = 0;
    $this -> pluginVersion = 0;
    $this -> isPremium = false;
    $this -> genre = $argGenre ?? Path::getCurrentGenre();
    $this -> pluginName = StringHelper::getClipedString($this -> genre, '/', 'right');
    if (is_file(Path::getActualRoute($this -> genre) . '/common/plugin.jtbc'))
    {
      $this -> pluginId = intval(Jtbc::take('global.' . $this -> genre . ':plugin.id', 'cfg'));
      $this -> pluginVersion = intval(Jtbc::take('global.' . $this -> genre . ':plugin.version', 'cfg'));
      $this -> pluginPremiumSign = strval(Jtbc::take('global.' . $this -> genre . ':plugin.premium-sign', 'cfg'));
      $this -> pluginSign = strval(Jtbc::take('global.' . $this -> genre . ':plugin.sign', 'cfg'));
      $this -> isPremium = $this -> isPremiumPlugin();
    }
  }
}