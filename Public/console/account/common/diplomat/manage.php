<?php
namespace Jtbc;
use Jtbc\Model\TinyModel;
use Jtbc\Model\StandardModel;
use Jtbc\Security\CSRFToken;
use App\Console\Common\BasicSubstance;
use App\Console\Account\Model as AccountModel;
use App\Console\Role\Model as RoleModel;
use App\Console\Log\Logger;
use App\Console\Common\Ambassador;
use App\Console\Common\Traits\Action;

class Diplomat extends Ambassador {
  use Action\Typical\Batch;
  use Action\Typical\Delete;

  private function getRoleList()
  {
    $result = [];
    $roleModel = new RoleModel();
    $roleModel -> orderBy('order', 'desc');
    $roleModel -> orderBy('id', 'asc');
    $roleRsa = $roleModel -> getAll(['id', 'title']);
    $result[] = ['id' => 0, 'title' => Jtbc::take('::communal.please-select', 'lng')];
    if ($this -> guard -> role -> isSuper)
    {
      $result[] = ['id' => -1, 'title' => Jtbc::take('::communal.role-super', 'lng')];
    }
    foreach ($roleRsa as $roleRs)
    {
      $result[] = ['id' => intval($roleRs -> id), 'title' => $roleRs -> title];
    }
    return $result;
  }

  private function getRoleTitle($argRoleId)
  {
    $result = 'Unkown';
    $roleId = intval($argRoleId);
    if ($roleId == -1)
    {
      $result = Jtbc::take('::communal.role-super', 'lng');
    }
    else
    {
      $roleModel = new RoleModel();
      $roleModel -> where -> id = $roleId;
      $rs = $roleModel -> get();
      if ($rs != null)
      {
        $result = $rs -> title;
      }
    }
    return $result;
  }

  public function add()
  {
    $bs = new BasicSubstance($this);
    $bs -> data -> roleList = $this -> getRoleList();
    return $bs -> toJSON();
  }

  public function edit(Request $req)
  {
    $data = [];
    $status = 200;
    $id = intval($req -> get('id'));
    $model = new TinyModel();
    $model -> where -> id = $id;
    $rs = $model -> get();
    if (is_null($rs))
    {
      $status = 404;
    }
    else
    {
      $data = $rs -> toArray();
    }
    $bs = new BasicSubstance($this);
    $bs -> data -> data = $data;
    $bs -> data -> status = $status;
    $bs -> data -> roleList = $this -> getRoleList();
    return $bs -> toJSON();
  }

  public function list(Request $req)
  {
    $page = intval($req -> get('page'));
    $locked = intval($req -> get('locked') ?? -1);
    $pagesize = intval(Jtbc::getConfig('pagesize'));
    $model = new TinyModel();
    $model -> pageNum = $page;
    $model -> pageSize = $pagesize;
    if ($locked != -1)
    {
      $model -> where -> locked = $locked;
    }
    if (!$this -> guard -> role -> isSuper)
    {
      $model -> where -> role -> unEqual(-1);
    }
    $model -> orderBy('time', 'desc');
    $data = $model -> getPage('~');
    foreach ($data as $item)
    {
      $item -> role_title = $this -> getRoleTitle($item -> role);
    }
    $bs = new BasicSubstance($this);
    $bs -> data -> data = $data;
    $bs -> data -> pagination = [
      'pagenum' => $model -> pagination -> pageNum,
      'pagecount' => $model -> pagination -> pageCount,
    ];
    return $bs -> toJSON();
  }

  public function actionAdd(Request $req)
  {
    $code = 0;
    $message = '';
    $ss = new Substance();
    $source = $req -> post();
    if ($this -> guard -> role -> checkPermission('add') && CSRFToken::verify($this -> getParam('uniqid'), strval($req -> post('csrf_token'))))
    {
      $errorTips = [];
      $validator = new Validator($source);
      if ($validator -> password -> isEmpty())
      {
        $errorTips[] = ['code' => 4001, 'message' => Jtbc::take('manage.text-code-4001', 'lng')];
      }
      if (!$validator -> password -> sameAs('password_repeat'))
      {
        $errorTips[] = ['code' => 4002, 'message' => Jtbc::take('manage.text-code-4002', 'lng')];
      }
      if (intval($validator -> role -> value()) == 0)
      {
        $errorTips[] = ['code' => 4003, 'message' => Jtbc::take('manage.text-code-4003', 'lng')];
      }
      if (!$this -> guard -> role -> isSuper && intval($validator -> role -> value()) == -1)
      {
        $errorTips[] = ['code' => 4004, 'message' => Jtbc::take('manage.text-code-4004', 'lng')];
      }
      $model = new StandardModel();
      $model -> pocket = new Substance($source);
      $model -> coffer -> password = Encoder::passwordHash($model -> pocket -> password);
      $autoValidate = $model -> autoValidate();
      if ($autoValidate !== true)
      {
        $errorTips = array_merge($autoValidate -> error, $errorTips);
      }
      if (empty($errorTips))
      {
        $accountModel = new AccountModel();
        $accountModel -> where -> username = $model -> pocket -> username;
        $rs = $accountModel -> get();
        if ($rs != null)
        {
          $code = 4011;
          $message = Jtbc::take('manage.text-code-4011', 'lng');
        }
        else
        {
          $re = $model -> autoSave();
          if (is_numeric($re))
          {
            $code = 1;
            $id = $model -> lastInsertId;
            Logger::log($this, '::communal.log-add', ['id' => $id]);
          }
        }
      }
      else
      {
        $code = $errorTips[0]['code'];
        $message = $errorTips[0]['message'];
        $ss -> errorTips = $errorTips;
      }
    }
    else
    {
      $code = 4403;
      $message = Jtbc::take('::communal.text-tips-error-4403', 'lng');
    }
    $ss -> code = $code;
    $ss -> message = Jtbc::take('manage.text-add-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }

  public function actionEdit(Request $req)
  {
    $code = 0;
    $message = '';
    $ss = new Substance();
    $id = intval($req -> get('id'));
    $source = $req -> post();
    if ($this -> guard -> role -> checkPermission('edit') && CSRFToken::verify($this -> getParam('uniqid'), strval($req -> post('csrf_token'))))
    {
      $errorTips = [];
      $hasPassword = false;
      $validator = new Validator($source);
      if (!$validator -> password -> isEmpty())
      {
        $hasPassword = true;
        if (!$validator -> password -> sameAs('password_repeat'))
        {
          $errorTips[] = ['code' => 4002, 'message' => Jtbc::take('manage.text-code-4002', 'lng')];
        }
      }
      if (intval($validator -> role -> value()) == 0)
      {
        $errorTips[] = ['code' => 4003, 'message' => Jtbc::take('manage.text-code-4003', 'lng')];
      }
      if (!$this -> guard -> role -> isSuper && intval($validator -> role -> value()) == -1)
      {
        $errorTips[] = ['code' => 4004, 'message' => Jtbc::take('manage.text-code-4004', 'lng')];
      }
      $model = new StandardModel();
      $model -> where -> id = $id;
      $model -> pocket = new Substance($source);
      if ($hasPassword == true)
      {
        $model -> coffer -> password = Encoder::passwordHash($model -> pocket -> password);
      }
      $autoValidate = $model -> autoValidate();
      if ($autoValidate !== true)
      {
        $errorTips = array_merge($autoValidate -> error, $errorTips);
      }
      if (empty($errorTips))
      {
        $accountModel = new AccountModel();
        $accountModel -> where -> username = $model -> pocket -> username;
        $accountModel -> where -> id -> unEqual($id);
        $rs = $accountModel -> get();
        if ($rs != null)
        {
          $code = 4011;
          $message = Jtbc::take('manage.text-code-4011', 'lng');
        }
        else
        {
          $re = $model -> autoSave();
          if (is_numeric($re))
          {
            $code = 1;
            $message = Jtbc::take('::communal.save-done', 'lng');
            Logger::log($this, '::communal.log-edit', ['id' => $id]);
          }
        }
      }
      else
      {
        $code = $errorTips[0]['code'];
        $message = $errorTips[0]['message'];
        $ss -> errorTips = $errorTips;
      }
    }
    else
    {
      $code = 4403;
      $message = Jtbc::take('::communal.text-tips-error-4403', 'lng');
    }
    $ss -> code = $code;
    $ss -> message = Jtbc::take('manage.text-edit-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }
}