export default class jtbcFieldSelect2 extends HTMLElement {
  static get observedAttributes() {
    return ['data', 'value', 'placeholder', 'disabled', 'width'];
  };

  #data = [];
  #disabled = false;
  #template;
  #value = '';
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

  initEvents() {
    let that = this;
    let container = this.container;
    let selectorEl = container.querySelector('div.selector');
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

  setOptions() {
    let container = this.container;
    let optionsEl = container.querySelector('div.selector div.options').empty();
    const appendOptions = (data, parentEl) => {
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
          if (item.hasOwnProperty('children'))
          {
            appendOptions(item.children, li);
          };
          if (item.disabled === true)
          {
            li.classList.add('disabled');
          };
          ul.appendChild(li);
        });
        parentEl.appendChild(ul);
      };
    };
    appendOptions(this.data, optionsEl);
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
      <div class="container" style="display:none"><input type="text" name="text" class="text" readonly="readonly" /><span class="box"></span><span class="empty"></span><div class="selector"><div class="options"></div></div><div class="mask"></div></div>
      <template class="template"><div class="option"><span key="text"></span><span key="subtext"></span></div></template>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.#template = shadowRoot.querySelector('template.template');
    this.initEvents();
  };
};