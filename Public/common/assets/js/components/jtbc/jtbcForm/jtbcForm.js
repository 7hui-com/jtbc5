export default class jtbcForm extends HTMLFormElement {
  static get observedAttributes() {
    return ['credentials', 'mode', 'method', 'with-global-headers'];
  };

  #credentials = 'same-origin';
  #mode = 'queryString';
  #method = 'get';
  #locked = false;
  #originalFormData = {};
  #credentialsList = ['include', 'same-origin', 'omit'];
  #modeList = ['queryString', 'json'];
  #methodList = ['get', 'post', 'put', 'delete'];
  #withGlobalHeaders = null;

  get credentials() {
    return this.#credentials;
  };

  get mode() {
    return this.#mode;
  };

  get method() {
    return this.#method;
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

  #initEvents() {
    this.resetOriginalFormData();
    this.addEventListener('submit', e => e.preventDefault());
    this.addEventListener('builded', e => {
      let tagName = e.target.tagName.toLowerCase();
      let componentName = e.target.getAttribute('is') ?? '';
      if (tagName.includes('form') || componentName.includes('form'))
      {
        this.resetOriginalFormData();
      };
    });
    this.addEventListener('connected', e => {
      if (e.target.getAttribute('role') == 'field')
      {
        this.resetOriginalFormData();
      };
    });
    this.delegateEventListener('[role=submit]', 'click', () => { this.submit(); });
  };

  lock() {
    this.#locked = true;
    this.querySelectorAll('[role=submit]').forEach(el => { el.classList.add('locked'); });
  };

  unlock() {
    this.#locked = false;
    this.querySelectorAll('[role=submit]').forEach(el => { el.classList.remove('locked'); });
  };

  getFields() {
    return this.querySelectorAll('[role=field]');
  };

  isReady() {
    return this.ready;
  };

  isLocked() {
    return this.#locked;
  };

  isFormDataChanged() {
    let result = false;
    if (!this.hasAttribute('inconsequential'))
    {
      let formData = {};
      let originalFormData = this.#originalFormData;
      let originalFormDataKeys = Object.keys(originalFormData);
      if (originalFormDataKeys.length != 0)
      {
        this.getFields().forEach(el => {
          if (this.isValidField(el))
          {
            formData[el.name] = el.value;
            if (!originalFormData.hasOwnProperty(el.name))
            {
              result = true;
            }
            else if (originalFormData[el.name] != el.value)
            {
              result = true;
            };
          };
        });
        if (result === false)
        {
          originalFormDataKeys.forEach(name => {
            if (!formData.hasOwnProperty(name))
            {
              result = true;
            };
          });
        };
      };
    };
    return result;
  };

  isMultiField(el) {
    let isMulti = false;
    if (el.getAttribute('multi') == 'true') isMulti = true;
    else
    {
      if (el instanceof HTMLInputElement)
      {
        if (el.getAttribute('type') == 'checkbox')
        {
          isMulti = true;
        };
      };
    };
    return isMulti;
  };

  isValidField(el) {
    let isValid = true;
    if (el.getAttribute('invalid') == 'true') isValid = false;
    else
    {
      if (el instanceof HTMLInputElement)
      {
        if (['radio', 'checkbox'].includes(el.getAttribute('type')) && el.checked != true)
        {
          isValid = false;
        };
      };
    };
    return isValid;
  };

  resetOriginalFormData() {
    let formData = {};
    let hasError = false;
    this.getFields().forEach(el => {
      if (this.isValidField(el))
      {
        if (el.name == undefined)
        {
          hasError = true;
        }
        else
        {
          formData[el.name] = el.value;
        };
      };
    });
    if (hasError === false)
    {
      this.#originalFormData = formData;
    };
  };

  submit() {
    if (!this.isLocked())
    {
      this.lock();
      let submitStartEvent = new CustomEvent('submitstart', {bubbles: true, detail: {intercepted: false}});
      this.dispatchEvent(submitStartEvent);
      if (submitStartEvent.detail.intercepted !== true)
      {
        let headers = {};
        let method = this.#method;
        let credentials = this.#credentials;
        let withGlobalHeaders = this.#withGlobalHeaders;
        let action = this.getAttribute('action');
        let errorMode = this.getAttribute('error_mode');
        let init = {'method': method, 'headers': headers, 'credentials': credentials};
        if (withGlobalHeaders != null)
        {
          let broadcaster = getBroadcaster('fetch');
          let state = broadcaster.getState();
          if (state.hasOwnProperty(withGlobalHeaders))
          {
            headers = Object.assign(headers, state[withGlobalHeaders]);
          };
        };
        Array.from(this.attributes).forEach(attr => {
          let name = attr.name;
          if (name.startsWith('header-'))
          {
            headers[name.substring(name.indexOf('-') + 1)] = this.getAttribute(name);
          };
        });
        if (method == 'get')
        {
          let url = new URL(action);
          this.getFields().forEach(el => {
             if (this.isValidField(el)) url.searchParams.append(el.name, el.value);
          });
          action = url.toString();
        }
        else
        {
          if (this.#mode == 'json') headers['Content-Type'] = 'application/json';
          else if (this.#mode == 'queryString') headers['Content-Type'] = 'application/x-www-form-urlencoded';
          init.body = this.serialize();
        };
        fetch(action, init).then(res => {
          let detailRes = res.clone();
          this.dispatchEvent(new CustomEvent('submitend', {detail: {res: detailRes}, bubbles: true}));
          if (res.ok)
          {
            let errorTipsEls = this.querySelectorAll('.errorTips');
            res.json().then(data => {
              let returnCode = data.code;
              let returnMessage = data.message ?? '';
              if (returnCode == 1)
              {
                this.resetOriginalFormData();
              };
              if (errorTipsEls.length >= 1)
              {
                let errorTips = null;
                if (data.hasOwnProperty('errorTips'))
                {
                  errorTips = data.errorTips;
                }
                else if (data.hasOwnProperty('code') && data.hasOwnProperty('message'))
                {
                  errorTips = [];
                  errorTips.push({'code': data.code, 'message': data.message});
                };
                if (errorTips != null)
                {
                  errorTipsEls.forEach(el => {
                    el.setAttribute('data', JSON.stringify(errorTips));
                  });
                };
              }
              else
              {
                if (this.hasAttribute('bigmouth'))
                {
                  let bigmouth = this.getAttribute('bigmouth');
                  if (returnCode == 1)
                  {
                    const doneCallback = () => {
                      let currentTarget = this.getTarget();
                      if (currentTarget != null)
                      {
                        if (!this.hasAttribute('href'))
                        {
                          currentTarget.reload();
                        }
                        else
                        {
                          currentTarget.href = this.getAttribute('href');
                        };
                      };
                    };
                    if (bigmouth == 'alert~')
                    {
                      if (this.dialog != null)
                      {
                        this.dialog.alert(returnMessage, doneCallback);
                      }
                      else
                      {
                        window.alert(returnMessage);
                        doneCallback();
                      };
                    }
                    else if (bigmouth == 'toast~')
                    {
                      this.dialog?.close();
                      if (this.toast != null)
                      {
                        this.toast.showSuccess(returnMessage, null, null, doneCallback);
                      }
                      else
                      {
                        window.alert(returnMessage);
                        doneCallback();
                      };
                    }
                    else if (bigmouth == 'mini-message~')
                    {
                      this.dialog?.close();
                      if (this.miniMessage != null)
                      {
                        this.miniMessage.push(returnMessage, doneCallback);
                      }
                      else
                      {
                        window.alert(returnMessage);
                        doneCallback();
                      };
                    }
                    else
                    {
                      this.dialog != null? this.dialog.close().then(() => doneCallback()): doneCallback(); 
                    };
                  }
                  else
                  {
                    if (bigmouth.startsWith('alert'))
                    {
                      this.dialog != null? this.dialog.alert(returnMessage): window.alert(returnMessage);
                    }
                    else if (bigmouth.startsWith('toast'))
                    {
                      this.toast != null? this.toast.showError(returnMessage): window.alert(returnMessage);
                    }
                    else
                    {
                      this.miniMessage != null? this.miniMessage.push(returnMessage): window.alert(returnMessage);
                    };
                  };
                };
              };
            });
          }
          else
          {
            if (errorMode != 'silent')
            {
              let errorMessage = res.status + String.fromCharCode(32) + res.statusText;
              if (this.dialog != null)
              {
                this.dialog.alert(errorMessage);
              }
              else if (this.toast != null)
              {
                this.toast.showError(errorMessage, null, false);
              }
              else
              {
                window.alert(errorMessage);
              };
            };
          };
        }).catch(error => {
          if (errorMode != 'silent')
          {
            if (this.dialog != null)
            {
              this.dialog.alert(error);
            }
            else if (this.toast != null)
            {
              this.toast.showError(error, null, false);
            }
            else
            {
              window.alert(error);
            };
          };
        }).finally(() => {
          this.unlock();
        });
      };
    };
  };

  serialize() {
    let result = null;
    let fields = this.getFields();
    if (this.#mode == 'json')
    {
      let params = {};
      fields.forEach(el => {
        if (!params.hasOwnProperty(el.name))
        {
          if (!this.isMultiField(el))
          {
            if (this.isValidField(el)) params[el.name] = el.value;
          }
          else
          {
            let multiElValue = [];
            fields.forEach(mel => {
              if (mel.name == el.name)
              {
                if (this.isValidField(mel)) multiElValue.push(mel.value);
              };
            });
            params[el.name] = multiElValue;
          };
        };
      });
      result = JSON.stringify(params);
    }
    else if (this.#mode == 'queryString')
    {
      let params = new URLSearchParams();
      fields.forEach(el => {
        if (this.isValidField(el)) params.append(el.name, el.value);
      });
      result = params.toString();
    };
    return result;
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
      case 'with-global-headers':
      {
        this.#withGlobalHeaders = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
  };

  constructor() {
    super();
    this.ready = false;
    this.dialog = document.getElementById('dialog');
    this.miniMessage = document.getElementById('miniMessage');
    this.toast = document.getElementById('toast');
    this.#initEvents();
  };
};