export default class jtbcFetch extends HTMLElement {
  static get observedAttributes() {
    return ['credentials', 'mode', 'method', 'mustache', 'basehref', 'body', 'url', 'interval'];
  };

  #body = null;
  #baseHref = null;
  #credentials = 'same-origin';
  #mode = 'queryString';
  #method = 'get';
  #URL = null;
  #interval = null;
  #credentialsList = ['include', 'same-origin', 'omit'];
  #modeList = ['queryString', 'json'];
  #methodList = ['get', 'post', 'put', 'delete'];
  #mustache = null;

  get body() {
    return this.#body;
  };

  get credentials() {
    return this.#credentials;
  };

  get mode() {
    return this.#mode;
  };

  get method() {
    return this.#method;
  };

  get mustache() {
    return this.#mustache;
  };

  get href() {
    return this.#URL;
  };

  get fullURL() {
    return this.#baseHref? this.#baseHref + this.#URL: this.#URL;
  };

  set credentials(credentials) {
    if (this.#credentialsList.includes(credentials))
    {
      this.#credentials = credentials;
    }
    else
    {
      throw new Error('Unexpected value');
    };
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

  set mustache(mustache) {
    this.#mustache = mustache;
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
      let headers = {};
      let action = this.fullURL;
      let method = this.method;
      let credentials = this.#credentials;
      let init = {'method': method, 'headers': headers, 'credentials': credentials};
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
        let result = '';
        if (res.ok) result = res.text();
        else
        {
          this.dispatchEvent(new CustomEvent('fetcherror', {detail: {res: res}}));
        };
        return result;
      }).then(text => {
        let code, data, fragment = null;
        if (text.startsWith('{'))
        {
          try
          {
            let content = JSON.parse(text);
            code = Number.parseInt(content.code);
            data = content.hasOwnProperty('data')? content.data: null;
            fragment = content.hasOwnProperty('fragment')? content.fragment: null;
          }
          catch(e) {};
        }
        else if (text.startsWith('<'))
        {
          let parser = new DOMParser();
          let dom = parser.parseFromString(text, 'text/xml');
          let del = dom.querySelector('xml>data');
          let fel = dom.querySelector('xml>fragment');
          code = Number.parseInt(dom.querySelector('xml')?.getAttribute('code'));
          data = (del != null)? del.textContent: null;
          fragment = (fel != null)? fel.textContent: null;
        };
        if (code != null)
        {
          this.setAttribute('code', code);
          if (fragment != null)
          {
            if (this.mustache != null)
            {
              let params = this.getAttributes(this.mustache);
              Object.keys(params).forEach(key => {
                fragment = fragment.replaceAll('{{' + key + '}}', params[key]);
              });
            };
            this.html(fragment).then(() => {
              setTemplateData(data);
              this.dispatchEvent(new CustomEvent('fetchdone'));
            });
          }
          else
          {
            if (code == 1) setTemplateData(data);
            this.dispatchEvent(new CustomEvent('fetchdone'));
          };
        }
        else
        {
          this.dispatchEvent(new CustomEvent('dataerror'));
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
      case 'credentials':
      {
        this.credentials = newVal;
        break;
      };
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
      case 'mustache':
      {
        this.mustache = newVal;
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