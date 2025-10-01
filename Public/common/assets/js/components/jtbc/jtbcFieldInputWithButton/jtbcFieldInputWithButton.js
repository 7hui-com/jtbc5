export default class jtbcFieldInputWithButton extends HTMLElement {
  static get observedAttributes() {
    return ['text', 'text-countdown', 'value', 'placeholder', 'countdown', 'disabled', 'width'];
  };

  #text = '';
  #textCountdown = '';
  #countdown = null;
  #countdowning = false;
  #countdownInterval = null;
  #remain = null;
  #disabled = false;

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    return this.container.querySelector('input.value').value;
  };

  get disabled() {
    return this.#disabled;
  };

  set value(value) {
    this.container.querySelector('input.value').value = value;
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    let buttonEl = container.querySelector('button.button');
    container.querySelectorAll('input.value').forEach(input => {
      input.addEventListener('focus', function() { container.classList.add('focus'); });
      input.addEventListener('blur', function() { container.classList.remove('focus'); });
    });
    buttonEl.addEventListener('click', function() {
      if (!this.classList.contains('locked'))
      {
        this.classList.add('locked');
        that.dispatchEvent(new CustomEvent('buttonClicked', {bubbles: true}));
      };
    });
  };

  disableButton() {
    this.container.querySelector('button.button').classList.add('locked');
  };

  enableButton(enforceable = false) {
    let container = this.container;
    let buttonEl = container.querySelector('button.button');
    if (enforceable == true || this.#countdown == null)
    {
      buttonEl.classList.remove('locked');
    }
    else
    {
      this.#countdowning = true;
      this.#remain = this.#countdown;
      buttonEl.innerText = this.#remain + this.#textCountdown;
      this.#countdownInterval = setInterval(() => {
        this.#remain = this.#remain - 1;
        if (this.#remain > 0)
        {
          buttonEl.innerText = this.#remain + this.#textCountdown;
        }
        else
        {
          buttonEl.innerText = this.#text;
          buttonEl.classList.remove('locked');
          clearInterval(this.#countdownInterval);
        };
      }, 1000);
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    let container = this.container;
    switch(attr) {
      case 'text':
      {
        this.#text = newVal;
        if (this.#countdowning === false)
        {
          container.querySelector('button.button').innerText = newVal;
        };
        break;
      };
      case 'text-countdown':
      {
        this.#textCountdown = newVal;
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
      case 'countdown':
      {
        if (isFinite(newVal))
        {
          this.#countdown = Math.max(Math.min(Number.parseInt(newVal), 300), 5);
        };
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
      <div class="container" style="display:none"><div class="box"><div class="input"><input type="text" name="value" class="value" autocomplete="off" /></div><div class="button"><button type="button" class="button"></button></div></div><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
  };
};