export default class jtbcFetch extends HTMLElement {
  static get observedAttributes() {
    return ['mode', 'method', 'basehref', 'body', 'url', 'interval'];
  };

  #body = null;
  #baseHref = null;
  #mode = 'queryString';
  #method = 'get';
  #URL = null;
  #interval = null;
  #modeList = ['queryString', 'json'];
  #methodList = ['get', 'post', 'put', 'delete'];

  get body() {
    return this.#body;
  };

  get mode() {
    return this.#mode;
  };

  get method() {
    return this.#method;
  };

  get href() {
    return this.#URL;
  };

  get fullURL() {
    return this.#baseHref? this.#baseHref + this.#URL: this.#URL;
  };

  set mode(mode) {
    if (this.#modeList.includes(mode))
    {
      this.#mode = mode;
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  set method(method) {
    if (this.#methodList.includes(method))
    {
      this.#method = method;
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  set href(href) {
    this.dispatchEvent(new CustomEvent('hrefstart', {detail: {href: href}}));
    if (this.loading == false && this.locked == false)
    {
      this.setAttribute('url', href);
      this.#URL = href;
      this.fetch();
    }
    else
    {
      this.dispatchEvent(new CustomEvent('hreferror', {detail: {href: href}}));
    };
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
        this.mode = newVal;
        break;
      };
      case 'method':
      {
        this.method = newVal;
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
    this.ready = false;
    this.locked = false;
    this.loading = false;
  };
};