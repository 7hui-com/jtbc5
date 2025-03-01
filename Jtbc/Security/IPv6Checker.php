<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Security;
use Jtbc\Converter;
use Jtbc\Validation;

class IPv6Checker
{
  private $rules;

  private function match(string $argRule, string $argIPv6)
  {
    $result = false;
    $ruleArr = explode(':', $argRule);
    $ipv6 = Converter::convertToStandardIPv6($argIPv6);
    if (is_string($ipv6))
    {
      $ipv6Arr = explode(':', $ipv6);
      if (count($ruleArr) === 8 && count($ipv6Arr) === 8)
      {
        $result = true;
        for ($i = 0; $i < 8; $i ++)
        {
          $matched = false;
          $ruleItem = $ruleArr[$i];
          $ipv6Item = $ipv6Arr[$i];
          if ($ruleItem == '*')
          {
            $matched = true;
          }
          else if ($ruleItem == $ipv6Item)
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
              if (Validation::isHex($startNumber) && Validation::isHex($endNumber) && Validation::isHex($ipv6Item))
              {
                if (intval(hexdec($ipv6Item)) >= intval(hexdec($startNumber)) && intval(hexdec($ipv6Item)) <= intval(hexdec($endNumber)))
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
    }
    return $result;
  }

  public function addRule(string $argRule)
  {
    $this -> rules[] = $argRule;
    return $this;
  }

  public function isMatched($argIPv6)
  {
    $result = false;
    $ipv6 = $argIPv6;
    if (Validation::isIPv6($ipv6))
    {
      foreach ($this -> rules as $rule)
      {
        if ($this -> match($rule, $ipv6))
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