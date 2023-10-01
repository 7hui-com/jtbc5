export default class jtbcFieldSelector extends HTMLElement {
  static get observedAttributes() {
    return ['data', 'value', 'placeholder', 'searchable', 'search-placeholder', 'disabled', 'width'];
  };

  #data = [];
  #disabled = false;
  #value = '';
  #searchable = false;
  #closeSelectorTimeout;

  get data() {
    return this.#data;
  };

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    return this.#value;
  };

  get disabled() {
    return this.#disabled;
  };

  get searchable() {
    return this.#searchable;
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
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  set searchable(searchable) {
    this.#searchable = searchable;
    this.container.classList.toggle('searchable', searchable);
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
    let searchEl = container.querySelector('div.search');
    let selectorEl = container.querySelector('div.selector');
    searchEl.querySelector('input.keyword').addEventListener('focus', function(){
      this.parentElement.classList.add('on');
    });
    searchEl.querySelector('input.keyword').addEventListener('blur', function(){
      this.parentElement.classList.remove('on');
    });
    searchEl.querySelector('input.keyword').addEventListener('input', function(){
      that.filterOptions(this.value);
    });
    selectorEl.addEventListener('mouseenter', function(){
      clearTimeout(that.#closeSelectorTimeout);
    });
    selectorEl.addEventListener('mouseleave', function(){
      if (!searchEl.classList.contains('on'))
      {
        if (this.classList.contains('on'))
        {
          that.closeSelector(1000);
        };
      };
    });
    selectorEl.addEventListener('transitionend', function(){
      if (!this.classList.contains('on'))
      {
        that.#unsetZIndex();
        container.classList.remove('pickable');
      };
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
    container.addEventListener('mouseenter', function(){
      let emptyEl = this.querySelector('span.empty');
      if (that.value == '')
      {
        emptyEl.classList.remove('on');
      }
      else
      {
        emptyEl.classList.add('on');
      };
    });
    container.addEventListener('mouseleave', function(){
      this.querySelector('span.empty')?.classList.remove('on');
    });
    container.querySelector('span.box').addEventListener('click', function(){
      if (!container.classList.contains('pickable'))
      {
        that.#setZIndex();
        container.classList.add('pickable');
        clearTimeout(that.#closeSelectorTimeout);
        if (that.getBoundingClientRect().bottom + selectorEl.offsetHeight + 20 > document.documentElement.clientHeight)
        {
          if (that.getBoundingClientRect().top > selectorEl.offsetHeight)
          {
            selectorEl.classList.add('upper');
          };
        }
        else
        {
          selectorEl.classList.remove('upper');
        };
        selectorEl.classList.add('on');
      }
      else
      {
        selectorEl.classList.remove('on');
      };
    });
    container.querySelector('span.empty').addEventListener('click', function(){
      that.value = '';
      this.classList.remove('on');
    });
  };

  closeSelector(timeout = 0) {
    let container = this.container;
    let selectorEl = container.querySelector('div.selector');
    this.#closeSelectorTimeout = setTimeout(() => {
      selectorEl.classList.remove('on');
    }, timeout);
  };

  syncInputValue() {
    let container = this.container;
    let inputTextEl = container.querySelector('input.text');
    let optionsEl = container.querySelector('div.selector div.options');
    if (this.data.length != 0 && this.value != '')
    {
      optionsEl.querySelectorAll('li').forEach(li => {
        if (li.dataset.value == this.value)
        {
          li.classList.add('selected');
          inputTextEl.value = li.dataset.text;
        }
        else
        {
          li.classList.remove('selected');
        };
      });
    }
    else
    {
      inputTextEl.value = '';
    };
  };

  filterOptions(value) {
    let container = this.container;
    let optionsEl = container.querySelector('div.selector div.options');
    optionsEl.querySelectorAll('li').forEach(li => {
      if (li.dataset.text.includes(value) || li.dataset.value.includes(value))
      {
        li.classList.remove('hide');
      }
      else
      {
        li.classList.add('hide');
      };
    });
  };

  setOptions() {
    let container = this.container;
    let optionsEl = container.querySelector('div.selector div.options').empty();
    let ul = document.createElement('ul');
    this.data.forEach(item => {
      let li = document.createElement('li');
      let option = document.createElement('div');
      li.dataset.text = item.text;
      li.dataset.value = item.value;
      option.classList.add('option');
      option.innerText = item.text;
      if (item.disabled === true)
      {
        li.classList.add('disabled');
      };
      li.append(option);
      ul.appendChild(li);
    });
    optionsEl.append(ul);
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
        this.container.querySelector('input.text').setAttribute('placeholder', newVal);
        break;
      };
      case 'searchable':
      {
        this.searchable = this.hasAttribute('searchable')? true: false;
        break;
      };
      case 'search-placeholder':
      {
        this.container.querySelector('input.keyword').setAttribute('placeholder', newVal);
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
      <div class="container" style="display:none"><input type="text" name="text" class="text" readonly="readonly" /><span class="box"></span><span class="empty"></span><div class="selector"><div class="box"><div class="search"><input type="text" name="keyword" class="keyword" autocomplete="off" /></div><div class="options"></div></div></div><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.#initEvents();
  };
};