<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc;
use Jtbc\DB\DBFactory;
use Jtbc\DB\Schema\SchemaViewer;
use Jtbc\ORM\ActualRecord;
use Jtbc\String\StringHelper;
use Jtbc\Exception\EmptyException;
use Jtbc\Exception\NotExistException;
use Jtbc\Exception\NotCallableException;
use Jtbc\Exception\NotSupportedException;
use Jtbc\Exception\UnexpectedException;

abstract class ORM
{
  private $db;
  private $dal;
  private $table;
  private $where;
  protected $hook;
  protected $tableName;
  protected $DBLink;
  protected $autoFilter = true;
  public $pocket;
  public $coffer;
  public $pagination;
  public $pageNum = 0;
  public $pageSize = 0;
  public $lastInsertId = 0;
  public $currentSubstance;

  public function get($argFields = '*')
  {
    $result = null;
    $fields = $argFields;
    $rs = $this -> dal -> select($fields);
    if (is_array($rs))
    {
      $result = $this -> currentSubstance = new Substance($rs);
    }
    $this -> hook -> retrieved -> trigger($this, $result);
    return $result;
  }

  public function getAll($argFields = '*')
  {
    $result = [];
    $fields = $argFields;
    $rsa = $this -> dal -> selectAll($fields);
    if (is_array($rsa))
    {
      foreach ($rsa as $rs)
      {
        $result[] = new Substance($rs);
      }
    }
    $this -> hook -> retrieved -> trigger($this, $result);
    return new ActualRecord($result, fn($currentSubstance) => $this -> currentSubstance = $currentSubstance);
  }

  public function getCount()
  {
    return $this -> dal -> getRsCount();
  }

  public function getOne($argFields = '*')
  {
    $result = [];
    $fields = $argFields;
    $rs = $this -> get($fields);
    if (!is_null($rs))
    {
      $result[] = new Substance($rs);
    }
    $this -> hook -> retrieved -> trigger($this, $result);
    return new ActualRecord($result, fn($currentSubstance) => $this -> currentSubstance = $currentSubstance);
  }

  public function getPage($argFields = '*')
  {
    $result = [];
    $fields = $argFields;
    if ($this -> pageSize != 0)
    {
      $this -> pagination = new Pagination($this -> dal);
      $rsa = $this -> pagination -> selectAll($this -> pageNum, $this -> pageSize, $fields);
      if (is_array($rsa))
      {
        foreach ($rsa as $rs)
        {
          $result[] = new Substance($rs);
        }
      }
      $this -> hook -> retrieved -> trigger($this, $result);
    }
    return new ActualRecord($result, fn($currentSubstance) => $this -> currentSubstance = $currentSubstance);
  }

  public function getQuery($argFields = '*')
  {
    return $this -> dal -> getSelectSQL($argFields);
  }

  public function getTableName()
  {
    $result = $this -> tableName;
    if (is_null($result))
    {
      $className = StringHelper::getClipedString(get_called_class(), '\\', 'right');
      $result = strtolower(preg_replace('/(?<=[a-z])([A-Z])/', '_$1', $className));
    }
    return $result;
  }

  public function possesses($argRelated, ?string $argForeignKey = null, ?string $argLocalKey = null, ?array $argAdditionalWhere = null)
  {
    $related = $argRelated;
    $foreignKey = $argForeignKey ?? $this -> getTableName() . '_id';
    $localKey = $argLocalKey ?? 'id';
    $additionalWhere = $argAdditionalWhere ?? [];
    $field[] = $localKey;
    $relatedInstance = is_string($related)? new $related(): $related;
    if ($relatedInstance instanceof self)
    {
      $currentSubstance = $this -> currentSubstance ?? $this -> get($field);
      if (is_null($currentSubstance))
      {
        throw new EmptyException('Current record can not be empty', 50204);
      }
      else
      {
        if ($currentSubstance -> exists($localKey))
        {
          if (!empty($additionalWhere))
          {
            $relatedInstance -> where($additionalWhere);
          }
          $relatedInstance -> where -> {$foreignKey} = $currentSubstance[$localKey];
        }
        else
        {
          throw new NotExistException('Local key "' . $localKey . '" does not exist', 50404);
        }
      }
    }
    else
    {
      throw new NotCallableException('$related is not an instance of ORM', 50406);
    }
    return $relatedInstance;
  }

  public function belongsTo($argRelated, ?string $argForeignKey = null, ?string $argTargetKey = null, ?array $argAdditionalWhere = null)
  {
    $related = $argRelated;
    $targetKey = $argTargetKey ?? 'id';
    $additionalWhere = $argAdditionalWhere ?? [];
    $relatedInstance = is_string($related)? new $related(): $related;
    $foreignKey = $argForeignKey ?? $relatedInstance -> getTableName() . '_id';
    $field[] = $foreignKey;
    if ($relatedInstance instanceof self)
    {
      $currentSubstance = $this -> currentSubstance ?? $this -> get($field);
      if (is_null($currentSubstance))
      {
        throw new EmptyException('Current record can not be empty', 50204);
      }
      else
      {
        if ($currentSubstance -> exists($foreignKey))
        {
          if (!empty($additionalWhere))
          {
            $relatedInstance -> where($additionalWhere);
          }
          $relatedInstance -> where -> {$targetKey} = $currentSubstance[$foreignKey];
        }
        else
        {
          throw new NotExistException('Foreign key "' . $foreignKey . '" does not exist', 50404);
        }
      }
    }
    else
    {
      throw new NotCallableException('$related is not an instance of ORM', 50406);
    }
    return $relatedInstance;
  }

  public function remove($argCautiousMode = true, bool $argPhysically = false)
  {
    $result = false;
    $physically = $argPhysically;
    $cautiousMode = $argCautiousMode;
    if ($this -> dal -> isEmptyCondition())
    {
      if ($cautiousMode == false)
      {
        $result = $this -> dal -> delete($physically);
        $this -> hook -> deleted  -> trigger($this);
      }
    }
    else
    {
      $result = $this -> dal -> delete($physically);
      $this -> hook -> deleted -> trigger($this);
    }
    return $result;
  }

  public function save(?Substance $argPocket = null)
  {
    $result = false;
    $pocket = $argPocket ?? $this -> pocket;
    $source = $pocket -> all();
    if (!empty($source))
    {
      if ($this -> dal -> isEmptyCondition())
      {
        $result = $this -> dal -> insert($source);
        $this -> lastInsertId = $this -> dal -> lastInsertId;
        $this -> hook -> inserted -> trigger($this, $result, $source);
      }
      else
      {
        $result = $this -> dal -> update($source);
        $this -> hook -> updated -> trigger($this, $result, $source);
      }
    }
    return $result;
  }

  public function submit(...$args): bool
  {
    return is_numeric($this -> save(...$args));
  }

  public function truncate(bool $argAreYouSure = false)
  {
    $result = false;
    $areYouSure = $argAreYouSure;
    if ($this -> dal -> isEmptyCondition())
    {
      $result = $this -> dal -> truncate($areYouSure);
      $this -> hook -> truncated -> trigger($this, $result);
    }
    else
    {
      throw new NotSupportedException('Method [truncate] can only be called independently', 50415);
    }
    return $result;
  }

  public function where($argWhere)
  {
    $where = $argWhere;
    if (is_callable($where))
    {
      $this -> where -> and($where);
    }
    else if (is_array($where))
    {
      $methodMap = ['equal', 'unEqual', 'min', 'max', 'in', 'notIn', 'like', 'notLike', 'between', 'notBetween', 'greaterThan', 'lessThan', 'sameAs'];
      foreach ($where as $key => $value)
      {
        if (is_scalar($value))
        {
          $this -> where -> {$key} = $value;
        }
        else if (is_array($value))
        {
          foreach ($value as $method => $args)
          {
            if (in_array($method, $methodMap))
            {
              if (is_scalar($args))
              {
                $this -> where -> {$key} -> {$method}($args);
              }
              else if (is_array($args))
              {
                $this -> where -> {$key} -> {$method}(...$args);
              }
              else
              {
                throw new NotSupportedException('$value\'s type is not supported', 50415);
              }
            }
            else
            {
              throw new NotExistException('Method [' . $method . '] does not exist', 50404);
            }
          }
        }
        else
        {
          throw new NotSupportedException('$value\'s type is not supported', 50415);
        }
      }
    }
    else
    {
      throw new UnexpectedException('Unexpected argument(s)', 50801);
    }
    return $this;
  }

  public function __call($argName, $args) 
  {
    $result = null;
    $name = $argName;
    switch ($name)
    {
      case 'groupBy':
        $result = $this -> dal -> groupBy(...$args);
        break;
      case 'having':
        $result = $this -> dal -> having(...$args);
        break;
      case 'orderBy':
        $result = $this -> dal -> orderBy(...$args);
        break;
      case 'limit':
        $result = $this -> dal -> limit(...$args);
        break;
    }
    return $result;
  }

  public function __get($argName)
  {
    $result = null;
    $name = $argName;
    if ($name == 'db')
    {
      $result = $this -> db;
    }
    else if ($name == 'hook')
    {
      $result = $this -> hook;
    }
    else if ($name == 'where')
    {
      $result = $this -> where;
    }
    else if ($name == 'table')
    {
      $result = $this -> table;
    }
    return $result;
  }

  public function __set($argName, $argValue)
  {
    throw new NotSupportedException('Setting unknown property', 50415);
  }

  public function __construct()
  {
    $this -> hook = new Hook();
    $this -> pocket = new Substance();
    $this -> coffer = new Substance();
    $this -> db = DBFactory::getInstance($this -> DBLink);
    $this -> dal = new DAL($this -> getTableName(), $this -> DBLink, $this -> autoFilter);
    $this -> table = new class($this -> getTableName(), $this -> db) {
      private $schemaViewer;
      private $tableName = null;
      private $parentTableName = null;

      public function getName()
      {
        return $this -> tableName;
      }

      public function hasField($field)
      {
        return $this -> schemaViewer -> hasField($this -> getName(), $field);
      }

      public function getFields()
      {
        return $this -> schemaViewer -> getFields($this -> getName());
      }

      public function getFieldInfo($field)
      {
        return $this -> schemaViewer -> getFieldInfo($this -> getName(), $field);
      }

      public function getTableInfo()
      {
        return $this -> schemaViewer -> getTableInfo($this -> getName());
      }

      public function __construct($tableName, $db)
      {
        $this -> tableName = $tableName;
        $this -> schemaViewer = new SchemaViewer($db);
      }
    };
    $this -> where = new class($this -> dal) {
      private $dal;

      public function and(...$args)
      {
        $this -> dal -> and(...$args);
      }

      public function or(...$args)
      {
        $this -> dal -> or(...$args);
      }

      public function addAdditionalSQL(...$args)
      {
        return $this -> dal -> addAdditionalSQL(...$args);
      }

      public function setAdditionalSQL(...$args)
      {
        return $this -> dal -> setAdditionalSQL(...$args);
      }

      public function setFuzzyLike(...$args)
      {
        return $this -> dal -> setFuzzyLike(...$args);
      }

      public function __get($name)
      {
        return $this -> dal -> {$name};
      }

      public function __set($name, $value)
      {
        $this -> dal -> {$name} = $value;
      }

      public function __construct($dal)
      {
        $this -> dal = $dal;
      }
    };
  }
}