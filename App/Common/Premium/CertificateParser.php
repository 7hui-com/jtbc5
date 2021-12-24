<?php
namespace App\Common\Premium;
use Jtbc\Path;
use Jtbc\JSON;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\Exception\FormatException;
use Jtbc\Exception\NotSupportedException;
use App\Common\Official\OfficialRSAEncrypter;

class CertificateParser
{
  private $cert;
  private $certContent;

  private function isValidCert(Substance $cert)
  {
    $result = false;
    $certArr = $cert -> all();
    if (array_key_exists('sign', $certArr))
    {
      $sign = $certArr['sign'];
      unset($certArr['sign']);
      $result = OfficialRSAEncrypter::publicVerify(JSON::encode($certArr), $sign);
    }
    return $result;
  }

  public function getAppId()
  {
    return $this -> cert -> app_id;
  }

  public function getAppSecret()
  {
    return $this -> cert -> app_secret;
  }

  public function getExpiredAt()
  {
    return $this -> cert -> expired_at;
  }

  public function isExpired()
  {
    $result = false;
    $expiredAt = intval($this -> getExpiredAt());
    if (time() - $expiredAt > 0)
    {
      $result = true;
    }
    return $result;
  }

  public function isValidPremiumSign(string $argData, string $argPremiumSign)
  {
    $result = false;
    $data = $argData;
    $premiumSign = $argPremiumSign;
    if (md5($this -> getAppId() . ':' . $data) == $premiumSign)
    {
      $result = true;
    }
    return $result;
  }

  public function __construct(string $argCertContent)
  {
    $this -> certContent = $argCertContent;
    $certData = base64_decode($this -> certContent);
    if (Validation::isJSON($certData))
    {
      $currentCert = new Substance(JSON::decode($certData));
      if ($this -> isValidCert($currentCert))
      {
        $this -> cert = $currentCert;
      }
      else
      {
        throw new NotSupportedException('This certificate is not supported', 50415);
      }
    }
    else
    {
      throw new FormatException('$argCertContent must be a valid JSON string', 50101);
    }
  }
}