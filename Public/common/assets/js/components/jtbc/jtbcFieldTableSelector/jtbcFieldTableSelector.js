export default class jtbcFieldTableSelector extends HTMLElement {
  static get observedAttributes() {
    return ['api', 'credentials', 'href', 'type', 'max', 'value', 'placeholder', 'disabled', 'with-global-headers', 'width'];
  };

  #api = null;
  #credentials = 'same-origin';
  #disabled = false;
  #type = 'checkbox';
  #placeholder = null;
  #syncValue = null;
  #credentialsList = ['include', 'same-origin', 'omit'];
  #withGlobalHeaders = null;

  get credentials() {
    return this.#credentials;
  };

  get name() {
    return this.getAttribute('name');
  };

  get type() {
    return this.#type == 'radio'? 'radio': 'checkbox';
  };

  get value() {
    let result = '';
    if (this.#syncValue != null)
    {
      result = this.#syncValue;
    }
    else
    {
      if (this.selected.length != 0)
      {
        result = JSON.stringify(this.selected);
      };
    };
    return result;
  };

  get href() {
    let result = null;
    if (this.currentHref != null)
    {
      if (!this.hasAttribute('baseurl'))
      {
        result = this.currentHref;
      }
      else
      {
        let currentHref = this.currentHref;
        let baseurl = this.getAttribute('baseurl');
        if (!currentHref.startsWith('/') && !baseurl.endsWith('/'))
        {
          baseurl += '/';
        };
        result = baseurl + currentHref;
      };
    };
    return result;
  };

  get disabled() {
    return this.#disabled;
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

  set value(value) {
    let container = this.container;
    if (this.ready)
    {
      this.selected = [];
      container.querySelector('div.selected').empty();
      if (value != '')
      {
        let valueArr = JSON.parse(value);
        if (Array.isArray(valueArr))
        {
          this.selected = valueArr;
          let currentApi = this.#api ?? this.getAttribute('api');
          currentApi += '&selected=' + encodeURIComponent(value);
          fetch(currentApi, this.#getFetchParams()).then(res => res.ok? res.json(): {}).then(data => {
            if (data.code == 1)
            {
              let dataResult = data.data.result;
              if (Array.isArray(dataResult))
              {
                this.selected = [];
                dataResult.forEach(item => {
                  this.addNewItem(item.id, item.title);
                });
              };
            };
          });
        };
      };
    }
    else
    {
      this.#syncValue = value;
    };
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #getFetchParams() {
    let withGlobalHeaders = this.#withGlobalHeaders;
    let result = {'method': 'get', 'credentials': this.#credentials};
    if (withGlobalHeaders != null)
    {
      let broadcaster = getBroadcaster('fetch');
      let state = broadcaster.getState();
      if (state.hasOwnProperty(withGlobalHeaders))
      {
        result.headers = state[withGlobalHeaders];
      };
    };
    return result;
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    let selectorEl = container.querySelector('a.selector');
    let selectedEl = container.querySelector('div.selected');
    container.addEventListener('click', (e) => {
      let self = e.target;
      if (that.disabled != true && that.selected.length == 0)
      {
        if (container.contains(self) && !selectorEl.contains(self))
        {
          selectorEl.click();
        };
      };
    });
    container.delegateEventListener('a.selector', 'click', (e) => {
      if (this.dialog != null && this.href != null)
      {
        let self = e.target;
        let href = this.href + '&field_type=' + this.type;
        if (!self.classList.contains('locked'))
        {
          self.classList.add('locked');
          fetch(href).then(res => res.ok? res.json(): {}).then(data => {
            if (Number.isInteger(data.code))
            {
              if (data.code == 1)
              {
                this.dialog.popup(data.fragment).then(el => {
                  this.preSelected = [];
                  this.selected.forEach(item => { this.preSelected.push(item); });
                  let popup = el.shadowRoot.querySelector('.dialogPopup');
                  let chief = popup.querySelector('div.chief');
                  let chiefTemplate = popup.querySelector('template.chiefTemplate');
                  if (chief != null && chiefTemplate != null)
                  {
                    const changeChiefTemplateParams = (params) => {
                      let currentURL = chiefTemplate.getAttribute('url');
                      let currentURLArr = currentURL.split('?');
                      if (currentURLArr.length == 2)
                      {
                        let currentBaseURL = currentURLArr[0];
                        let currentSearchParams = new URLSearchParams(currentURLArr[1]);
                        Object.keys(params).forEach(key => {
                          currentSearchParams.set(key, params[key]);
                        });
                        chiefTemplate.setAttribute('url', currentBaseURL + '?' + currentSearchParams.toString());
                      };
                    };
                    chief.addEventListener('checkmax', () => {
                      if (!this.isVacant(true))
                      {
                        if (this.type != 'radio')
                        {
                          chief.querySelectorAll('input[name=id]').forEach(input => {
                            if (input.checked != true)
                            {
                              input.disabled = true;
                            };
                          });
                        };
                      }
                      else
                      {
                        chief.querySelectorAll('input[name=id]').forEach(input => {
                          if (input.disabled == true)
                          {
                            input.disabled = false;
                          };
                        });
                      };
                    });
                    chief.delegateEventListener('div.list', 'renderend', () => {
                      chief.querySelectorAll('input[name=id]').forEach(input => {
                        if (this.preSelected.includes(input.value))
                        {
                          input.checked = true;
                        };
                      });
                      chief.dispatchEvent(new CustomEvent('checkmax'));
                    });
                    chief.delegateEventListener('input[name=id]', 'change', e => {
                      let self = e.target;
                      if (self.disabled == true)
                      {
                        self.checked = false;
                        self.parentNode.parentNode.classList.remove('selected');
                      };
                      if (self.checked == true)
                      {
                        if (!this.preSelected.includes(self.value))
                        {
                          if (this.currentMax == 1)
                          {
                            this.preSelected = [self.value];
                          }
                          else
                          {
                            this.preSelected.push(self.value);
                          };
                        };
                      }
                      else
                      {
                        if (this.preSelected.includes(self.value))
                        {
                          this.preSelected = this.preSelected.filter((item) => item !== self.value);
                        };
                      };
                      chief.dispatchEvent(new CustomEvent('checkmax'));
                    });
                    chief.delegateEventListener('jtbc-pagination', 'gotopage', e => {
                      changeChiefTemplateParams({'page': e.detail.page});
                    });
                    chief.delegateEventListener(String.fromCharCode(106, 116, 98, 99, 45) + 'tiny-search', 'search', e => {
                      changeChiefTemplateParams({'page': 1, 'keyword': e.detail.keyword});
                    });
                    popup.delegateEventListener('button.ok', 'click', () => { this.value = JSON.stringify(this.preSelected); });
                  };
                });
              };
            };
            self.classList.remove('locked');
          });
        };
      };
    });
    selectedEl.addEventListener('changeItem', () => {
      if (!this.isVacant())
      {
        container.classList.add('full');
      }
      else
      {
        container.classList.remove('full');
      };
    });
    selectedEl.delegateEventListener('span', 'click', function(){
      that.selected = that.selected.filter((item) => item !== this.getAttribute('value'));
      selectedEl.dispatchEvent(new CustomEvent('changeItem'));
      this.remove();
    });
    that.syncPlaceholder();
    that.syncValue();
  };

  addNewItem(value, title) {
    let container = this.container;
    let selectedEl = container.querySelector('div.selected');
    if (!this.selected.includes(value) && this.isVacant())
    {
      this.selected.push(value);
      let newItemElement = document.createElement('span');
      let newItemElementEm = document.createElement('em');
      let newItemElementClose = document.createElement('jtbc-svg');
      newItemElementEm.innerText = title;
      newItemElementClose.name = 'close';
      newItemElement.setAttribute('value', value);
      newItemElement.append(newItemElementEm, newItemElementClose);
      selectedEl.append(newItemElement);
    };
    selectedEl.dispatchEvent(new CustomEvent('changeItem'));
  };

  setCurrentMax(value) {
    if (isFinite(value))
    {
      this.currentMax = Number.parseInt(value);
      this.container.setAttribute('max', this.currentMax);
      if (this.currentMax < 1) this.currentMax = 1;
      if (this.selected.length > this.currentMax)
      {
        this.selected.length = this.currentMax;
        let selectedEl = container.querySelector('div.selected');
        selectedEl.querySelectorAll('span').forEach(el => {
          if (!this.selected.includes(el.getAttribute('value')))
          {
            el.click();
          };
        });
      };
    }
    else
    {
      this.currentMax = null;
    };
  };

  syncPlaceholder() {
    if (this.#placeholder != null)
    {
      let placeholderEl = this.container.querySelector('span.placeholder');
      if (placeholderEl != null) placeholderEl.innerText = this.#placeholder;
    };
  };

  syncValue() {
    if (this.#syncValue != null)
    {
      this.value = this.#syncValue;
      this.#syncValue = null;
    };
  };

  isVacant(pre = false) {
    let result = false;
    if (this.currentMax == null)
    {
      result = true;
    }
    else
    {
      let currentMax = Number.parseInt(this.currentMax);
      if (pre == true)
      {
        if (this.preSelected.length < currentMax)
        {
          result = true;
        };
      }
      else
      {
        if (this.selected.length < currentMax)
        {
          result = true;
        };
      };
    };
    return result;
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'api':
      {
        this.#api = newVal;
        break;
      };
      case 'credentials':
      {
        this.credentials = newVal;
        break;
      };
      case 'href':
      {
        this.currentHref = newVal;
        break;
      };
      case 'type':
      {
        this.#type = newVal.toLowerCase();
        if (this.type == 'radio')
        {
          this.setAttribute('max', '1');
        };
        break;
      };
      case 'max':
      {
        this.setCurrentMax(newVal);
        break;
      };
      case 'value':
      {
        this.value = newVal;
        break;
      };
      case 'placeholder':
      {
        this.#placeholder = newVal;
        this.syncPlaceholder();
        break;
      };
      case 'disabled':
      {
        this.disabled = this.hasAttribute('disabled')? true: false;
        break;
      };
      case 'with-global-headers':
      {
        this.#withGlobalHeaders = newVal;
        break;
      };
      case 'width':
      {
        this.style.width = isFinite(newVal)? newVal + 'px': newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#initEvents();
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none">
        <div class="selected"></div><span class="placeholder"></span><a class="selector"><jtbc-svg name="table"></jtbc-svg></a><div class="mask"></div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.selected = [];
    this.preSelected = [];
    this.currentMax = null;
    this.currentHref = null;
    this.dialog = document.getElementById('dialog');
    this.miniMessage = document.getElementById('miniMessage');
    this.container = shadowRoot.querySelector('div.container');
    this.container.loadComponents();
  };
};