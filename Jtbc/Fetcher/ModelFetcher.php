<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Fetcher;
use Jtbc\Env;
use Jtbc\Module;
use Jtbc\Substance;
use Jtbc\Model\TinyModel;
use Jtbc\Exception\NotExistException;

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
      if ($module -> isExists())
      {
        $table = $ss -> exists('subtable')? $module -> getTableNameByKey($ss -> subtable): $module -> getTableName();
      }
      else
      {
        if ($ss -> mode == 'strict')
        {
          throw new NotExistException('Module "' . $ss -> genre . '" does not exist', 50404);
        }
      }
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
      $lang = $ss -> lang ?? Env::getMajorLang();
      $model = new TinyModel(tableName: $table, DBLink: $ss -> DBLink);
      $autoFilter = ['lang' => $lang];
      if (is_null($ss -> autoFilter))
      {
        $autoFilter['published'] = 1;
      }
      else if (is_array($ss -> autoFilter))
      {
        $autoFilter = array_merge($autoFilter, $ss -> autoFilter);
      }
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
          if ($model -> table -> hasField('id'))
          {
            $model -> orderBy('id', 'asc');
          }
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