<?php
namespace App\Common\Config;
use Jtbc\Jtbc;
use Jtbc\JSON;
use Jtbc\Module;
use Jtbc\Validation;
use Jtbc\Module\ModuleFinder;

class ConfigSourcesScanner
{
  private $isCacheable;

  public function scan()
  {
    $result = [];
    $moduleFinder = new ModuleFinder('config', $this -> isCacheable);
    $folders = $moduleFinder -> getModules();
    foreach ($folders as $folder)
    {
      $sources = Jtbc::take('global.' . $folder . ':config.sources', 'cfg');
      if (!is_null($sources) && Validation::isJSON($sources))
      {
        $sourcesArr = JSON::decode($sources);
        if (is_array($sourcesArr))
        {
          $result[$folder] = $sourcesArr;
        }
      }
    }
    return $result;
  }

  public function getSourcesOptions(...$args)
  {
    $result = [];
    $data = $this -> scan();
    $createOption = function($genre, $item) use ($args, &$result)
    {
      if (is_string($genre) && is_array($item))
      {
        $title = '';
        $value = [];
        if (array_key_exists('title', $item))
        {
          $title = strval($item['title']);
        }
        else
        {
          $module = new Module($genre);
          $title = $module -> getTitle(...$args);
        }
        if (array_key_exists('value', $item) && is_array($item['value']))
        {
          $value = $item['value'];
        }
        if (!array_key_exists('genre', $value))
        {
          $value['genre'] = $genre;
        }
        $result[] = ['text' => $title . '(' . $genre . ')', 'value' => JSON::encode($value)];
      }
    };
    foreach ($data as $key => $value)
    {
      if (empty($value))
      {
        $createOption($key, $value);
      }
      else if (Validation::isArrayList($value))
      {
        foreach ($value as $item)
        {
          $createOption($key, $item);
        }
      }
      else
      {
        $createOption($key, $value);
      }
    }
    return $result;
  }

  public function __construct(bool $argIsCacheable = true)
  {
    $this -> isCacheable = $argIsCacheable;
  }
}