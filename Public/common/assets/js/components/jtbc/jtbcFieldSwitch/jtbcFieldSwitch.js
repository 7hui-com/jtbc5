export default class jtbcFieldSwitch extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'disabled'];
  };

  #disabled = false;
  #value = 0;

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    return this.#value;
  };

  get disabled() {
    return this.#disabled;
  };

  set value(value) {
    let currentValue = parseInt(value);
    if (currentValue != 1) currentValue = 0;
    if (this.#value != currentValue)
    {
      this.#value = currentValue;
      this.setAttribute('value', currentValue);
      if (this.#value == 1) this.container.classList.add('on');
      else if (this.#value == 0) this.container.classList.remove('on');
      this.dispatchEvent(new CustomEvent('changed', {bubbles: true}));
    };
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #initEvents() {
    this.container.querySelector('b').addEventListener('click', () => { if (!this.disabled) this.value = 1; });
    this.container.querySelector('u').addEventListener('click', () => { if (!this.disabled) this.value = 0; });
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
      <div class="container" style="display:none"><b></b><u></u><em></em></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.#initEvents();
  };
};