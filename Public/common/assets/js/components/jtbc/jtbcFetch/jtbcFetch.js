export default class jtbcFetch extends HTMLElement {
  static get observedAttributes() {
    return ['mode', 'method', 'basehref', 'body', 'url', 'interval'];
  };

  #method = 'get';
  #mode = 'queryString';
  #body = null;
  #baseHref = null;
  #URL = null;
  #interval = null;

  set href(value) {
    this.dispatchEvent(new CustomEvent('hrefstart', {detail: {href: value}}));
    if (this.loading == false && this.locked == false)
    {
      this.setAttribute('url', value);
      this.#URL = value;
      this.fetch();
    }
    else
    {
      this.dispatchEvent(new CustomEvent('hreferror', {detail: {href: value}}));
    };
  };

  get body() {
    return this.#body;
  };

  get method() {
    return this.#method;
  };

  get mode() {
    return this.#mode;
  };

  get href() {
    return this.#URL;
  };

  get fullURL() {
    return this.#baseHref? this.#baseHref + this.#URL: this.#URL;
  };

  fetch() {
    if (this.loading == false && this.#URL != null)
    {
      this.loading = true;
      this.removeAttribute('code');
      this.dispatchEvent(new CustomEvent('fetchstart'));
      let action = this.fullURL;
      let method = this.method;
      let headers = {};
      let init = {'method': method, 'headers': headers};
      let currentName = this.getAttribute('name');
      const setTemplateData = data => {
        if (currentName != null && data != null)
        {
          this.querySelectorAll('jtbc-view').forEach(el => {
            if (el.getAttribute('name') == currentName)
            {
              el.setAttribute('data', JSON.stringify(data));
            };
          });
          this.querySelectorAll('template[is=jtbc-template]').forEach(el => {
            if (el.getAttribute('name') == currentName)
            {
              el.setAttribute('data', JSON.stringify(data));
            };
          });
        };
      };
      Array.from(this.attributes).forEach(attr => {
        let name = attr.name;
        if (name.startsWith('header-'))
        {
          headers[name.substring(name.indexOf('-') + 1)] = this.getAttribute(name);
        };
      });
      if (method != 'get')
      {
        if (this.mode == 'json') headers['Content-Type'] = 'application/json';
        else if (this.mode == 'queryString') headers['Content-Type'] = 'application/x-www-form-urlencoded';
        init.body = this.body;
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
        let code = data.code;
        if (Number.isInteger(code))
        {
          this.setAttribute('code', code);
          if (data.hasOwnProperty('fragment'))
          {
            data.fragment = data.fragment ?? '';
            this.html(data.fragment).then(() => {
              setTemplateData(data.data);
              this.dispatchEvent(new CustomEvent('fetchdone'));
            });
          }
          else
          {
            if (code == 1) setTemplateData(data.data);
            this.dispatchEvent(new CustomEvent('fetchdone'));
          };
        };
      }).catch(e => {
        this.dispatchEvent(new CustomEvent('fetchcrash', {detail: {e: e}}));
      }).finally(() => {
        this.dispatchEvent(new CustomEvent('fetchend'));
        this.loading = false;
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
    let interval = this.#interval;
    if (Number.isInteger(interval) && interval != 0)
    {
      setTimeout(() => {
        this.refresh();
        this.setInterval();
      }, interval * 1000)
    };
  };

  clearInterval() {
    this.#interval = null;
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'mode':
      {
        if (this.modeList.includes(newVal))
        {
          this.#mode = newVal;
        };
        break;
      };
      case 'method':
      {
        if (this.methodList.includes(newVal))
        {
          this.#method = newVal;
        };
        break;
      };
      case 'basehref':
      {
        this.#baseHref = newVal;
        break;
      };
      case 'body':
      {
        this.#body = newVal;
        break;
      };
      case 'url':
      {
        this.#URL = newVal;
        break;
      };
      case 'interval':
      {
        this.#interval = Number.parseInt(newVal);
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
    this.loading = false;
    this.ready = false;
    this.modeList = ['queryString', 'json'];
    this.methodList = ['get', 'post', 'put', 'delete'];
  };
};