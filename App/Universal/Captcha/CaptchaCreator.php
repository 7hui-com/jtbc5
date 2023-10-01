<?php
namespace App\Universal\Captcha;

class CaptchaCreator
{
  private $code;
  private $codeLength = 4;
  private $blockCount = 6;
  private $fonts = [];
  private $fontsize = 18;
  private $source = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y'];
  private $img;
  private $imgWidth;
  private $imgHeight;

  private function addInterferenceStrings(int $argTotalCount = 32, $argStringColor = null)
  {
    $totalCount = max(1, $argTotalCount);
    $stringColor = $argStringColor;
    if (!is_null($this -> img))
    {
      $width = $this -> imgWidth;
      $height = $this -> imgHeight;
      $interferenceStrings = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '*', '@', '$', '%', '&', '#', '/', ':', ';', '?', '!'];
      for ($i = 0; $i < $totalCount; $i ++)
      {
        $currentFont = $this -> fonts[mt_rand(0, count($this -> fonts) - 1)];
        $currentStr = $interferenceStrings[mt_rand(0, count($interferenceStrings) - 1)];
        $currentStringColor = $stringColor ?? imagecolorallocate($this -> img, mt_rand(64, 160), mt_rand(64, 160), mt_rand(64, 160));
        imagettftext($this -> img, mt_rand(4, ceil($this -> fontsize / 2)), mt_rand(-180, 180), mt_rand(0, $width), mt_rand(0, $height), $currentStringColor, $currentFont, $currentStr);
      }
    }
  }

  public function getCode()
  {
    if (is_null($this -> code))
    {
      $code = [];
      $maxIndex = count($this -> source) - 1;
      for ($i = 0; $i < $this -> codeLength; $i ++)
      {
        $code[] = $this -> source[mt_rand(0, $maxIndex)];
      }
      $this -> code = implode($code);
    }
    return $this -> code;
  }

  public function create(int $argWidth = 118, int $argHeight = 28)
  {
    $blockCount = $this -> blockCount;
    $this -> imgWidth = max(98, $argWidth);
    $this -> imgHeight = max(28, $argHeight);
    $this -> img = imagecreatetruecolor($this -> imgWidth, $this -> imgHeight);
    $bgColor = imagecolorallocate($this -> img, mt_rand(0, 128), mt_rand(0, 128), mt_rand(0, 128));
    imagefill($this -> img, 0, 0, $bgColor);
    $blockSize = ceil($this -> imgWidth / $blockCount);
    for ($i = 0; $i < $blockCount; $i ++)
    {
      $blockImg = imagecreatetruecolor($blockSize, $this -> imgHeight);
      $blockBgColor = imagecolorallocate($blockImg, mt_rand(0, 128), mt_rand(0, 128), mt_rand(0, 128));
      imagefill($blockImg, 0, 0, $blockBgColor);
      imagecopymerge($this -> img, $blockImg, $blockSize * $i + mt_rand(-10, 10), 0, 0, 0, $blockSize, $this -> imgHeight, 100);
      imagedestroy($blockImg);
    }
    $this -> addInterferenceStrings(32);
    $this -> addInterferenceStrings(mt_rand(4, 12), imagecolorallocate($this -> img, mt_rand(180, 220), mt_rand(180, 220), mt_rand(180, 220)));
    $codeArr = str_split($this -> getCode());
    $codeImg = imagecreatetruecolor($this -> imgWidth, $this -> imgHeight);
    $codeBgColor = imagecolorallocatealpha($codeImg, 255, 255, 255, 127);
    $codeFontColor = imagecolorallocate($codeImg, 255, 255, 255);
    imagefill($codeImg, 0, 0, $codeBgColor);
    $startX = ceil($this -> imgWidth * 0.9 / $this -> codeLength);
    $currentFont = $this -> fonts[mt_rand(0, count($this -> fonts) - 1)];
    for ($i = 0; $i < $this -> codeLength; $i ++)
    {
      imagettftext($codeImg, $this -> fontsize, mt_rand(-20, 20), round($this -> imgWidth * 0.05 + $startX * $i + mt_rand(1, 4)), round($this -> imgHeight / 1.4), $codeFontColor, $currentFont, $codeArr[$i]);
    }
    for ($x = 0; $x < $this -> imgWidth; $x ++)
    {
      for ($y = 0; $y < $this -> imgHeight; $y ++)
      {
        $rgba = imagecolorsforindex($codeImg, imagecolorat($codeImg, $x, $y));
        if (array_key_exists('alpha', $rgba) && intval($rgba['alpha']) == 0)
        {
          if (in_array(mt_rand(0, 4), [2, 3]))
          {
            imagesetpixel($codeImg, $x, $y, imagecolorallocatealpha($codeImg, mt_rand(0, 128), mt_rand(0, 128), mt_rand(0, 128), mt_rand(0, 64)));
          }
        }
      }
    }
    imagecolortransparent($codeImg, $codeBgColor);
    imagesavealpha($codeImg, true);
    imagecopymerge($this -> img, $codeImg, 0, 0, 0, 0, $this -> imgWidth, $this -> imgHeight, 70);
    imagedestroy($codeImg);
    ob_start();
    imagepng($this -> img);
    imagedestroy($this -> img);
    return ob_get_clean();
  }

  public function __construct(array $argFonts, int $argFontSize = 18, int $argCodeLength = 4)
  {
    $this -> fonts = $argFonts;
    $this -> fontsize = $argFontSize;
    $this -> codeLength = $argCodeLength;
  }
}