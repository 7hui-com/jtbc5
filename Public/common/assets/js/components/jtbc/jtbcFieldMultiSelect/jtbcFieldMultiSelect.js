export default class jtbcFieldMultiSelect extends HTMLElement {
  static get observedAttributes() {
    return ['data', 'value', 'placeholder', 'max', 'disabled', 'width'];
  };

  #data = [];
  #disabled = false;
  #template;
  #max = 1000000;
  #value = '';
  #selected = [];
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
  };

  set disabled(disabled) {
    if (this.disabled != disabled)
    {
      this.#disabled = disabled? true: false;
      if (this.disabled == true)
      {
        this.setAttribute('disabled', true);
        this.container.classList.add('disabled');
      }
      else
      {
        this.removeAttribute('disabled');
        this.container.classList.remove('disabled');
      };
    };
  };

  #setZIndex() {
    window.jtbcActiveZIndex = (window.jtbcActiveZIndex ?? 7777777) + 1;
    this.style.setProperty('--z-index', window.jtbcActiveZIndex);
  };

  #unsetZIndex() {
    this.style.removeProperty('--z-index');
  };

  closeSelector(timeout = 0) {
    let container = this.container;
    let selectorEl = container.querySelector('div.selector');
    this.#closeSelectorTimeout = setTimeout(() => {
      selectorEl.classList.remove('on');
    }, timeout);
  };

  getMax() {
    return this.#max;
  };

  select(value) {
    if (!this.#selected.includes(value))
    {
      this.#selected.push(value);
    }
    else
    {
      this.#selected.splice(this.#selected.findIndex(item => item === value), 1);
    };
    this.value = this.#selected.length == 0? '': JSON.stringify(this.#selected);
  };

  syncInputValue() {
    let realSelected = [];
    let container = this.container;
    let selectedEl = container.querySelector('div.selected').empty();
    let optionsEl = container.querySelector('div.selector div.options');
    if (this.data.length != 0)
    {
      optionsEl.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
      if (this.value.length != 0)
      {
        let valueArr = JSON.parse(this.value);
        optionsEl.querySelectorAll('li').forEach(li => {
          if (valueArr.includes(li.dataset.value))
          {
            li.classList.add('selected');
            realSelected.push(li.dataset.value);
            let fragment = document.createDocumentFragment();
            let span = document.createElement('span');
            let em = document.createElement('em');
            let jtbcSvg = document.createElement('jtbc-svg');
            em.innerText = li.dataset.text;
            jtbcSvg.setAttribute('name', 'close');
            span.dataset.value = li.dataset.value;
            span.append(em, jtbcSvg);
            fragment.append(span);
            selectedEl.appendFragment(fragment);
          };
        });
      };
      this.#selected = realSelected;
      this.#value = JSON.stringify(realSelected);
      if (this.getMax() <= realSelected.length)
      {
        optionsEl.querySelectorAll('li').forEach(li => {
          if (!li.classList.contains('selected'))
          {
            li.classList.add('locked');
          };
        });
      }
      else
      {
        optionsEl.querySelectorAll('li').forEach(li => li.classList.remove('locked'));
      };
    };
  };

  initEvents() {
    let that = this;
    let container = this.container;
    let selectorEl = container.querySelector('div.selector');
    let selectedEl = container.querySelector('div.selected');
    selectorEl.addEventListener('mouseenter', function(){
      clearTimeout(that.#closeSelectorTimeout);
    });
    selectorEl.addEventListener('mouseleave', function(){
      if (this.classList.contains('on'))
      {
        that.closeSelector(1000);
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
      if (!li.classList.contains('locked') && !li.classList.contains('disabled'))
      {
        that.select(li.dataset.value);
        that.dispatchEvent(new CustomEvent('selected', {bubbles: true}));
      };
    });
    selectedEl.delegateEventListener('span', 'click', function(){
      that.select(this.dataset.value);
      that.dispatchEvent(new CustomEvent('selected', {bubbles: true}));
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
            el.innerText = item[key];
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
        this.container.querySelector('input.text').setAttribute('placeholder', newVal);
        break;
      };
      case 'max':
      {
        this.#max = Math.max(isFinite(newVal)? newVal: 1, 1);
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
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('.')) + '.css';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><div class="selected"></div><input type="text" name="text" class="text" readonly="readonly" /><span class="box"></span><div class="selector"><div class="options"></div></div><div class="mask"></div></div>
      <template class="template"><div class="option"><em></em><span key="text"></span></div></template>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.#template = shadowRoot.querySelector('template.template');
    this.initEvents();
  };
};