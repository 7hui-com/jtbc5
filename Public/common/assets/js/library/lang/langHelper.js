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
    else if (['2', 'ja-jp'].includes(lang))
    {
      result = 'ja-jp';
    }
    else if (['3', 'ko-kr'].includes(lang))
    {
      result = 'ko-kr';
    };
    return result;
  };
};