export default class jtbcFieldInputWithText extends HTMLElement {
  static get observedAttributes() {
    return ['mode', 'position', 'text', 'value', 'placeholder', 'disabled', 'width'];
  };

  #mode = 'readonly';
  #position = 'right';
  #text = '';
  #disabled = false;
  #allowedModes = ['readonly', 'combine'];
  #allowedPositions = ['left', 'right'];

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let container = this.container;
    let result = container.querySelector('input.value').value;
    if (this.#mode == 'combine')
    {
      if (this.#position == 'left')
      {
        result = this.#text + result;
      }
      else
      {
        result += this.#text;
      };
    };
    return result;
  };

  get disabled() {
    return this.#disabled;
  };

  set value(value) {
    let container = this.container;
    let inputEl = container.querySelector('input.value');
    if (this.#text.length == 0)
    {
      inputEl.value = value;
    }
    else
    {
      if (this.#mode != 'combine')
      {
        inputEl.value = value;
      }
      else
      {
        let currentPosition = this.getAttribute('position');
        if (!this.#allowedPositions.includes(currentPosition))
        {
          currentPosition = this.#position;
        };
        if (currentPosition == 'left' && value.startsWith(this.#text))
        {
          inputEl.value = value.slice(this.#text.length);
        }
        else if (currentPosition == 'right' && value.endsWith(this.#text))
        {
          inputEl.value = value.slice(0, 0 - this.#text.length);
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
    this.#disabled = disabled;
  };

  initEvents() {
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
      case 'text':
      {
        this.#text = newVal;
        container.querySelector('div.text').innerText = newVal;
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
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('.')) + '.css';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" position="right" style="display:none"><div class="text"></div><div class="input"><input type="text" name="value" class="value" /></div><div class="box"></div><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.initEvents();
  };
};