<?php
namespace App\Common\Form;
use Jtbc\Jtbc;
use Jtbc\Substance;

class FieldTextGenerator
{
  public static function generate(string $argName)
  {
    $result = [];
    $name = $argName;
    if (in_array($name, ['avatar', 'upload']))
    {
      $textUpload = Jtbc::take('universal:config.upload', 'lng');
      $textPreview = Jtbc::take('universal:config.preview', 'lng');
      $textRemove = Jtbc::take('universal:config.delete', 'lng');
      $result = ['text-upload' => $textUpload, 'text-preview' => $textPreview, 'text-remove' => $textRemove];
    }
    else if ($name == 'date-range')
    {
      $textStartDate = Jtbc::take('universal:phrases.start-date', 'lng');
      $textEndDate = Jtbc::take('universal:phrases.end-date', 'lng');
      $result = ['placeholder_start' => $textStartDate, 'placeholder_end' => $textEndDate];
    }
    else if ($name == 'datetime-range')
    {
      $textStartDatetime = Jtbc::take('universal:phrases.start-datetime', 'lng');
      $textEndDatetime = Jtbc::take('universal:phrases.end-datetime', 'lng');
      $result = ['placeholder_start' => $textStartDatetime, 'placeholder_end' => $textEndDatetime];
    }
    else if ($name == 'attachment')
    {
      $text = new Substance();
      $text -> upload = Jtbc::take('universal:config.upload', 'lng');
      $text -> insert = Jtbc::take('universal:config.insert', 'lng');
      $text -> remove = Jtbc::take('universal:config.delete', 'lng');
      $text -> selectFromDB = Jtbc::take('universal:phrases.select-from-media-database', 'lng');
      $text -> filesList = Jtbc::take('universal:phrases.files-list', 'lng');
      $text -> emptyTips = Jtbc::take('universal:phrases.files-list-empty-please-upload', 'lng');
      $result = ['text' => $text -> toJSON()];
    }
    else if ($name == 'table')
    {
      $text = new Substance();
      $text -> add = Jtbc::take('universal:config.add', 'lng');
      $text -> remove = Jtbc::take('universal:config.delete', 'lng');
      $text -> removeTips = Jtbc::take('universal:phrases.are-you-sure-to-remove', 'lng');
      $text -> emptyTips = Jtbc::take('universal:phrases.list-empty-please-add', 'lng');
      $text -> dblClickRemoveTips = Jtbc::take('universal:phrases.click-again-to-remove', 'lng');
      $result = ['text' => $text -> toJSON()];
    }
    else if ($name == 'multi')
    {
      $text = new Substance();
      $text -> add = Jtbc::take('universal:phrases.add-content', 'lng');
      $text -> remove = Jtbc::take('universal:config.delete', 'lng');
      $text -> removeTips = Jtbc::take('universal:phrases.are-you-sure-to-remove', 'lng');
      $result = ['text' => $text -> toJSON()];
    }
    else if ($name == 'multi-group')
    {
      $text = new Substance();
      $text -> add = Jtbc::take('universal:config.add', 'lng');
      $text -> remove = Jtbc::take('universal:config.delete', 'lng');
      $text -> removeTips = Jtbc::take('universal:phrases.are-you-sure-to-remove', 'lng');
      $result = ['text' => $text -> toJSON()];
    }
    else if ($name == 'gallery')
    {
      $text = new Substance();
      $text -> add = Jtbc::take('universal:config.add', 'lng');
      $text -> preview = Jtbc::take('universal:config.preview', 'lng');
      $text -> remove = Jtbc::take('universal:config.delete', 'lng');
      $text -> removeTips = Jtbc::take('universal:phrases.are-you-sure-to-remove', 'lng');
      $result = ['text' => $text -> toJSON()];
    }
    else if ($name == 'transfer')
    {
      $text = new Substance();
      $text -> selected = Jtbc::take('universal:phrases.selected', 'lng');
      $text -> unselected = Jtbc::take('universal:phrases.unselected', 'lng');
      $text -> filterPlaceholder = Jtbc::take('universal:phrases.enter-keywords', 'lng');
      $text -> errorTips1 = Jtbc::take('universal:phrases.you-can-only-select-x-items-at-most', 'lng');
      $result = ['text' => $text -> toJSON()];
    }
    return $result;
  }
}