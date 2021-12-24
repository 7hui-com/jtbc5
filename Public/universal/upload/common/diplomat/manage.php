<?php
namespace Jtbc;
use Jtbc\Model\TinyModel;
use App\Console\Common\BasicSubstance;
use App\Console\Common\Ambassador;
use App\Console\Common\Traits\Action;
use App\Universal\Upload\Model as UploadModel;
use App\Universal\Upload\UploaderFactory;

class Diplomat extends Ambassador {
  use Action\Typical\Batch;
  use Action\Typical\Delete;

  private function removeFileById($argId)
  {
    $result = false;
    $id = intval($argId);
    $uploadModel = new UploadModel(false);
    $uploadModel -> where -> deleted = 1;
    $uploadModel -> where -> id = $id;
    $rs = $uploadModel -> get();
    if (!is_null($rs))
    {
      $uploader = UploaderFactory::getInstance($this -> di, $rs -> genre);
      $result = $uploader -> removeFile($rs -> filepath);
    }
    return $result;
  }

  public function __start()
  {
    $this -> hook -> afterDelete = function($argId) { $this -> removeFileById($argId); };
    $this -> hook -> afterBatchDelete = function($argId) {
      foreach ($argId as $id)
      {
        $this -> removeFileById($id);
      }
    };
  }

  public function list(Request $req)
  {
    $page = intval($req -> get('page'));
    $status = intval($req -> get('status') ?? -1);
    $pagesize = intval(Jtbc::getConfig('pagesize'));
    $model = new TinyModel();
    $model -> pageNum = $page;
    $model -> pageSize = $pagesize;
    if ($status != -1)
    {
      $model -> where -> status = $status;
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
}