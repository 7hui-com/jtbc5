<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\File;

class FileHelper
{
  public static function formatFileSize($argSize)
  {
    $result = '';
    $size = intval($argSize);
    if ($size == 0) $result = '0B';
    else
    {
      $sizename = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      $result = round($size / pow(1024, ($i = floor(log($size, 1024)))), 2) . $sizename[$i];
    }
    return $result;
  }

  public static function getFileGroup(string $argFileType)
  {
    $fileGroup = 0;
    $fileType = $argFileType;
    if (in_array($fileType, ['jpg','jpeg','gif','png','webp','svg']))
    {
      $fileGroup = 1;
    }
    else if (in_array($fileType, ['mp4','m4a','mov']))
    {
      $fileGroup = 2;
    }
    else if (in_array($fileType, ['doc','docx','xls','xlsx','ppt','pptx','pdf']))
    {
      $fileGroup = 3;
    }
    else if (in_array($fileType, ['zip','rar','gz']))
    {
      $fileGroup = 4;
    }
    return $fileGroup;
  }
}