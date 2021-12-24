<?php
namespace App\Universal\Upload;
use Jtbc\ORM;
use Jtbc\JSON;
use Jtbc\Substance;
use Jtbc\Validation;

class UploadedStatus
{
  public static function reset(string $argGenre, int $argAssociatedId, int $argGroup = 0)
  {
    $result = false;
    $genre = $argGenre;
    $associatedId = $argAssociatedId;
    $group = $argGroup;
    $model = new Model();
    $model -> where -> genre = $genre;
    $model -> where -> associated_id = $associatedId;
    $model -> where -> group = $group;
    $model -> pocket -> status = 2;
    $re = $model -> save();
    if (is_numeric($re))
    {
      $result = true;
    }
    return $result;
  }

  public static function update(string $argGenre, int $argAssociatedId, string $argFileInfo, int $argGroup = 0)
  {
    $bool = false;
    $genre = $argGenre;
    $associatedId = $argAssociatedId;
    $fileInfo = $argFileInfo;
    $group = $argGroup;
    $fileInfoArr = JSON::decode($fileInfo);
    if (is_array($fileInfoArr))
    {
      $updateStatus = function($argUploadId) use (&$bool, $genre, $associatedId, $group)
      {
        $uploadId = intval($argUploadId);
        if ($uploadId != 0)
        {
          $model = new Model();
          $model -> where -> id = $uploadId;
          $model -> pocket -> status = 1;
          $model -> pocket -> genre = $genre;
          $model -> pocket -> associated_id = $associatedId;
          $model -> pocket -> group = $group;
          $re = $model -> save();
          if (is_numeric($re)) $bool = true;
        }
      };
      $updateStatusByArr = function(array $argArr) use (&$updateStatusByArr, &$updateStatus)
      {
        $arr = $argArr;
        if (array_key_exists('uploadid', $arr))
        {
          $updateStatus($arr['uploadid']);
        }
        else
        {
          foreach ($arr as $item)
          {
            if (is_array($item))
            {
              if (array_key_exists('uploadid', $item))
              {
                $updateStatus($item['uploadid']);
              }
              else
              {
                foreach ($item as $subItem)
                {
                  if (is_array($subItem))
                  {
                    $updateStatusByArr($subItem);
                  }
                  else if (is_string($subItem) && in_array(substr($subItem, 0, 1), ['[', '{']))
                  {
                    $subItemArr = JSON::decode($subItem);
                    if (is_array($subItemArr))
                    {
                      $updateStatusByArr($subItemArr);
                    }
                  }
                }
              }
            }
          }
        }
      };
      $updateStatusByArr($fileInfoArr);
    }
    return $bool;
  }

  public static function autoUpdate(ORM $model, string $argGenre, int $argAssociatedId, int $argGroup = 0)
  {
    $result = false;
    $genre = $argGenre;
    $associatedId = $argAssociatedId;
    $group = $argGroup;
    $tableInfo = $model -> table -> getTableInfo();
    if (is_array($tableInfo))
    {
      $model -> where -> id = $associatedId;
      $rs = $model -> get();
      if ($rs != null)
      {
        self::reset($genre, $associatedId, $group);
        foreach ($tableInfo as $item)
        {
          $field = new Substance($item);
          $fieldName = $field -> field;
          $fieldComment = $field -> comment;
          if (!Validation::isEmpty($fieldComment))
          {
            $comment = new Substance(JSON::decode($fieldComment));
            if ($comment -> has_upload === true)
            {
              $fileInfo = $rs[$fieldName];
              if (!is_null($fileInfo))
              {
                $result = self::update($genre, $associatedId, $fileInfo, $group);
              }
            }
          }
        }
      }
    }
    return $result;
  }
}