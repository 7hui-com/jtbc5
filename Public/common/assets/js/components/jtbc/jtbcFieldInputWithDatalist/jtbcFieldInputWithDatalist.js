export default class jtbcFieldInputWithDatalist extends HTMLElement {
  static get observedAttributes() {
    return ['data', 'value', 'placeholder', 'disabled', 'width'];
  };

  #data = [];
  #disabled = false;
  #template;
  #value = null;
  #placeholder = null;
  #filterable = true;
  #backupedValue = null;
  #closeSelectorTimeout;

  get data() {
    return this.#data;
  };

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    return this.container.querySelector('input.text').value;
  };

  get disabled() {
    return this.#disabled;
  };

  get template() {
    return this.querySelector('template') ?? this.#template;
  };

  set data(data) {
    if (Array.isArray(data))
    {
      this.#data = data;
    }
    else if (typeof data == 'string')
    {
      let dataValue = JSON.parse(data);
      this.#data = Array.isArray(dataValue)? dataValue: [];
    };
    this.setOptions();
  };

  set value(value) {
    this.#value = value;
    this.syncInputValue();
    this.dispatchEvent(new CustomEvent('changed', {bubbles: true}));
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #filterOptions() {
    let result = false;
    let currentValue = this.value;
    let container = this.container;
    let selectorEl = container.querySelector('div.selector');
    let optionsEl = selectorEl.querySelector('div.options');
    let isItemMatched = false;
    const matchItem = (value, data) => {
      let result = false;
      let valueLength = value.length;
      let dataLength = data.length;
      if (dataLength != 0)
      {
        if (valueLength == 0)
        {
          result = true;
        }
        else
        {
          let matchCount = 0;
          value.split('').map(k => {
            if (data.includes(k))
            {
              matchCount += 1;
            };
          });
          result = (matchCount / valueLength * 100) > 80? true: false;
        };
      };
      return result;
    };
    if (this.#filterable === true)
    {
      result = true;
      let matchedIndex = 0;
      optionsEl.querySelectorAll('li').forEach(li => {
        if (matchItem(currentValue, li.dataset.text) || matchItem(currentValue, li.dataset.value))
        {
          matchedIndex += 1;
          isItemMatched = true;
          li.classList.remove('hide');
          li.setAttribute('mi', matchedIndex);
        }
        else
        {
          li.classList.add('hide');
          li.removeAttribute('mi');
        };
      });
      if (isItemMatched == false)
      {
        selectorEl.classList.add('hide');
      }
      else
      {
        selectorEl.classList.remove('hide');
        this.#setPickablePosition();
      };
    };
    return result;
  };

  #selectPrevItem() {
    let container = this.container;
    let selectorEl = container.querySelector('div.selector');
    let selectedItem = selectorEl.querySelector('li.selected');
    if (selectedItem == null)
    {
      selectorEl.querySelector('li[mi]:last-child')?.classList.add('selected');
    }
    else
    {
      selectedItem.classList.remove('selected');
      if (!selectedItem.hasAttribute('mi'))
      {
        selectorEl.querySelector('li[mi]:last-child')?.classList.add('selected');
      }
      else
      {
        let currentMi = Number.parseInt(selectedItem.getAttribute('mi'));
        let prevItem = selectorEl.querySelector('li[mi="' + (currentMi - 1) + '"]');
        if (prevItem != null)
        {
          prevItem.classList.add('selected');
        }
        else
        {
          selectorEl.querySelector('li[mi]:last-child')?.classList.add('selected');
        };
      };
    };
    let newSelectedItem = selectorEl.querySelector('li.selected');
    if (newSelectedItem != null && !newSelectedItem.classList.contains('disabled'))
    {
      this.value = newSelectedItem.dataset.value;
    };
  };

  #selectNextItem() {
    let container = this.container;
    let selectorEl = container.querySelector('div.selector');
    let selectedItem = selectorEl.querySelector('li.selected');
    if (selectedItem == null)
    {
      selectorEl.querySelector('li[mi]')?.classList.add('selected');
    }
    else
    {
      selectedItem.classList.remove('selected');
      if (!selectedItem.hasAttribute('mi'))
      {
        selectorEl.querySelector('li[mi]')?.classList.add('selected');
      }
      else
      {
        let currentMi = Number.parseInt(selectedItem.getAttribute('mi'));
        let nextItem = selectorEl.querySelector('li[mi="' + (currentMi + 1) + '"]');
        if (nextItem != null)
        {
          nextItem.classList.add('selected');
        }
        else
        {
          selectorEl.querySelector('li[mi]')?.classList.add('selected');
        };
      };
    };
    let newSelectedItem = selectorEl.querySelector('li.selected');
    if (newSelectedItem != null && !newSelectedItem.classList.contains('disabled'))
    {
      this.value = newSelectedItem.dataset.value;
    };
  };

  #setPickable(status = true) {
    let container = this.container;
    let selectorEl = container.querySelector('div.selector');
    if (status === true)
    {
      this.#setZIndex();
      container.classList.add('pickable');
      clearTimeout(this.#closeSelectorTimeout);
      this.#setPickablePosition();
      selectorEl.classList.add('on');
    }
    else
    {
      selectorEl.classList.remove('on');
      if (selectorEl.classList.contains('hide'))
      {
        selectorEl.dispatchEvent(new CustomEvent('close'));
      };
      if (this.#backupedValue != null)
      {
        if (this.value == '')
        {
          this.value = this.#backupedValue;
        };
        this.#backupedValue = null;
        container.querySelector('input.text').setAttribute('placeholder', this.#placeholder ?? '');
      };
    };
  };

  #setPickablePosition() {
    let container = this.container;
    let selectorEl = container.querySelector('div.selector');
    if (this.getBoundingClientRect().bottom + selectorEl.offsetHeight + 20 > document.documentElement.clientHeight)
    {
      if (this.getBoundingClientRect().top > selectorEl.offsetHeight)
      {
        selectorEl.classList.add('upper');
      };
    }
    else
    {
      selectorEl.classList.remove('upper');
    };
  };

  #setZIndex() {
    this.style.setProperty('--z-index', window.getActiveZIndex());
  };

  #unsetZIndex() {
    this.style.removeProperty('--z-index');
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    let selectorEl = container.querySelector('div.selector');
    selectorEl.addEventListener('mouseenter', function(){
      clearTimeout(that.#closeSelectorTimeout);
    });
    selectorEl.addEventListener('mouseleave', function(){
      if (document.activeElement != that && this.classList.contains('on'))
      {
        that.closeSelector(1000);
      };
    });
    selectorEl.addEventListener('close', function(){
      if (!this.classList.contains('on'))
      {
        that.#unsetZIndex();
        container.classList.remove('pickable');
      };
    });
    selectorEl.addEventListener('transitionend', function(){
      this.dispatchEvent(new CustomEvent('close'));
    });
    selectorEl.delegateEventListener('div.option', 'click', function(){
      let li = this.parentElement;
      if (!li.classList.contains('disabled'))
      {
        that.closeSelector(0);
        that.value = li.dataset.value;
        that.dispatchEvent(new CustomEvent('selected', {bubbles: true}));
      };
    });
    container.querySelector('input.text').addEventListener('focus', function(){
      that.#filterOptions();
      that.#setPickable(true);
    });
    container.querySelector('input.text').addEventListener('blur', function(){
      that.closeSelector(300);
    });
    container.querySelector('input.text').addEventListener('input', function(){
      that.#filterOptions();
      that.dispatchEvent(new CustomEvent('changed', {bubbles: true}));
    });
    container.querySelector('input.text').addEventListener('keydown', function(e){
      if (e.keyCode == 38)
      {
        e.preventDefault();
        that.#selectPrevItem();
      }
      else if (e.keyCode == 40)
      {
        e.preventDefault();
        that.#selectNextItem();
      };
    });
    container.querySelector('input.text').addEventListener('compositionstart', function(){
      that.#filterable = false;
    });
    container.querySelector('input.text').addEventListener('compositionend', function(){
      that.#filterable = true;
      that.#filterOptions();
    });
    container.querySelector('span.box').addEventListener('click', function(){
      if (!container.classList.contains('pickable') || selectorEl.classList.contains('hide'))
      {
        if (that.value != '')
        {
          that.#backupedValue = that.value;
          container.querySelector('input.text').value = '';
          container.querySelector('input.text').setAttribute('placeholder', that.#backupedValue);
          that.#filterOptions();
        }
        that.#setPickable(true);
      }
      else
      {
        that.#setPickable(false);
      };
    });
  };

  closeSelector(timeout = 0) {
    this.#closeSelectorTimeout = setTimeout(() => {
      this.#setPickable(false);
    }, timeout);
  };

  syncInputValue() {
    let targetValue = this.#value;
    let container = this.container;
    let optionsEl = container.querySelector('div.selector div.options');
    if (targetValue != null)
    {
      container.querySelector('input.text').value = targetValue;
      if (this.data.length != 0)
      {
        optionsEl.querySelectorAll('li').forEach(li => {
          if (li.dataset.value == targetValue)
          {
            li.classList.add('selected');
          }
          else
          {
            li.classList.remove('selected');
          };
        });
      };
    };
  };

  setOptions() {
    let data = this.data;
    let container = this.container;
    let optionsEl = container.querySelector('div.selector div.options').empty();
    if (Array.isArray(data) && data.length != 0)
    {
      let ul = document.createElement('ul');
      data.forEach(item => {
        let li = document.createElement('li');
        li.appendChild(this.template.content.cloneNode(true));
        li.dataset.text = item.text;
        li.dataset.value = item.value;
        Object.keys(item).forEach(key => {
          li.querySelectorAll('[key="' + key + '"]').forEach(el => {
            if (el.tagName == 'IMG')
            {
              el.setAttribute('src', item[key]);
            }
            else
            {
              el.innerText = item[key];
            };
          });
        });
        if (item.disabled === true)
        {
          li.classList.add('disabled');
        };
        ul.appendChild(li);
      });
      optionsEl.appendChild(ul);
    };
    this.syncInputValue();
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'data':
      {
        this.data = newVal;
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
        this.container.querySelector('input.text').setAttribute('placeholder', this.#placeholder);
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
    this.#initEvents();
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><input type="text" name="text" class="text" autocomplete="off" spellcheck="false" /><span class="box"></span><div class="selector"><div class="options"></div></div><div class="mask"></div></div>
      <template class="template"><div class="option"><span key="text"></span><span key="subtext"></span></div></template>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.#template = shadowRoot.querySelector('template.template');
  };
};