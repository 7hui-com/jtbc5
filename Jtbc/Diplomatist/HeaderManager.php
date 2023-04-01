<?php
//******************************//
// JTBC Powered by jtbc.cn      //
//******************************//
namespace Jtbc\Diplomatist;
use Jtbc\Config;
use Jtbc\File\MIMETypes;

class HeaderManager
{
  public static function handle(callable $handler, $diplomat)
  {
    $result = function() use ($handler, $diplomat)
    {
      $isOriginAllowed = false;
      $request = $diplomat -> di -> request;
      $response = $diplomat -> di -> response;
      $charset = $diplomat -> charset ?? Config::read(__CLASS__, 'charset');
      $noCache = $diplomat -> noCache ?? Config::read(__CLASS__, 'header_no_cache');
      $allowOrigin = $diplomat -> allowOrigin ?? Config::read(__CLASS__, 'allow_origin');
      $allowHeaders = $diplomat -> allowHeaders ?? Config::read(__CLASS__, 'allow_headers');
      $allowCredentials = $diplomat -> allowCredentials ?? Config::read(__CLASS__, 'allow_credentials');
      $contentType = $diplomat -> contentType ?? MIMETypes::getMIMEType($diplomat -> MIMEType ?? 'html') ?? 'text/html';
      $contentTypeWithCharset = Config::read(__CLASS__, 'content_type_width_charset') ?? [];
      if ($noCache === true)
      {
        $response -> header -> set('Cache-Control', 'no-cache, must-revalidate');
      }
      if (is_array($allowOrigin))
      {
        $maxAge = 60;
        $httpOrigin = $request -> header -> get('origin');
        if (in_array($httpOrigin, $allowOrigin))
        {
          $isOriginAllowed = true;
        }
        else if (array_key_exists($httpOrigin, $allowOrigin))
        {
          $isOriginAllowed = true;
          $maxAgeValue = $allowOrigin[$httpOrigin];
          if (is_int($maxAgeValue))
          {
            $maxAge = max(5, min(7200, $maxAgeValue));
          }
        }
        if ($isOriginAllowed === true)
        {
          $response -> header -> set('Access-Control-Max-Age', $maxAge);
          $response -> header -> set('Access-Control-Allow-Origin', $httpOrigin);
          if ($allowCredentials === true) $response -> header -> set('Access-Control-Allow-Credentials', 'true');
          if (is_array($allowHeaders)) $response -> header -> set('Access-Control-Allow-Headers', implode(',', $allowHeaders));
        }
      }
      if (!in_array($contentType, $contentTypeWithCharset))
      {
        $response -> header -> set('Content-Type', $contentType);
      }
      else
      {
        $response -> header -> set('Content-Type', $contentType . '; charset=' . $charset);
      }
      if (in_array(strtoupper($request -> method), ['DELETE', 'GET', 'PATCH', 'POST', 'PUT']))
      {
        return call_user_func($handler);
      }
    };
    return $result;
  }
}