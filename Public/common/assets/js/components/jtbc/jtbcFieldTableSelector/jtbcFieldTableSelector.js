export default class jtbcFieldTableSelector extends HTMLElement {
  static get observedAttributes() {
    return ['api', 'href', 'type', 'max', 'value', 'placeholder', 'disabled', 'width'];
  };

  get name() {
    return this.getAttribute('name');
  };

  get type() {
    return this.currentType == 'radio'? 'radio': 'checkbox';
  };

  get value() {
    let result = '';
    if (this.currentValue != null)
    {
      result = this.currentValue;
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
    return this.currentDisabled;
  };

  set value(value) {
    let container = this.container;
    let selectedEl = container.querySelector('div.selected');
    if (selectedEl != null)
    {
      this.selected = [];
      selectedEl.innerHTML = '';
      if (value != '')
      {
        let valueArr = JSON.parse(value);
        if (Array.isArray(valueArr))
        {
          this.selected = valueArr;
          let currentApi = this.currentApi ?? this.getAttribute('api');
          currentApi += '&selected=' + encodeURIComponent(value);
          fetch(currentApi).then(res => res.ok? res.json(): {}).then(data => {
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
      this.currentValue = value;
    };
  };

  set disabled(disabled) {
    if (disabled == true)
    {
      this.container.classList.add('disabled');
    }
    else
    {
      this.container.classList.remove('disabled');
    };
    this.currentDisabled = disabled;
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
    if (this.currentPlaceholder != null)
    {
      let placeholderEl = this.container.querySelector('span.placeholder');
      if (placeholderEl != null) placeholderEl.innerText = this.currentPlaceholder;
    };
  };

  syncValue() {
    if (this.currentValue != null)
    {
      this.value = this.currentValue;
      this.currentValue = null;
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

  initEvents() {
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
                        if (this.currentType != 'radio')
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
                    chief.delegateEventListener('jt' + String.fromCharCode(98, 99) + '-pagination', 'gotopage', e => {
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

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'api':
      {
        this.currentApi = newVal;
        break;
      };
      case 'href':
      {
        this.currentHref = newVal;
        break;
      };
      case 'type':
      {
        this.currentType = newVal.toLowerCase();
        if (this.currentType == 'radio')
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
        this.currentPlaceholder = newVal;
        this.syncPlaceholder();
        break;
      };
      case 'disabled':
      {
        this.disabled = this.hasAttribute('disabled')? true: false;
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
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"></div>
    `;
    let containerHTML = `<div class="selected"></div><span class="placeholder"></span><a class="selector"><jtbc-svg name="table"></jtbc-svg></a><div class="mask"></div>`;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.selected = [];
    this.preSelected = [];
    this.currentDisabled = false;
    this.currentApi = null;
    this.currentMax = null;
    this.currentHref = null;
    this.currentType = null;
    this.currentValue = null;
    this.currentPlaceholder = null;
    this.dialog = document.getElementById('dialog');
    this.miniMessage = document.getElementById('miniMessage');
    this.container = shadowRoot.querySelector('div.container');
    this.container.html(containerHTML).then(() => {
      this.initEvents();
    });
  };
};