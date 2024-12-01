export default class jtbcFieldFlatSelector extends HTMLElement {
  static get observedAttributes() {
    return ['align', 'data', 'type', 'columns', 'max', 'placeholder', 'value', 'disabled', 'width'];
  };

  #align = null;
  #data = null;
  #type = null;
  #columns = 3;
  #max = null;
  #value = '';
  #disabled = false;
  #placeholder = null;

  get name() {
    return this.getAttribute('name');
  };

  get data() {
    return this.#data;
  };

  get placeholder() {
    return this.#placeholder;
  };

  get value() {
    let value = '';
    if (this.selected.length != 0)
    {
      value = JSON.stringify(this.selected);
    };
    return value;
  };

  get disabled() {
    return this.#disabled;
  };

  set placeholder(placeholder) {
    this.#placeholder = placeholder;
    this.container.setAttribute('placeholder', placeholder);
  };

  set value(value) {
    this.selected = [];
    this.#value = value? JSON.parse(value): [];
    if (Array.isArray(this.#value))
    {
      this.#value.forEach(item => {
        this.pushSelectedValue(item);
      });
    };
    this.reselect();
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    container.delegateEventListener('item', 'click', function(){
      if (that.disabled != true)
      {
        let value = this.getAttribute('value');
        if (that.selected.includes(value))
        {
          if (!(that.#type == 'radio') && that.selected.length === 1)
          {
            that.shiftSelectedValue(value);
          };
        }
        else
        {
          that.pushSelectedValue(value);
        };
        that.dispatchEvent(new CustomEvent('selected', {bubbles: true}));
      };
    });
  };

  getMax() {
    let currentMax = 1;
    if (this.#type != 'radio')
    {
      if (this.#max == null)
      {
        currentMax = 1000000;
      }
      else
      {
        currentMax = Math.max(1, Number.parseInt(this.#max));
      };
    };
    return currentMax;
  };

  pushSelectedValue(value) {
    if (!this.selected.includes(value))
    {
      this.selected.push(value);
      this.reselect();
    };
  };

  shiftSelectedValue(value) {
    if (this.selected.includes(value))
    {
      this.selected = this.selected.filter(item => item != value);
      this.reselect();
    };
  };

  render() {
    let currentData = this.#data;
    let container = this.container.empty();
    if (currentData != null)
    {
      let data = JSON.parse(currentData);
      if (Array.isArray(data))
      {
        data.forEach(item => {
          let newItem = document.createElement('item');
          let newItemEm = document.createElement('em');
          let newItemText = document.createElement('span');
          newItem.setAttribute('value', item.value);
          newItemText.innerText = item.text;
          newItemText.setAttribute('title', item.text);
          newItem.append(newItemEm, newItemText);
          container.appendChild(newItem);
        });
      };
    };
    this.reselect();
  };

  reselect() {
    let container = this.container;
    while (this.selected.length > this.getMax())
    {
      this.selected.shift();
    };
    container.querySelectorAll('item').forEach(item => {
      let itemValue = item.getAttribute('value');
      if (this.selected.includes(itemValue))
      {
        item.classList.add('on');
      }
      else
      {
        item.classList.remove('on');
      };
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    let container = this.container;
    switch(attr) {
      case 'align':
      {
        this.#align = newVal.toLowerCase();
        container.setAttribute('align', this.#align);
        break;
      }; 
      case 'data':
      {
        this.#data = newVal;
        break;
      };
      case 'type':
      {
        this.#type = newVal.toLowerCase();
        container.setAttribute('type', this.#type);
        break;
      };
      case 'columns':
      {
        this.#columns = isFinite(newVal)? newVal: 3;
        container.setAttribute('columns', this.#columns);
        break;
      };
      case 'max':
      {
        this.#max = isFinite(newVal)? newVal: null;
        break;
      };
      case 'placeholder':
      {
        this.placeholder = newVal;
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
    if (this.ready == true)
    {
      if (attr == 'data')
      {
        this.render();
      }
      else if (['type', 'max'].includes(attr))
      {
        this.reselect();
      };
    };
  };

  connectedCallback() {
    this.render();
    this.#initEvents();
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
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.selected = [];
    this.container = shadowRoot.querySelector('div.container');
  };
};