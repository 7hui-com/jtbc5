export default class jtbcForm extends HTMLFormElement {
  static get observedAttributes() {
    return ['mode', 'method'];
  };

  #mode = null;
  #method = null;
  #locked = false;
  #ready = false;
  #dialog = null;
  #miniMessage = null;
  #originalFormData = {};
  #modeList = ['queryString', 'json'];
  #methodList = ['get', 'post', 'put', 'delete', 'head'];

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
    return this.#ready;
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
        let method = this.#method;
        let action = this.getAttribute('action');
        let errorMode = this.getAttribute('error_mode');
        let init = {'method': method};
        if (['get', 'head'].includes(method))
        {
          let url = new URL(action);
          this.getFields().forEach(el => {
             if (this.isValidField(el)) url.searchParams.append(el.name, el.value);
          });
          action = url.toString();
        }
        else
        {
          let headers = {};
          if (this.#mode == 'json') headers['Content-Type'] = 'application/json';
          else if (this.#mode == 'queryString') headers['Content-Type'] = 'application/x-www-form-urlencoded';
          init.headers = headers;
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
                  if (returnCode == 1)
                  {
                    this.#dialog.close().then(() => {
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
                    });
                  }
                  else
                  {
                    let message = data.message;
                    let bigmouth = this.getAttribute('bigmouth');
                    if (bigmouth == 'alert')
                    {
                      this.#dialog != null? this.#dialog.alert(message): window.alert(message);
                    }
                    else
                    {
                      this.#miniMessage?.push(message);
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
              let errorMessage = res.status + ' ' + res.statusText;
              this.#dialog == null? window.alert(errorMessage): this.#dialog.alert(errorMessage);
            };
          };
        }).catch(error => {
          if (errorMode != 'silent')
          {
            this.#dialog == null? window.alert(error): this.#dialog.alert(error);
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
      case 'mode':
      {
        if (this.#modeList.includes(newVal))
        {
          this.#mode = newVal;
        };
        break;
      };
      case 'method':
      {
        if (this.#methodList.includes(newVal))
        {
          this.#method = newVal;
        };
        break;
      };
    };
  };

  connectedCallback() {
    this.#ready = true;
  };

  constructor() {
    super();
    this.#mode = this.#modeList[0];
    this.#method = this.#methodList[0];
    this.#dialog = document.getElementById('dialog');
    this.#miniMessage = document.getElementById('miniMessage');
    this.#initEvents();
  };
};