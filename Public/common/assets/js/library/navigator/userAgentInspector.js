export default class userAgentInspector {
  #data = '';

  get data() {
    return this.#data;
  };

  getOS() {
    let result = 'Unkown';
    if (this.isWindows())
    {
      result = 'Windows';
    }
    else if (this.isMacintosh())
    {
      result = 'Macintosh';
    }
    else if (this.isAndroid())
    {
      result = 'Android';
    }
    else if (this.isIPhone())
    {
      result = 'iPhone OS';
    }
    else if (this.isLinux())
    {
      result = 'Linux';
    }
    return result;
  };

  isMobile() {
    return this.data.includes('mobile');
  };

  isWindows() {
    return this.data.includes('windows');
  };

  isLinux() {
    return this.data.includes('linux');
  };

  isMacintosh() {
    return this.data.includes('macintosh');
  };

  isAndroid() {
    return this.data.includes('android');
  };

  isIPhone() {
    return this.data.includes('iphone');
  };

  isChrome() {
    return (this.data.includes('chrome') && !this.data.includes('edg/'));
  };

  isEdge() {
    return this.data.includes('edg/');
  };

  isFireFox() {
    return this.data.includes('firefox');
  };
  
  isSafari() {
    return (this.data.includes('safari') && !this.data.includes('chrome'));
  };

  isAppWechat() {
    return this.data.includes('micromessenger');
  };

  isAppAlipay() {
    return this.data.includes('alipay');
  };

  constructor(data) {
    if (typeof data == 'string')
    {
      this.#data = data.toLowerCase();
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };
};