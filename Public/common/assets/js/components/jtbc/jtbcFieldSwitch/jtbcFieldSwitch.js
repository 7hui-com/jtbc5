export default class jtbcFieldSwitch extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'disabled'];
  };

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    return this.currentValue;
  };

  get disabled() {
    return this.currentDisabled;
  };

  set value(value) {
    let currentValue = parseInt(value);
    if (currentValue != 1) currentValue = 0;
    if (this.currentValue != currentValue)
    {
      this.currentValue = currentValue;
      this.setAttribute('value', currentValue);
      if (this.currentValue == 1) this.container.classList.add('on');
      else if (this.currentValue == 0) this.container.classList.remove('on');
      this.dispatchEvent(new CustomEvent('changed', {bubbles: true}));
    };
  };

  set disabled(disabled) {
    let currentDisabled = disabled;
    if (this.currentDisabled != currentDisabled)
    {
      this.currentDisabled = currentDisabled? true: false;
      if (this.currentDisabled == true)
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
      <span class="switch" style="display:none"><b></b><u></u><em></em></span>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('span.switch');
    this.container.querySelector('b').addEventListener('click', () => { if (!this.disabled) this.value = 1; });
    this.container.querySelector('u').addEventListener('click', () => { if (!this.disabled) this.value = 0; });
    this.currentValue = 0;
    this.currentDisabled = false;
  };
};