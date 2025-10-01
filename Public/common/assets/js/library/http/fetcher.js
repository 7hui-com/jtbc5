export default class fetcher {
  #options = {};
  #headers = {};
  #method = 'GET';
  #mode = 'queryString';
  #body = null;
  #withGlobalHeaders = null;

  get method() {
    return this.#method;
  };

  get mode() {
    return this.#mode;
  };

  get body() {
    return this.#body;
  };

  get withGlobalHeaders() {
    return this.#withGlobalHeaders;
  };

  set method(method) {
    if (['GET', 'POST', 'PATCH', 'PUT', 'DELETE'].includes(method))
    {
      this.#method = method;
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  set mode(mode) {
    if (['queryString', 'json'].includes(mode))
    {
      this.#mode = mode;
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  set body(body) {
    this.#body = body;
  };

  set withGlobalHeaders(withGlobalHeaders) {
    this.#withGlobalHeaders = withGlobalHeaders;
  };

  #generateOptions() {
    let result = {
      'method': this.method,
      'headers': {},
    };
    if (this.method != 'GET')
    {
      if (this.mode == 'json')
      {
        result.headers['Content-Type'] = 'application/json';
      }
      else if (this.mode == 'queryString')
      {
        result.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      };
    };
    if (this.body != null)
    {
      result.body = this.body;
    };
    if (this.withGlobalHeaders != null)
    {
      let state = window.getBroadcaster('fetch').getState();
      if (state.hasOwnProperty(this.withGlobalHeaders))
      {
        result.headers = Object.assign(result.headers, state[this.withGlobalHeaders]);
      };
    };
    result.headers = Object.assign(result.headers, this.#headers);
    result = Object.assign(result, this.#options);
    return result;
  };

  getOption(key) {
    return this.#options[key];
  };

  removeOption(key) {
    let result = false;
    if (this.#options.hasOwnProperty(key))
    {
      result = true;
      delete this.#options[key];
    };
    return result;
  };

  setOption(key, value) {
    this.#options[key] = value;
  };

  setOptions(options) {
    Object.keys(options).forEach(key => this.setHeader(key, options[key]));
  };

  getHeader(key) {
    return this.#headers[key];
  };

  removeHeader(key) {
    let result = false;
    if (this.#headers.hasOwnProperty(key))
    {
      result = true;
      delete this.#headers[key];
    };
    return result;
  };

  setHeader(key, value) {
    this.#headers[key] = value;
  };

  setHeaders(headers) {
    Object.keys(headers).forEach(key => this.setHeader(key, headers[key]));
  };

  async fetch(url, contentType = 'json', callback = {'fetcherror': res => {}, 'fetchcrash': e => {}, 'fetchend' : () => {}}) {
    let result = null;
    try
    {
      let res = await window.fetch(url, this.#generateOptions());
      if (res.ok)
      {
        if (contentType == 'json')
        {
          result = await res.json();
        }
        else
        {
          result = await res.text();
        };
      }
      else
      {
        if (callback.hasOwnProperty('fetcherror'))
        {
          callback.fetcherror(res);
        };
      };
    }
    catch (e)
    {
      if (callback.hasOwnProperty('fetchcrash'))
      {
        callback.fetchcrash(e);
      };
    }
    finally
    {
      if (callback.hasOwnProperty('fetchend'))
      {
        callback.fetchend();
      };
    };
    return result;
  };

  constructor(withGlobalHeaders = null) {
    this.#withGlobalHeaders = withGlobalHeaders;
  };
};