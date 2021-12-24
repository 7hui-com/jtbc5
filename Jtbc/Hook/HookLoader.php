<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Hook;
use Jtbc\Hook;
use Jtbc\Substance;
use Jtbc\Exception\NotExistException;

class HookLoader
{
  private $configClassName;

  public function load(Hook $hook)
  {
    $hooks = constant($this -> configClassName . '::HOOKS');
    if (is_array($hooks))
    {
      foreach ($hooks as $item)
      {
        if (is_callable($item))
        {
          $hookSource = call_user_func($item);
          if ($hookSource instanceof Substance)
          {
            foreach ($hookSource as $hookName => $hookContent)
            {
              if (is_string($hookName))
              {
                $hook -> add($hookName, $hookContent);
              }
            }
          }
        }
      }
    }
    return $hook;
  }

  public function __construct(string $argConfigClassName)
  {
    $configClassName = $this -> configClassName = $argConfigClassName;
    if (!class_exists($configClassName))
    {
      throw new NotExistException('Class "' . $configClassName . '" does not exist', 50404);
    }
  }
}