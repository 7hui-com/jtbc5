export default class jtbcFetch extends HTMLElement {
  static get observedAttributes() {
    return ['mode', 'method', 'basehref', 'body', 'url', 'interval'];
  };

  set href(value) {
    this.setAttribute('url', value);
    this.currentURL = value;
    this.fetch();
  };

  get href() {
    return this.currentURL;
  };

  get fullURL() {
    return this.currentBaseHref? this.currentBaseHref + this.currentURL: this.currentURL;
  };

  fetch() {
    if (this.locked == false && this.currentURL != null)
    {
      this.locked = true;
      this.removeAttribute('code');
      this.dispatchEvent(new CustomEvent('fetchstart'));
      let action = this.fullURL;
      let method = this.currentMethod;
      let init = {'method': method};
      let currentName = this.getAttribute('name');
      const setTemplateData = data => {
        if (currentName != null && data != null)
        {
          this.querySelectorAll('template[is=jtbc-template]').forEach(el => {
            if (el.getAttribute('name') == currentName)
            {
              el.setAttribute('data', JSON.stringify(data));
            };
          });
        };
      };
      if (method != 'get')
      {
        let headers = {};
        if (this.mode == 'json') headers['Content-Type'] = 'application/json';
        else if (this.mode == 'queryString') headers['Content-Type'] = 'application/x-www-form-urlencoded';
        init.headers = headers;
        init.body = this.currentBody;
      };
      fetch(action, init).then(res => {
        let result = {};
        if (res.ok) result = res.json();
        else
        {
          this.dispatchEvent(new CustomEvent('fetcherror', {detail: {res: res}}));
        };
        return result;
      }).then(data => {
        if (Number.isInteger(data.code))
        {
          this.setAttribute('code', data.code);
          if (data.hasOwnProperty('fragment'))
          {
            data.fragment = data.fragment ?? '';
            this.html(data.fragment).then(() => {
              setTemplateData(data.data);
              this.dispatchEvent(new CustomEvent('fetchdone'));
            });
          }
          else setTemplateData(data.data);
        };
      }).catch(e => {
        this.dispatchEvent(new CustomEvent('fetchcrash', {detail: {e: e}}));
      }).finally(() => {
        this.dispatchEvent(new CustomEvent('fetchend'));
        this.locked = false;
      });
    };
  };

  reload() {
    this.fetch();
  };

  refresh() {
    this.fetch();
  };

  setInterval() {
    if (Number.isInteger(this.currentInterval) && this.currentInterval != 0)
    {
      setTimeout(() => {
        this.refresh();
        this.setInterval();
      }, this.currentInterval * 1000)
    };
  };

  clearInterval() {
    this.currentInterval = null;
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'mode':
      {
        if (this.modeList.includes(newVal))
        {
          this.mode = newVal;
        };
        break;
      };
      case 'method':
      {
        if (this.methodList.includes(newVal))
        {
          this.currentMethod = newVal;
        };
        break;
      };
      case 'basehref':
      {
        this.currentBaseHref = newVal;
        break;
      };
      case 'body':
      {
        this.currentBody = newVal;
        break;
      };
      case 'url':
      {
        this.currentURL = newVal;
        break;
      };
      case 'interval':
      {
        this.currentInterval = Number.parseInt(newVal);
        this.setInterval();
        break;
      };
    };
  };

  connectedCallback() {
    this.fetch();
    this.ready = true;
  };

  constructor() {
    super();
    this.locked = false;
    this.ready = false;
    this.modeList = ['queryString', 'json'];
    this.mode = this.modeList[0];
    this.methodList = ['get', 'post', 'put', 'delete'];
    this.currentMethod = this.methodList[0];
    this.currentBody = null;
    this.currentBaseHref = null;
    this.currentURL = null;
    this.currentInterval = null;
  };
};