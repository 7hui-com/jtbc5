<?php
namespace App\Universal\Upload;

interface FileUploader
{
  public function removeFile(string $argFilePath);
  public function uploadFile(chunkFile $chunkFile, ?string $argTargetPath = null);
}