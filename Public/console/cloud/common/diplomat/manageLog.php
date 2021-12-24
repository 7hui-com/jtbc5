<?php
namespace Jtbc;
use App\Common\Package\PackageRecognizer;
use App\Console\Common\Ambassador;
use App\Console\Common\EmptySubstance;
use App\Console\Cloud\Model;
use Config\App\Console\Cloud\Migrator as Config;

class Diplomat extends Ambassador {
  private function getDowngradeZipPath(Substance $rs)
  {
    $result = $rs -> type;
    if (in_array($rs -> type, ['package', 'module', 'plugin']))
    {
      $result .= '/' . $rs -> type_id;
      if ($rs -> type == 'module')
      {
        $result .= '/' . $rs -> genre;
      }
    }
    $result .= '/' . $rs -> target_version . 'to' . $rs -> version . '.zip';
    return $result;
  }

  public function getTab()
  {
    $data = [];
    $packageRecognizer = new PackageRecognizer();
    $types = Jtbc::take('sel_type.*', 'lng');
    foreach ($types as $key => $val)
    {
      if ($key != 'package' || $packageRecognizer -> isValid)
      {
        $data[] = [
          'title' => $val,
          'value' => $key,
        ];
      }
    }
    $es = new EmptySubstance();
    $es -> data -> data = $data;
    return $es -> toJSON();
  }

  public function list(Request $req)
  {
    $data = [];
    $page = intval($req -> get('page'));
    $pagesize = intval(Jtbc::getConfig('pagesize'));
    $typeString = strval($req -> get('type_string') ?? 'all');
    $model = new Model('migrate');
    $model -> pageNum = $page;
    $model -> pageSize = $pagesize;
    if ($typeString != 'all')
    {
      $model -> where -> type = $typeString;
    }
    $model -> orderBy('id', 'desc');
    $rsa = $model -> getPage();
    foreach ($rsa as $rs)
    {
      $downgradeZipPath = '';
      $canDowngrade = (intval($rs -> mode) == 0 && intval($rs -> status) == 0 && time() - intval($rs -> timestamp) < 24 * 60 * 60)? true: false;
      if ($canDowngrade == true)
      {
        $downgradeZipPath = $this -> getDowngradeZipPath($rs);
      }
      $data[] = [
        'id' => intval($rs -> id),
        'mode' => intval($rs -> mode),
        'genre' => $rs -> genre,
        'type' => $rs -> type,
        'type_id' => $rs -> type_id,
        'type_text' => Jtbc::take('sel_type.' . $rs -> type, 'lng'),
        'version' => Converter::convertToVersionString($rs -> version),
        'target_version' => Converter::convertToVersionString($rs -> target_version),
        'time' => Date::formatTimestamp($rs -> timestamp, 21),
        'can_downgrade' => $canDowngrade,
        'downgrade_zip_path' => $downgradeZipPath,
      ];
    }
    $es = new EmptySubstance();
    $es -> data -> data = $data;
    $es -> data -> pagination = [
      'pagenum' => $model -> pagination -> pageNum,
      'pagecount' => $model -> pagination -> pageCount,
    ];
    return $es -> toJSON();
  }
}