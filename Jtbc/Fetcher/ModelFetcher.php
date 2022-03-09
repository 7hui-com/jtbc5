<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Fetcher;
use Jtbc\Env;
use Jtbc\Jtbc;
use Jtbc\Module;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\Model\TinyModel;

class ModelFetcher
{
  public static function fetch(array $argParam)
  {
    $result = [];
    $param = $argParam;
    $ss = new Substance($param);
    $table = $ss -> table;
    if (is_null($table))
    {
      $module = new Module($ss -> genre);
      $table = $ss -> exists('subtable')? $module -> getTableNameByKey($ss -> subtable): $module -> getTableName();
    }
    if (is_string($table))
    {
      $where = $ss -> where;
      $orderBy = $ss -> orderBy;
      $groupBy = $ss -> groupBy;
      $limit = $ss -> limit ?? [10];
      if (is_int($limit)) $limit = [$limit];
      $additionalSQL = $ss -> additionalSQL;
      $fields = $ss -> fields ?? '*';
      $model = new TinyModel(tableName: $table, DBLink: $ss -> DBLink);
      $autoFilter = $ss -> autoFilter ?? ['published' => 1, 'lang' => Env::getMajorLang()];
      if (is_array($autoFilter))
      {
        foreach ($autoFilter as $key => $value)
        {
          if ($model -> table -> hasField($key))
          {
            $model -> where -> {$key} = $value;
          }
        }
      }
      if (is_array($where))
      {
        $model -> where($where);
      }
      if (is_array($groupBy))
      {
        foreach ($groupBy as $item)
        {
          if (is_array($item))
          {
            $model -> groupBy(...$item);
          }
        }
      }
      if (is_array($orderBy))
      {
        foreach ($orderBy as $item)
        {
          if (is_array($item))
          {
            $model -> orderBy(...$item);
          }
        }
      }
      else
      {
        if ($model -> table -> hasField('order'))
        {
          $model -> orderBy('order', 'desc');
        }
        else if ($model -> table -> hasField('time'))
        {
          $model -> orderBy('time', 'desc');
        }
        else if ($model -> table -> hasField('id'))
        {
          $model -> orderBy('id', 'desc');
        }
      }
      if (is_array($limit))
      {
        $model -> limit(...$limit);
      }
      if (is_string($additionalSQL))
      {
        $model -> where -> setAdditionalSQL($additionalSQL);
      }
      $result = $model -> getAll($fields) -> toArray();
    }
    return $result;
  }
}