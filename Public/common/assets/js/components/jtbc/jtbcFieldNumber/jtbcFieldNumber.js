export default class jtbcFieldNumber extends HTMLElement {
  static get observedAttributes() {
    return ['divisor', 'min', 'max', 'step', 'value', 'disabled', 'width'];
  };

  #disabled = false;
  #divisor = 1;
  #min = -999999999;
  #max = 999999999;
  #step = 1;
  #value = 0;

  get divisor() {
    return this.#divisor;
  };

  get min() {
    return this.#min;
  };

  get max() {
    return this.#max;
  };

  get step() {
    return this.#step;
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

  set value(value) {
    this.#value = Number.isNaN(Number.parseInt(value))? 0: Number.parseInt(value);
    this.#updateInputValue();
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    let inputNumber = container.querySelector('input.number');
    let btnAdd = container.querySelector('span.add');
    let btnMinus = container.querySelector('span.minus');
    this.addEventListener('mouseenter', function(){
      if (that.disabled != true)
      {
        container.classList.add('on');
      };
    });
    this.addEventListener('mouseleave', function(){
      container.classList.remove('on');
    });
    inputNumber.addEventListener('focus', e => {
      container.classList.add('focused');
    });
    inputNumber.addEventListener('blur', e => {
      container.classList.remove('focused');
    });
    inputNumber.addEventListener('input', e => {
      let self = e.target;
      if (this.divisor == 1)
      {
        this.#value = self.value = Number.isNaN(Number.parseInt(self.value))? 0: Number.parseInt(self.value);
      }
      else
      {
        this.#value = Number.isNaN(self.value)? 0: Number.parseInt(self.value * this.divisor);
        if (!self.value.endsWith('.')) self.value = this.#value / this.divisor;
      };
      this.checkVaildValue();
    });
    inputNumber.addEventListener('keypress', e => {
      let keyCode = e.keyCode;
      if (e.key == '.')
      {
        if (this.divisor == 1 || e.target.value.includes('.'))
        {
          e.preventDefault();
        };
      }
      else if (keyCode < 48 || keyCode > 57)
      {
        e.preventDefault();
      };
    });
    inputNumber.addEventListener('paste', e => {
      e.preventDefault();
    });
    btnAdd.addEventListener('click', () => {
      this.#value = this.#value + this.step;
      this.#updateInputValue();
    });
    btnMinus.addEventListener('click', () => {
      this.#value = this.#value - this.step;
      this.#updateInputValue();
    });
  };

  #updateInputValue(value) {
    let inputNumber = this.container.querySelector('input.number');
    let currentValue = value ?? this.#value;
    inputNumber.value = currentValue / this.divisor;
    this.checkVaildValue();
  };

  checkVaildValue() {
    let container = this.container;
    let inputNumber = container.querySelector('input.number');
    if (this.#value > this.max)
    {
      this.#value = this.max;
      inputNumber.value = this.max / this.divisor;
    }
    else if (this.#value < this.min)
    {
      this.#value = this.min;
      inputNumber.value = this.min / this.divisor;
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    let newIntValue = Number.isNaN(Number.parseInt(newVal))? 0: Number.parseInt(newVal);
    switch(attr) {
      case 'divisor':
      {
        this.#divisor = Math.max(newIntValue, 1);
        this.#updateInputValue();
        break;
      };
      case 'min':
      {
        this.#min = Math.min(newIntValue, this.max);
        this.checkVaildValue();
        break;
      };
      case 'max':
      {
        this.#max = Math.max(newIntValue, this.min);
        this.checkVaildValue();
        break;
      };
      case 'step':
      {
        this.#step = newIntValue;
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
      <div class="container" style="display:none"><span class="minus btn"><jtbc-svg name="minus"></jtbc-svg></span><input type="text" name="number" class="number" value="0" /><span class="add btn"><jtbc-svg name="add"></jtbc-svg></span><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.container.loadComponents().then(() => this.#initEvents());
  };
};