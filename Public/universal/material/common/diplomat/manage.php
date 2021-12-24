<?php
namespace Jtbc;
use Jtbc\Date;
use Jtbc\Validation;
use Jtbc\Model\TinyModel;
use App\Console\Common\EmptySubstance;
use App\Console\Common\BasicSubstance;
use App\Console\Common\Ambassador;
use App\Console\Common\Traits\Action;
use App\Console\Log\Logger;
use App\Universal\Upload\chunkFile;
use App\Universal\Upload\UploaderFactory;

class Diplomat extends Ambassador {
  use Action\Typical\Batch;
  use Action\Typical\Delete;

  public function edit(Request $req)
  {
    $id = intval($req -> get('id'));
    $model = new TinyModel();
    $model -> where -> id = $id;
    $bs = new BasicSubstance($this);
    $bs -> data -> data = $model -> get();
    return $bs -> toJSON();
  }

  public function list(Request $req)
  {
    $page = intval($req -> get('page'));
    $filegroup = intval($req -> get('filegroup') ?? -1);
    $pagesize = intval(Jtbc::getConfig('pagesize'));
    $model = new TinyModel();
    $model -> pageNum = $page;
    $model -> pageSize = $pagesize;
    if ($filegroup != -1)
    {
      $model -> where -> filegroup = $filegroup;
    }
    $model -> orderBy('id', 'desc');
    $bs = new BasicSubstance($this);
    $bs -> data -> data = $model -> getPage();
    $bs -> data -> pagination = [
      'pagenum' => $model -> pagination -> pageNum,
      'pagecount' => $model -> pagination -> pageCount,
    ];
    return $bs -> toJSON();
  }

  public function actionAdd(Request $req)
  {
    $code = 0;
    $param = '';
    $message = '';
    $ss = new Substance();
    if ($this -> guard -> role -> checkPermission('add'))
    {
      $chunkFile = new chunkFile($req);
      $uploader = UploaderFactory::getInstance($this -> di, $this -> getParam('genre'), false);
      $uploadFile = $uploader -> uploadFile($chunkFile);
      if (!is_null($uploadFile))
      {
        $code = $uploadFile -> code;
        $vars = $uploadFile -> vars;
        $param = $uploadFile -> param;
        $message = Jtbc::take('::communal.text-upload-code-' . $code, 'lng', false, $vars) ?? Jtbc::take('::communal.text-upload-code-others', 'lng');
        if ($code == 1)
        {
          $model = new TinyModel();
          $model -> pocket = new Substance($param);
          $model -> pocket -> time = Date::now();
          $re = $model -> save();
          if (is_numeric($re))
          {
            $code = 1;
            $id = $model -> lastInsertId;
            Logger::log($this, '::communal.log-add', ['id' => $id]);
          }
          else
          {
            $code = 4001;
            $message = Jtbc::take('manage.text-add-code-4001', 'lng');
            $uploader -> removeFile($param -> filepath);
          }
        }
      }
    }
    else
    {
      $code = 4403;
      $message = Jtbc::take('::communal.text-tips-error-4403', 'lng');
    }
    $ss -> code = $code;
    $ss -> message = $message;
    $ss -> param = $param;
    $result = $ss -> toJSON();
    return $result;
  }

  public function actionEdit(Request $req)
  {
    $code = 0;
    $message = '';
    $ss = new Substance();
    $id = intval($req -> get('id'));
    $validator = new Validator($req -> post());
    if ($this -> guard -> role -> checkPermission('edit'))
    {
      if ($validator -> filename -> isEmpty())
      {
        $code = 4001;
      }
      else
      {
        $model = new TinyModel();
        $model -> where -> id = $id;
        $model -> pocket -> filename = $validator -> filename -> value();
        $re = $model -> save();
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
      $code = 4403;
      $message = Jtbc::take('::communal.text-tips-error-4403', 'lng');
    }
    $ss -> code = $code;
    $ss -> message = Jtbc::take('manage.text-edit-code-' . $code, 'lng') ?: $message;
    $result = $ss -> toJSON();
    return $result;
  }

  public function actionReplace(Request $req)
  {
    $code = 0;
    $param = '';
    $message = '';
    $ss = new Substance();
    $id = intval($req -> get('id'));
    if ($this -> guard -> role -> checkPermission('edit'))
    {
      $model = new TinyModel();
      $model -> where -> id = $id;
      $rs = $model -> get();
      if (is_null($rs))
      {
        $code = 4001;
        $message = Jtbc::take('manage.text-replace-code-4001', 'lng');
      }
      else
      {
        $chunkFile = new chunkFile($req);
        $filePath = Path::getActualRoute($rs -> filepath);
        $uploader = UploaderFactory::getInstance($this -> di, $this -> getParam('genre'), false);
        $uploadFile = $uploader -> uploadFile($chunkFile, $filePath);
        if (!is_null($uploadFile))
        {
          $code = $uploadFile -> code;
          $vars = $uploadFile -> vars;
          $param = $uploadFile -> param;
          $message = Jtbc::take('::communal.text-upload-code-' . $code, 'lng', false, $vars) ?? Jtbc::take('::communal.text-upload-code-others', 'lng');
          if ($code == 1)
          {
            $info = new Substance($param);
            $model -> pocket -> filename = $info -> filename;
            $model -> pocket -> filesize = $info -> filesize;
            $model -> pocket -> filesize_text = $info -> filesize_text;
            $re = $model -> save();
            if (is_numeric($re))
            {
              $code = 1;
              $message = Jtbc::take('manage.text-replace-done', 'lng');
              Logger::log($this, '::communal.log-edit', ['id' => $id]);
            }
            else
            {
              $code = 4002;
              $message = Jtbc::take('manage.text-replace-code-4002', 'lng');
            }
          }
        }
      }
    }
    else
    {
      $code = 4403;
      $message = Jtbc::take('::communal.text-tips-error-4403', 'lng');
    }
    $ss -> code = $code;
    $ss -> message = $message;
    $ss -> param = $param;
    $result = $ss -> toJSON();
    return $result;
  }
}