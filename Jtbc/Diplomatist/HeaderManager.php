<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Diplomatist;
use Jtbc\File\MIMETypes;
use Config\Diplomatist\HeaderManager as Config;

class HeaderManager
{
  public static function handle(callable $handler, $diplomat)
  {
    $result = function() use ($handler, $diplomat)
    {
      $result = call_user_func($handler);
      $request = $diplomat -> di -> request;
      $response = $diplomat -> di -> response;
      $charset = $diplomat -> charset ?? Config::CHARSET;
      $noCache = $diplomat -> noCache ?? Config::HEADER_NO_CACHE;
      $allowOrigin = $diplomat -> allowOrigin ?? Config::ALLOW_ORIGIN;
      $allowHeaders = $diplomat -> allowHeaders ?? Config::ALLOW_HEADERS;
      $allowCredentials = $diplomat -> allowCredentials ?? Config::ALLOW_CREDENTIALS;
      $contentType = $diplomat -> contentType ?? MIMETypes::getMIMEType($diplomat -> MIMEType ?? 'html') ?? 'text/html';
      $contentTypeWithCharset = Config::CONTENT_TYPE_WIDTH_CHARSET ?? [];
      if ($noCache === true)
      {
        $response -> header -> set('Pragma', 'no-cache');
        $response -> header -> set('Cache-Control', 'no-cache, must-revalidate');
      }
      if (is_array($allowOrigin))
      {
        $httpOrigin = $request -> header -> get('origin');
        if (in_array($httpOrigin, $allowOrigin))
        {
          $response -> header -> set('Access-Control-Allow-Origin', $httpOrigin);
          if ($allowCredentials === true) $response -> header -> set('Access-Control-Allow-Credentials', 'true');
        }
      }
      if (is_array($allowHeaders))
      {
        $response -> header -> set('Access-Control-Allow-Headers', implode(',', $allowHeaders));
      }
      if (!in_array($contentType, $contentTypeWithCharset))
      {
        $response -> header -> set('Content-Type', $contentType);
      }
      else
      {
        $response -> header -> set('Content-Type', $contentType . '; charset=' . $charset);
      }
      return $result;
    };
    return $result;
  }
}