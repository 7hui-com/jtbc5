export default class jtbcFieldInputWithSelect extends HTMLElement {
  static get observedAttributes() {
    return ['mode', 'position', 'data', 'value', 'placeholder', 'disabled', 'width'];
  };

  #mode = 'json';
  #position = 'left';
  #data = [];
  #options = [];
  #disabled = false;
  #allowedModes = ['json', 'combine'];
  #allowedPositions = ['left', 'right'];
  #valueOfSelect = null;
  #valueOfInput = null;

  get data() {
    return this.#data;
  };

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = '';
    let container = this.container;
    let inputValue = container.querySelector('input.value').value;
    let selectValue = container.querySelector('select.select')?.value;
    if (this.#mode == 'combine')
    {
      if (this.#position == 'left')
      {
        result = selectValue + inputValue;
      }
      else
      {
        result += inputValue + selectValue;
      };
    }
    else
    {
      result = JSON.stringify({'select': selectValue, 'value': inputValue});
    };
    return result;
  };

  get disabled() {
    return this.#disabled;
  };

  set data(data) {
    let container = this.container;
    let selectEl = container.querySelector('div.select');
    if (data.length == 0)
    {
      this.#data = [];
    }
    else
    {
      try
      {
        this.#data = JSON.parse(data);
      }
      catch(e)
      {
        this.#data = [];
        console.log(e.message);
      };
    };
    this.#options = [];
    selectEl.innerHTML = '';
    if (this.#data.length != 0)
    {
      let newElement = document.createElement('select');
      newElement.classList.add('select');
      this.#data.forEach(item => {
        this.#options.push(item.value);
        newElement.options.add(new Option(item.text, item.value));
      });
      if (this.#valueOfSelect != null) newElement.value = this.#valueOfSelect;
      newElement.addEventListener('focus', function(){ container.classList.add('focus'); });
      newElement.addEventListener('blur', function(){ container.classList.remove('focus'); });
      selectEl.append(newElement);
    };
  };

  set value(value) {
    let container = this.container;
    let inputEl = container.querySelector('input.value');
    let selectEl = container.querySelector('select.select');
    this.#valueOfSelect = null;
    this.#valueOfInput = null;
    if (value.length != 0)
    {
      if (this.#mode == 'combine')
      {
        let currentPosition = this.getAttribute('position');
        if (!this.#allowedPositions.includes(currentPosition))
        {
          currentPosition = this.#position;
        };
        if (currentPosition == 'left')
        {
          this.#options.forEach(option => {
            if (value.startsWith(option))
            {
              this.#valueOfSelect = option;
              this.#valueOfInput = value.slice(option.length);
            };
          });
        }
        else if (currentPosition == 'right')
        {
          this.#options.forEach(option => {
            if (value.endsWith(option))
            {
              this.#valueOfSelect = option;
              this.#valueOfInput = value.slice(0, 0 - option.length);
            };
          });
        };
      }
      else
      {
        try
        {
          let valueArr = JSON.parse(value);
          if (valueArr.hasOwnProperty('select'))
          {
            this.#valueOfSelect = valueArr['select'];
          };
          if (valueArr.hasOwnProperty('value'))
          {
            this.#valueOfInput = valueArr['value'];
          };
        }
        catch(e)
        {
          console.log(e.message);
        };
      };
    };
    inputEl.value = this.#valueOfInput ?? '';
    if (selectEl != null)
    {
      selectEl.value = this.#valueOfSelect ?? '';
    };
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #initEvents() {
    let container = this.container;
    container.querySelectorAll('input.value').forEach(input => {
      input.addEventListener('focus', function(){ container.classList.add('focus'); });
      input.addEventListener('blur', function(){ container.classList.remove('focus'); });
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    let container = this.container;
    switch(attr) {
      case 'mode':
      {
        if (this.#allowedModes.includes(newVal))
        {
          this.#mode = newVal;
        };
        break;
      };
      case 'position':
      {
        if (this.#allowedPositions.includes(newVal))
        {
          this.#position = newVal;
          container.setAttribute('position', newVal);
        };
        break;
      };
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
        this.container.querySelector('input.value').setAttribute('placeholder', newVal);
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
      <div class="container" position="left" style="display:none"><div class="box"><div class="select"></div><div class="input"><input type="text" name="value" class="value" autocomplete="off" /></div></div><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
  };
};