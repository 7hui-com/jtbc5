export default class jtbcField24colorPicker extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'disabled', 'width'];
  };

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = '';
    let picker = this.container.querySelector('div.picker');
    let pickedItem = picker.querySelector('item.on');
    if (pickedItem != null)
    {
      result = pickedItem.getAttribute('value');
    };
    return result;
  };

  get disabled() {
    return this.currentDisabled;
  };

  set value(value) {
    this.currentValue = value;
    if (this.ready == true)
    {
      let currentValue = this.currentValue;
      let picker = this.container.querySelector('div.picker');
      picker.querySelectorAll('item').forEach(el => {
        if (el.getAttribute('value') == currentValue)
        {
          el.classList.add('on');
        }
        else
        {
          el.classList.remove('on');
        };
      });
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

  #initEvents() {
    let itemIndex = 0;
    let picker = this.container.querySelector('div.picker');
    this.colorMap.forEach(color => {
      itemIndex += 1;
      let item = document.createElement('item');
      item.setAttribute('value', color);
      item.style.backgroundColor = color;
      item.classList.add('item-' + itemIndex);
      picker.appendChild(item);
    });
    picker.delegateEventListener('item', 'click', function(){
      if (this.classList.contains('on'))
      {
        this.classList.remove('on');
      }
      else
      {
        this.parentNode.querySelectorAll('item').forEach(el => {
          el.classList.remove('on');
        });
        this.classList.add('on');
      };
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
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
    this.#initEvents();
    this.ready = true;
    if (this.currentValue != null)
    {
      this.value = this.currentValue;
    };
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><div class="picker"></div><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.colorMap = ['#735244', '#c29682', '#627a9d', '#576c43', '#8580b1', '#67bdaa', '#d67e2c', '#505ba6', '#c15a63', '#5e3c6c', '#9dbc40', '#e0a32e', '#383d96', '#469449', '#af363c', '#e7c71f', '#bb5695', '#0885a1', '#f3f3f2', '#c8c8c8', '#a0a0a0', '#7a7a79', '#555555', '#343434'];
    this.currentDisabled = false;
    this.currentValue = null;
  };
};