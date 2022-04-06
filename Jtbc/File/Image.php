<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\File;
use Jtbc\Exception\FileException;

class Image
{
  private $image;
  private $imageWidth;
  private $imageHeight;
  private $imageType;

  public function getImageWidth()
  {
    return $this -> imageWidth;
  }

  public function getImageHeight()
  {
    return $this -> imageHeight;
  }

  public function getImageType()
  {
    return $this -> imageType;
  }

  public function watermarkText(string $argText, string $argTTFFilePath, int $argFontSize = 14, int $argOrigin = 0, int $argX = null, int $argY = null, array $argColorRGBA = null)
  {
    $bool = true;
    $x = $y = 20;
    $xAuto = $yAuto = false;
    $text = $argText;
    $TTFFilePath = $argTTFFilePath;
    $origin = $argOrigin;
    if (!is_null($argX)) $x = $argX;
    else $xAuto = true;
    if (!is_null($argY)) $y = $argY;
    else $yAuto = true;
    $fontSize = $argFontSize;
    $colorRGBA = $argColorRGBA;
    $colorR = $colorG = $colorB = $alpha = 0;
    if (is_array($colorRGBA))
    {
      if (count($colorRGBA) == 4)
      {
        list($colorR, $colorG, $colorB, $alpha) = $colorRGBA;
        if ($colorR < 0) $colorR = 0;
        if ($colorR > 255) $colorR = 255;
        if ($colorG < 0) $colorG = 0;
        if ($colorG > 255) $colorG = 255;
        if ($colorB < 0) $colorB = 0;
        if ($colorB > 255) $colorB = 255;
        if ($alpha < 0) $alpha = 0;
        if ($alpha > 100) $alpha = 100;
      }
    }
    $currentX = $currentY = 0;
    $imageWidth = $this -> imageWidth;
    $imageHeight = $this -> imageHeight;
    $color = imagecolorallocatealpha($this -> image, $colorR, $colorG, $colorB, 127 - 127 * $alpha / 100);
    $fontBox = imagettfbbox($fontSize, 0, realpath($TTFFilePath), $text);
    if ($origin == -1)
    {
      $currentX = round(($imageWidth / 2) - ($fontBox[4] - $fontBox[6]) / 2);
      $currentY = round(($imageHeight / 2) - ($fontBox[7] + $fontBox[1]) / 2);
      if ($xAuto == false) $currentX + $x;
      if ($yAuto == false) $currentY + $y;
    }
    else if ($origin == 0)
    {
      $currentX = $x - $fontBox[6];
      $currentY = $y - $fontBox[7];
    }
    else if ($origin == 1)
    {
      $currentX = $imageWidth - $x - $fontBox[4];
      $currentY = $y - $fontBox[5];
    }
    else if ($origin == 2)
    {
      $currentX = $x - $fontBox[0];
      $currentY = $imageHeight - $y - $fontBox[1];
    }
    else if ($origin == 3)
    {
      $currentX = $imageWidth - $x - $fontBox[2];
      $currentY = $imageHeight - $y - $fontBox[3];
    }
    imagettftext($this -> image, $fontSize, 0, $currentX, $currentY, $color, realpath($TTFFilePath), $text);
    return $bool;
  }

  public function watermarkImage(string $argImageFileName, int $argOrigin = 0, int $argX = null, int $argY = null, int $argOpacity = 100)
  {
    $bool = true;
    $x = $y = 20;
    $xAuto = $yAuto = false;
    $imageFileName = $argImageFileName;
    $origin = $argOrigin;
    if (!is_null($argX)) $x = $argX;
    else $xAuto = true;
    if (!is_null($argY)) $y = $argY;
    else $yAuto = true;
    $opacity = $argOpacity;
    if ($opacity < 0) $opacity = 0;
    if ($opacity > 100) $opacity = 100;
    if (is_file($imageFileName))
    {
      $imageFile = null;
      $imageFilePathinfo = pathinfo($imageFileName);
      $imageFileExtension = $imageFilePathinfo['extension'];
      $imageFileInfo = getimagesize($imageFileName);
      if (is_array($imageFileInfo))
      {
        $imageFileMIME = $imageFileInfo['mime'];
        $imageFileWidth = $imageFileInfo[0];
        $imageFileHeight = $imageFileInfo[1];
        if (in_array($imageFileExtension, ['jpg', 'jpeg']) && $imageFileMIME == 'image/jpeg')
        {
          $imageFile = imagecreatefromjpeg($imageFileName);
        }
        else if ($imageFileExtension == 'gif' && $imageFileMIME == 'image/gif')
        {
          $imageFile = imagecreatefromgif($imageFileName);
        }
        else if ($imageFileExtension == 'png' && $imageFileMIME == 'image/png')
        {
          $imageFile = imagecreatefrompng($imageFileName);
        }
        else if ($imageFileExtension == 'webp' && $imageFileMIME == 'image/webp')
        {
          $imageFile = imagecreatefromwebp($imageFileName);
        }
      }
      if (!is_null($imageFile) && $imageFile !== false)
      {
        $currentX = $currentY = 0;
        $imageWidth = $this -> imageWidth;
        $imageHeight = $this -> imageHeight;
        if ($origin == -1)
        {
          $currentX = round($imageWidth / 2 - $imageFileWidth / 2);
          $currentY = round($imageHeight / 2 - $imageFileHeight / 2);
          if ($xAuto == false) $currentX + $x;
          if ($yAuto == false) $currentY + $y;
        }
        else if ($origin == 0)
        {
          $currentX = $x;
          $currentY = $y;
        }
        else if ($origin == 1)
        {
          $currentX = $imageWidth - $imageFileWidth - $x;
          $currentY = $y;
        }
        else if ($origin == 2)
        {
          $currentX = $x;
          $currentY = $imageHeight - $imageFileHeight - $y;
        }
        else if ($origin == 3)
        {
          $currentX = $imageWidth - $imageFileWidth - $x;
          $currentY = $imageHeight - $imageFileHeight - $y;
        }
        if ($opacity == 100) imagecopy($this -> image, $imageFile, $currentX, $currentY, 0, 0, $imageFileWidth, $imageFileHeight);
        else imagecopymerge($this -> image, $imageFile, $currentX, $currentY, 0, 0, $imageFileWidth, $imageFileHeight, $opacity);
        if (is_resource($imageFile)) imagedestroy($imageFile);
        $bool = true;
      }
    }
    return $bool;
  }

  public function resize(int $argWidth = 0, int $argHeight = 0, string $argMode = 'cover', int $argRotate = 0)
  {
    $bool = false;
    $width = $argWidth;
    $height = $argHeight;
    $mode = $argMode;
    $rotate = $argRotate;
    if ($width >= 0 && $height >= 0)
    {
      $imageX = 0;
      $imageY = 0;
      $imageWidth = $originalImageWidth = $this -> imageWidth;
      $imageHeight = $originalImageHeight = $this -> imageHeight;
      if ($width == 0) $width = $imageWidth;
      if ($height == 0) $height = $imageHeight;
      if ($mode == 'cover')
      {
        $proportion1 = $imageWidth / $width;
        $proportion2 = $imageHeight / $height;
        if ($proportion1 >= $proportion2)
        {
          $originalImageWidth = $proportion2 * $width;
          $imageX = round(abs($imageWidth - $originalImageWidth) / 2);
        }
        else
        {
          $originalImageHeight = $proportion1 * $height;
          $imageY = round(abs($imageHeight - $originalImageHeight) / 2);
        }
      }
      else if ($mode == 'contain')
      {
        if ($imageWidth <= $width && $imageHeight <= $height)
        {
          $width = $imageWidth;
          $height = $imageHeight;
        }
        else
        {
          $proportion1 = $imageWidth / $width;
          $proportion2 = $imageHeight / $height;
          if ($imageWidth <= $width) $width = $imageWidth / $proportion2;
          else if ($imageHeight <= $height) $height = $imageHeight / $proportion1;
          else
          {
            if ($proportion1 >= $proportion2) $height = $imageHeight / $proportion1;
            else $width = $imageWidth / $proportion2;
          }
        }
      }
      $newImage = imagecreatetruecolor($width, $height);
      $bgColor = imagecolorallocate($newImage, 255, 255, 255);
      imagefill($newImage, 0, 0, $bgColor);
      imagecopyresampled($newImage, $this -> image, 0, 0, $imageX, $imageY, $width, $height, $originalImageWidth, $originalImageHeight);
      if ($rotate != 0) $newImage = imagerotate($newImage, $rotate, $bgColor);
      $this -> image = $newImage;
      $bool = true;
    }
    return $bool;
  }

  public function saveAs(string $argFilename, int $argQuality = 100)
  {
    $bool = false;
    $filename = $argFilename;
    $quality = $argQuality;
    if ($quality < 0) $quality = 0;
    if ($quality > 100) $quality = 100;
    switch ($this -> imageType)
    {
      case 'jpg':
        $bool = imagejpeg($this -> image, $filename, $quality);
        break;
      case 'gif':
        $bool = imagegif($this -> image, $filename);
        break;
      case 'png':
        $bool = imagepng($this -> image, $filename);
        break;
      case 'webp':
        $bool = imagewebp($this -> image, $filename, $quality);
        break;
    }
    return $bool;
  }

  public function __construct(string $argFilename)
  {
    $filename = $argFilename;
    if (!is_file($filename))
    {
      throw new FileException('Could not find the file "' . $filename . '"', 50404);
    }
    else
    {
      $pathinfo = pathinfo($filename);
      $extension = $pathinfo['extension'];
      $imageInfo = getimagesize($filename);
      if (is_array($imageInfo))
      {
        $imageMIME = $imageInfo['mime'];
        $imageWidth = $this -> imageWidth = $imageInfo[0];
        $imageHeight = $this -> imageHeight = $imageInfo[1];
        if (in_array($extension, ['jpg', 'jpeg']) && $imageMIME == 'image/jpeg')
        {
          $this -> imageType = 'jpg';
          $this -> image = imagecreatefromjpeg($filename);
        }
        else if ($extension == 'gif' && $imageMIME == 'image/gif')
        {
          $this -> imageType = 'gif';
          $this -> image = imagecreatefromgif($filename);
        }
        else if ($extension == 'png' && $imageMIME == 'image/png')
        {
          $this -> imageType = 'png';
          $this -> image = imagecreatefrompng($filename);
        }
        else if ($extension == 'webp' && $imageMIME == 'image/webp')
        {
          $this -> imageType = 'webp';
          $this -> image = imagecreatefromwebp($filename);
        }
      }
      if (is_null($this -> image) || $this -> image === false)
      {
        throw new FileException('Could not load the file "' . $filename . '"', 50404);
      }
    }
  }

  public function __destruct()
  {
    if (is_resource($this -> image)) imagedestroy($this -> image);
  }
}