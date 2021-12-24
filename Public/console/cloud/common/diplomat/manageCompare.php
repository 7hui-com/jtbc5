<?php
namespace Jtbc;
use ZipArchive;
use Jtbc\Jtbc\JtbcReader;
use Jtbc\Jtbc\JtbcWriter;
use Jtbc\String\StringHelper;
use App\Console\Common\Ambassador;
use App\Console\Common\EmptySubstance;
use App\Console\Log\Logger;
use App\Common\Maintenance\Migrator\MetaReader;
use App\Common\Maintenance\Migrator\ConfigReader;

class Diplomat extends Ambassador {
  private function getContentsFromZipFile(string $argZipFilePath, string $argPath)
  {
    $result = null;
    $path = $argPath;
    $zipFilePath = $argZipFilePath;
    $zipArchive = new ZipArchive();
    $opened = $zipArchive -> open($zipFilePath);
    if ($opened === true)
    {
      $result = $zipArchive -> getFromName($path);
    }
    $zipArchive -> close();
    return $result;
  }

  private function getNodeDataNewFromZipFileById(string $argZipFilePath, int $argId)
  {
    $result = null;
    $id = $argId;
    $zipFilePath = $argZipFilePath;
    $meta = MetaReader::read($zipFilePath);
    if (is_array($meta))
    {
      if (array_key_exists('jtbc', $meta))
      {
        $jtbcArr = $meta['jtbc'];
        if (is_array($jtbcArr))
        {
          foreach ($jtbcArr as $items)
          {
            foreach ($items as $item)
            {
              if (array_key_exists('id', $item) && array_key_exists('node_data_new', $item))
              {
                if (intval($item['id']) == $id)
                {
                  $result = $item['node_data_new'];
                  break;
                }
              }
            }
          }
        }
      }
    }
    return $result;
  }

  public function file(Request $req)
  {
    $code = 0;
    $data = new Substance();
    $path = strval($req -> get('path'));
    $zipPath = strval($req -> get('zip_path'));
    $metaId = strval($req -> get('meta_id') ?? -1);
    $rootPath = realpath(Path::getActualRoute('./') . '../');
    $fullPath = $rootPath . '/' . $path;
    $zipFullPath = Path::getActualRoute(ConfigReader::getBaseDir() . '/' . $zipPath);
    if (is_file($fullPath) && is_file($zipFullPath))
    {
      $code = 1;
      $modeMap = new Substance();
      $modeMap -> js = 'javascript';
      $modeMap -> jtbc = 'xml';
      $modeMap -> htm = 'htmlmixed';
      $modeMap -> html = 'htmlmixed';
      $modeMap -> php = 'php';
      $modeMap -> css = 'css';
      $modeMap -> svg =  'xml';
      $data -> meta_id = $metaId;
      $data -> realPath = realpath($fullPath);
      $fileType = StringHelper::getClipedString($fullPath, '.', 'right');
      $data -> content = [
        'mode' => $modeMap[$fileType] ?? 'htmlmixed',
        'leftvalue' => file_get_contents($fullPath),
        'rightvalue' => $this -> getContentsFromZipFile($zipFullPath, $path),
      ];
    }
    $es = new EmptySubstance();
    $es -> code = $code;
    $es -> data = $data;
    return $es -> toJSON();
  }

  public function jtbc(Request $req)
  {
    $code = 0;
    $data = new Substance();
    $path = strval($req -> get('path'));
    $zipPath = strval($req -> get('zip_path'));
    $nodeKey = strval($req -> get('node_key'));
    $nodeName = strval($req -> get('node_name'));
    $jtbcType = strval($req -> get('jtbc_type'));
    $metaId = strval($req -> get('meta_id') ?? -1);
    $rootPath = realpath(Path::getActualRoute('./') . '../');
    $fullPath = $rootPath . '/' . $path;
    $zipFullPath = Path::getActualRoute(ConfigReader::getBaseDir() . '/' . $zipPath);
    if (is_file($fullPath) && is_file($zipFullPath))
    {
      $data -> node_key = $nodeKey;
      $data -> node_name = $nodeName;
      $data -> jtbc_type = $jtbcType;
      $data -> meta_id = $metaId;
      $data -> realPath = realpath($fullPath);
      $jtbcData = JtbcReader::getData($fullPath, $jtbcType, $nodeName);
      if (array_key_exists($nodeKey, $jtbcData))
      {
        $code = 1;
        $data -> content = [
          'mode' => 'htmlmixed',
          'leftvalue' => $jtbcData[$nodeKey],
          'rightvalue' => $this -> getNodeDataNewFromZipFileById($zipFullPath, $metaId),
        ];
      }
    }
    $es = new EmptySubstance();
    $es -> code = $code;
    $es -> data = $data;
    return $es -> toJSON();
  }

  public function actionFileSave(Request $req)
  {
    $code = 0;
    $message = '';
    $content = strval($req -> post('content'));
    $realpath = strval($req -> post('realpath'));
    if (is_file($realpath))
    {
      $saved = @file_put_contents($realpath, $content);
      if ($saved !== false)
      {
        $code = 1;
        Logger::log($this, 'manageCompare.log-file-save', ['realpath' => $realpath]);
      }
      else
      {
        $code = 4002;
      }
    }
    else
    {
      $code = 4001;
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = Jtbc::take('manageCompare.text-file-save-code-' . $code, 'lng') ?: $message;
    return $ss -> toJSON();
  }

  public function actionJtbcSave(Request $req)
  {
    $code = 0;
    $message = '';
    $nodeKey = strval($req -> post('node_key'));
    $nodeName = strval($req -> post('node_name'));
    $jtbcType = strval($req -> post('jtbc_type'));
    $content = strval($req -> post('content'));
    $realpath = strval($req -> post('realpath'));
    if (is_file($realpath))
    {
      $saved = JtbcWriter::putNodeContent($realpath, $jtbcType, $nodeKey, $content, $nodeName);
      if ($saved === true)
      {
        $code = 1;
        Logger::log($this, 'manageCompare.log-jtbc-save', ['realpath' => $realpath, 'node_key' => $nodeKey]);
      }
      else
      {
        $code = 4002;
      }
    }
    else
    {
      $code = 4001;
    }
    $ss = new Substance();
    $ss -> code = $code;
    $ss -> message = Jtbc::take('manageCompare.text-jtbc-save-code-' . $code, 'lng') ?: $message;
    return $ss -> toJSON();
  }
}