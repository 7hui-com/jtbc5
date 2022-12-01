export default class jtbcFieldInputWithIcon extends HTMLElement {
  static get observedAttributes() {
    return ['icon', 'type', 'position', 'value', 'placeholder', 'disabled', 'width'];
  };

  #icon = 'target';
  #type = 'text';
  #position = 'left';
  #disabled = false;
  #allowedTypes = ['text', 'password'];
  #allowedPositions = ['left', 'right'];

  get icon() {
    return this.#icon;
  };

  get type() {
    return this.#type;
  };

  get position() {
    return this.#position;
  };

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    return this.container.querySelector('input.value').value;
  };

  get disabled() {
    return this.#disabled;
  };

  set icon(icon) {
    this.#icon = icon;
    let container = this.container;
    let newIcon = document.createElement('jtbc-svg');
    newIcon.setAttribute('name', icon);
    container.querySelector('div.icon').empty().append(newIcon);
  };

  set value(value) {
    this.container.querySelector('input.value').value = value;
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

  #initEvents() {
    let container = this.container;
    container.querySelector('div.icon').addEventListener('click', e => {
      this.dispatchEvent(new CustomEvent('iconclicked', {bubbles: true}));
    });
    container.querySelectorAll('input.value').forEach(input => {
      input.addEventListener('focus', function(){ container.classList.add('focus'); });
      input.addEventListener('blur', function(){ container.classList.remove('focus'); });
      input.addEventListener('change', e => {
        this.dispatchEvent(new CustomEvent('changed', {bubbles: true, detail: {'e': e}}));
      });
      input.addEventListener('keyup', e => {
        this.dispatchEvent(new CustomEvent('inputted', {bubbles: true, detail: {'e': e}}));
      });
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    let container = this.container;
    let input = container.querySelector('input.value');
    switch(attr) {
      case 'icon':
      {
        this.icon = newVal;
      };
      case 'type':
      {
        if (this.#allowedTypes.includes(newVal))
        {
          this.#type = newVal;
          input.setAttribute('type', newVal);
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
      case 'value':
      {
        this.value = newVal;
        break;
      };
      case 'placeholder':
      {
        input.setAttribute('placeholder', newVal);
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
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" position="left" style="display:none"><div class="icon"><jtbc-svg name="target"></jtbc-svg></div><div class="input"><input type="text" name="value" class="value" autocomplete="off" /></div><div class="box"></div><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.container.loadComponents();
    this.#initEvents();
  };
};