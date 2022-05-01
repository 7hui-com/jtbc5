<?php
namespace App\Common\Widgets\Pagination;
use Jtbc\Substance;
use Jtbc\Template\TinyRenderer;

class PaginationCreator
{
  public static function createLinks(int $argCurrentPage, int $argTotalPage, string $argLinkUrl, int $argMaxlength = 7)
  {
    $ss = new Substance();
    $linkUrl = $argLinkUrl;
    $totalPage = max(1, $argTotalPage);
    $currentPage = min($totalPage, $argCurrentPage);
    $maxlength = max(1, $argMaxlength);
    $startPage = max(1, $currentPage - floor($maxlength / 2));
    $endPage = min($totalPage, $startPage + $maxlength - 1);
    $pages = [];
    $createLinkUrl = fn($page) => str_replace('__page__', $page, $linkUrl);
    while ($startPage > 1 && ($endPage - $startPage + 1) < $maxlength) $startPage -= 1;
    for ($p = $startPage; $p <= $endPage; $p ++)
    {
      $pages[] = ['page' => $p, 'linkUrl' => $createLinkUrl($p), 'isCurrent' => $currentPage == $p? true: false];
    }
    $ss -> arg = [
      'currentPage' => $currentPage,
      'totalPage' => $totalPage,
      'linkUrl' => $linkUrl,
      'maxlength' => $maxlength,
    ];
    $ss -> firstPage = $currentPage == 1? null: $createLinkUrl(1);
    $ss -> prevPage = $currentPage == 1? null: $createLinkUrl($currentPage - 1);
    $ss -> pages = $pages;
    $ss -> nextPage = $currentPage == $totalPage? null: $createLinkUrl($totalPage + 1);
    $ss -> lastPage = $currentPage == $totalPage? null: $createLinkUrl($totalPage);
    return $ss -> toArray();
  }

  public static function render(int $argCurrentPage, int $argTotalPage, string $argLinkUrl, int $argMaxlength = 7, string $argCodeName = null)
  {
    return TinyRenderer::render($argCodeName ?? 'universal:render.pagination', [self::createLinks($argCurrentPage, $argTotalPage, $argLinkUrl, $argMaxlength)]);
  }
}