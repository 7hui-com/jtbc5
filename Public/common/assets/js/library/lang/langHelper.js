export default class langHelper {
  static getStandardLang(lang) {
    let result = 'zh-cn';
    if (['0', 'zh-cn'].includes(lang))
    {
      result = 'zh-cn';
    }
    else if (['1', 'en'].includes(lang))
    {
      result = 'en';
    }
    else if (['2', 'ja'].includes(lang))
    {
      result = 'ja';
    }
    else if (['3', 'ko'].includes(lang))
    {
      result = 'ko';
    }
    else if (['4', 'fr'].includes(lang))
    {
      result = 'fr';
    }
    else if (['5', 'ru'].includes(lang))
    {
      result = 'ru';
    }
    else if (['6', 'es'].includes(lang))
    {
      result = 'es';
    }
    else if (['7', 'ar'].includes(lang))
    {
      result = 'ar';
    };
    return result;
  };
};