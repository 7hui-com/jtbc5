<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Security;
use Jtbc\Validation;

class IPv4Checker
{
  private $rules;

  private function match(string $argRule, string $argIPv4)
  {
    $result = false;
    $ruleArr = explode('.', $argRule);
    $ipv4Arr = explode('.', $argIPv4);
    if (count($ruleArr) === 4 && count($ipv4Arr) === 4)
    {
      $result = true;
      for ($i = 0; $i < 4; $i ++)
      {
        $matched = false;
        $ruleItem = $ruleArr[$i];
        $ipv4Item = $ipv4Arr[$i];
        if ($ruleItem == '*')
        {
          $matched = true;
        }
        else if ($ruleItem == $ipv4Item)
        {
          $matched = true;
        }
        else if (str_contains($ruleItem, '~'))
        {
          $ruleItemArr = explode('~', $ruleItem);
          if (count($ruleItemArr) == 2)
          {
            $startNumber = $ruleItemArr[0];
            $endNumber = $ruleItemArr[1];
            if (is_numeric($startNumber) && is_numeric($endNumber) && is_numeric($ipv4Item))
            {
              if (intval($ipv4Item) >= intval($startNumber) && intval($ipv4Item) <= intval($endNumber))
              {
                $matched = true;
              }
            }
          }
        }
        if ($matched === false)
        {
          $result = false;
          break;
        }
      }
    }
    return $result;
  }

  public function addRule(string $argRule)
  {
    $this -> rules[] = $argRule;
    return $this;
  }

  public function isMatched($argIPv4)
  {
    $result = false;
    $ipv4 = $argIPv4;
    if (Validation::isIPv4($ipv4))
    {
      foreach ($this -> rules as $rule)
      {
        if ($this -> match($rule, $ipv4))
        {
          $result = true;
          break;
        }
      }
    }
    return $result;
  }

  public function __construct(array $argRules = [])
  {
    $this -> rules = $argRules;
  }
}