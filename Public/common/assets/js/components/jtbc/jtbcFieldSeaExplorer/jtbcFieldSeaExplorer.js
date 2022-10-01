export default class jtbcFieldSeaExplorer extends HTMLElement {
  static get observedAttributes() {
    return ['api', 'max', 'value', 'disabled', 'width'];
  };

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = '';
    if (this.selected.length != 0)
    {
      result = JSON.stringify(this.selected);
    };
    return result;
  };

  get disabled() {
    return this.currentDisabled;
  };

  set value(value) {
    let container = this.container;
    let selectedEl = container.querySelector('div.selected');
    this.selected = [];
    selectedEl.innerHTML = '';
    if (value != '')
    {
      let valueArr = JSON.parse(value);
      if (Array.isArray(valueArr))
      {
        this.selected = valueArr;
        let currentApi = this.currentApi ?? this.getAttribute('api');
        if (currentApi != null)
        {
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
        }
        else
        {
          this.currentValue = value;
        };
      };
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

  removeLastItem() {
    let container = this.container;
    let selectedEl = container.querySelector('div.selected');
    let lastItem = selectedEl.querySelector('span:last-child');
    if (lastItem != null)
    {
      lastItem.click();
    };
  };

  loadResult(result) {
    let container = this.container;
    let resultElement = container.querySelector('div.result');
    let resultULElement = resultElement.querySelector('ul');
    resultULElement.querySelectorAll('li').forEach(el => {
      el.remove();
    });
    if (result.length == 0)
    {
      resultElement.classList.remove('on');
    }
    else
    {
      resultElement.classList.add('on');
      result.forEach(item => {
        let newLi = document.createElement('li');
        newLi.setAttribute('value', item.id);
        newLi.setAttribute('text', item.title);
        newLi.innerText = item.title;
        resultULElement.append(newLi);
      });
    };
  };

  selectPrevItem() {
    let container = this.container;
    let resultElement = container.querySelector('div.result');
    let resultULElement = resultElement.querySelector('ul');
    let selectedLi = resultULElement.querySelector('li.on');
    let lastLi = resultULElement.querySelector('li:last-child');
    let prevLi = selectedLi == null? lastLi: (selectedLi.previousElementSibling ?? lastLi);
    if (prevLi != null)
    {
      resultULElement.querySelectorAll('li').forEach(el => {
        if (el == prevLi)
        {
          el.classList.add('on');
          let inputElement = container.querySelector('input.keyword');
          inputElement.value = el.getAttribute('text');
          inputElement.setAttribute('realvalue', el.getAttribute('value'));
        }
        else
        {
          el.classList.remove('on');
        };
      });
    };
  };

  selectNextItem() {
    let container = this.container;
    let resultElement = container.querySelector('div.result');
    let resultULElement = resultElement.querySelector('ul');
    let selectedLi = resultULElement.querySelector('li.on');
    let firstLi = resultULElement.querySelector('li:first-child');
    let nextLi = selectedLi == null? firstLi: (selectedLi.nextElementSibling ?? firstLi);
    if (nextLi != null)
    {
      resultULElement.querySelectorAll('li').forEach(el => {
        if (el == nextLi)
        {
          el.classList.add('on');
          let inputElement = container.querySelector('input.keyword');
          inputElement.value = el.getAttribute('text');
          inputElement.setAttribute('realvalue', el.getAttribute('value'));
        }
        else
        {
          el.classList.remove('on');
        };
      });
    };
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

  syncValue() {
    if (this.currentValue != null)
    {
      this.value = this.currentValue;
      this.currentValue = null;
    };
  };

  isVacant() {
    let result = false;
    if (this.currentMax == null)
    {
      result = true;
    }
    else
    {
      let currentMax = Number.parseInt(this.currentMax);
      if (this.selected.length < currentMax)
      {
        result = true;
      };
    };
    return result;
  };

  initEvents() {
    let that = this;
    let container = this.container;
    let keywordEl = container.querySelector('input.keyword');
    let selectedEl = container.querySelector('div.selected');
    let resultEl = container.querySelector('div.result');
    container.addEventListener('click', () => {
      keywordEl.focus();
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
    keywordEl.addEventListener('focus', (e) => {
      let self = e.target;
      container.classList.add('on');
      self.dispatchEvent(new CustomEvent('resetWidth'));
      clearTimeout(this.blurTimeout);
    });
    keywordEl.addEventListener('blur', () => {
      clearTimeout(this.blurTimeout);
      this.blurTimeout = setTimeout(() => {
        keywordEl.value = '';
        container.classList.remove('on');
        resultEl.classList.remove('on');
      }, 300);
    });
    keywordEl.addEventListener('keyup', e => {
      let which = e.which;
      let self = e.target;
      if (which == 13)
      {
        self.dispatchEvent(new CustomEvent('newItem'));
      }
      else if (which == 38)
      {
        this.selectPrevItem();
      }
      else if (which == 40)
      {
        this.selectNextItem();
      };
    });
    keywordEl.addEventListener('keydown', e => {
      let which = e.which;
      let self = e.target;
      if (which == 8)
      {
        let currentTag = self.value.trim();
        if (currentTag == '')
        {
          this.removeLastItem();
          self.dispatchEvent(new CustomEvent('resetWidth'));
        };
      }
      else if (which == 13)
      {
        return false;
      };
    });
    keywordEl.addEventListener('input', e => {
      if (this.currentApi != null)
      {
        if (this.currentApiLoading === false)
        {
          let self = e.target;
          let currentValue = self.value;
          self.removeAttribute('realvalue');
          if (currentValue.trim() == '')
          {
            this.loadResult([]);
          }
          else
          {
            this.currentApiLoading = true;
            let currentApi = this.currentApi + '&keyword=' + encodeURIComponent(currentValue);
            fetch(currentApi).then(res => res.ok? res.json(): {}).then(data => {
              this.currentApiLoading = false;
              if (data.code == 1)
              {
                let dataResult = data.data.result;
                if (Array.isArray(dataResult))
                {
                  this.loadResult(dataResult);
                };
              };
            });
          };
        };
      };
    });
    keywordEl.addEventListener('newItem', e => {
      let self = e.target;
      if (self.hasAttribute('realvalue'))
      {
        let currentTitle = self.value.trim();
        let currentValue = self.getAttribute('realvalue');
        this.addNewItem(currentValue, currentTitle);
        self.value = '';
        self.style.width = 'auto';
        self.dispatchEvent(new CustomEvent('resetWidth'));
      };
    });
    keywordEl.addEventListener('resetWidth', e => {
      let remainWidth = container.clientWidth - selectedEl.clientWidth;
      if (remainWidth > 60)
      {
        container.classList.remove('multiline');
        e.target.style.width = (remainWidth - 10) + 'px';
      }
      else
      {
        container.classList.add('multiline');
        e.target.style.width = '100%';
      };
    });
    resultEl.delegateEventListener('li', 'click', function(){
      keywordEl.value = '';
      that.addNewItem(this.getAttribute('value'), this.getAttribute('text'));
      resultEl.classList.remove('on');
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'api':
      {
        this.currentApi = newVal;
        this.syncValue();
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
      <div class="container" style="display:none"><div class="selected"></div><input type="text" name="keyword" class="keyword" autocomplete="off" /><div class="result"><ul></ul></div><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.selected = [];
    this.container = shadowRoot.querySelector('div.container');
    this.currentDisabled = false;
    this.currentApi = null;
    this.currentApiLoading = false;
    this.currentValue = null;
    this.currentMax = null;
    this.blurTimeout = null;
    this.initEvents();
  };
};