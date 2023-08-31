export default class jtbcFieldNineSquareSelector extends HTMLElement {
  static get observedAttributes() {
    return ['mode', 'value', 'unavailable', 'disabled'];
  };

  #mode = 'single';
  #value = null;
  #unavailable = null;
  #disabled = false;

  get name() {
    return this.getAttribute('name');
  };

  get mode() {
    return this.#mode;
  };

  get value() {
    let value = '';
    let container = this.container;
    if (this.mode == 'single')
    {
      let selected = container.querySelector('div.item.on');
      if (selected != null)
      {
        value = selected.getAttribute('value');
      };
    }
    else
    {
      let valueArr = [];
      container.querySelectorAll('div.item.on').forEach(item => valueArr.push(item.getAttribute('value')));
      if (valueArr.length != 0)
      {
        value = JSON.stringify(valueArr);
      };
    };
    return value;
  };

  get unavailable() {
    return this.#unavailable;
  };

  get disabled() {
    return this.#disabled;
  };

  set mode(mode) {
    if (mode == 'multiple')
    {
      this.#mode = 'multiple';
    }
    else
    {
      this.mode = 'single';
    };
    this.#selectItem();
  };

  set value(value) {
    this.#value = value;
    this.#selectItem();
  };

  set unavailable(unavailable) {
    let container = this.container;
    this.#unavailable = unavailable;
    container.querySelectorAll('div.item').forEach(item => item.classList.remove('unavailable'));
    if (unavailable.length != 0)
    {
      unavailable.split(',').forEach(item => container.querySelector('div.item[item=\'' + item + '\']')?.classList.add('unavailable'));
    };
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    container.delegateEventListener('div.item', 'click', function(){
      if (!this.classList.contains('unavailable'))
      {
        if (that.mode == 'single')
        {
          this.parentElement.querySelectorAll('div.item').forEach(item => item.classList.toggle('on', item == this));
        }
        else
        {
          this.classList.toggle('on');
        };
        that.dispatchEvent(new CustomEvent('changed', {bubbles: true}));
      };
    });
  };

  #selectItem() {
    let container = this.container;
    let currentValue = this.#value;
    container.querySelectorAll('div.item').forEach(item => item.classList.remove('on'));
    if (currentValue != null)
    {
      if (currentValue.length != 0)
      {
        if (this.mode == 'single')
        {
          container.querySelector('div.item[value=\'' + currentValue + '\']')?.classList.add('on');
        }
        else
        {
          let currentValueArr = [];
          try
          {
            currentValueArr = JSON.parse(currentValue);
          }
          catch(e)
          {
            throw new Error('Unexpected value');
          };
          currentValueArr.forEach(value => container.querySelector('div.item[value=\'' + value + '\']')?.classList.add('on'));
        };
      };
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'mode':
      {
        this.mode = newVal;
        break;
      };
      case 'value':
      {
        this.value = newVal;
        break;
      };
      case 'unavailable':
      {
        this.unavailable = newVal;
        break;
      };
      case 'disabled':
      {
        this.disabled = this.hasAttribute('disabled')? true: false;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#selectItem();
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><div class="items"><div class="item" item="1" value="top-left"><slot name="item-1"></slot></div><div class="item" item="2" value="top-center"><slot name="item-2"></slot></div><div class="item" item="3" value="top-right"><slot name="item-3"></slot></div><div class="item" item="4" value="middle-left"><slot name="item-4"></slot></div><div class="item" item="5" value="center"><slot name="item-5"></slot></div><div class="item" item="6" value="middle-right"><slot name="item-6"></slot></div><div class="item" item="7" value="bottom-left"><slot name="item-7"></slot></div><div class="item" item="8" value="bottom-center"><slot name="item-8"></slot></div><div class="item" item="9" value="bottom-right"><slot name="item-9"></slot></div></div><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.#initEvents();
  };
};