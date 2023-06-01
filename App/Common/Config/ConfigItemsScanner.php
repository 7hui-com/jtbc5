<?php
namespace App\Common\Config;
use Jtbc\Jtbc;
use Jtbc\JSON;
use Jtbc\Substance;
use Jtbc\Validation;
use Jtbc\Module\ModuleFinder;

class ConfigItemsScanner
{
  private $isCacheable;
  private $orderedItems;
  
  public function scan()
  {
    $result = [];
    $moduleFinder = new ModuleFinder('config', $this -> isCacheable);
    $folders = $moduleFinder -> getModules();
    foreach ($folders as $folder)
    {
      $items = Jtbc::take('global.' . $folder . ':config.items', 'cfg');
      if (!is_null($items) && Validation::isJSON($items))
      {
        $itemsArr = JSON::decode($items);
        if (is_array($itemsArr))
        {
          foreach ($itemsArr as $key => $value)
          {
            if (is_string($key) && is_array($value))
            {
              if (Validation::isConstantName($key))
              {
                $result[$key] = array_merge(array_key_exists($key, $result)? $result[$key]: [], $value);
              }
            }
          }
        }
      }
    }
    return $result;
  }

  public function getOrderedItems()
  {
    $result = [];
    if (is_array($this -> orderedItems))
    {
      $result = $this -> orderedItems;
    }
    else
    {
      $data = $this -> scan();
      if (!empty($data))
      {
        $tempArr = [];
        $index = count($data);
        foreach ($data as $key => $value)
        {
          if (is_array($value))
          {
            $index -= 1;
            $tempArr[] = ['key' => $key, 'index' => array_key_exists('__index', $value)? intval($value['__index']): $index, 'value' => $value];
          }
        }
        if (!empty($tempArr))
        {
          array_multisort(array_column($tempArr, 'index'), SORT_DESC, $tempArr);
          foreach ($tempArr as $item)
          {
            $ss = new Substance($item);
            $result[strtolower($ss -> key)] = $ss -> value;
          }
        }
      }
      $this -> orderedItems = $result;
    }
    return $result;
  }

  public function getFormSchemaByKey(string $argKey)
  {
    $result = [];
    $key = strtolower($argKey);
    $orderedItems = $this -> getOrderedItems();
    if (array_key_exists($key, $orderedItems))
    {
      $data = $orderedItems[$key];
      if (is_array($data) && !empty($data))
      {
        $tempArr = [];
        $index = count($data);
        foreach ($data as $key => $value)
        {
          $index -= 1;
          if (Validation::isConstantName($key) && is_array($value))
          {
            $tempArr[] = ['key' => $key, 'index' => array_key_exists('__index', $value)? intval($value['__index']): $index, 'value' => $value];
          }
        }
        if (!empty($tempArr))
        {
          array_multisort(array_column($tempArr, 'index'), SORT_DESC, $tempArr);
          foreach ($tempArr as $item)
          {
            $ss = new Substance($item);
            $required = is_bool($ss -> required)? $ss -> required: true;
            $ss -> value = array_filter($ss -> value, fn($key) => !str_starts_with($key, '_'), ARRAY_FILTER_USE_KEY);
            $result[] = array_merge($ss -> value, ['name' => $ss -> key, 'required' => $required]);
          }
        }
      }
    }
    return $result;
  }

  public function __construct(bool $argIsCacheable = true)
  {
    $this -> isCacheable = $argIsCacheable;
  }
}