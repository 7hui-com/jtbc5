export default class jtbcFieldNumber extends HTMLElement {
  static get observedAttributes() {
    return ['min', 'max', 'step', 'value', 'disabled', 'width'];
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
    let container = this.container;
    let inputNumber = container.querySelector('input.number');
    let intValue = Number.isNaN(Number.parseInt(value))? 0: Number.parseInt(value);
    this.currentValue = inputNumber.value = intValue;
    this.checkVaildValue();
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
      this.currentValue = self.value = Number.isNaN(Number.parseInt(self.value))? 0: Number.parseInt(self.value);
      this.checkVaildValue();
    });
    inputNumber.addEventListener('keypress', e => {
      let keyCode = e.keyCode;
      if (keyCode < 48 || keyCode > 57)
      {
        e.preventDefault();
      };
    });
    inputNumber.addEventListener('paste', e => {
      e.preventDefault();
    });
    btnAdd.addEventListener('click', () => {
      this.currentValue = inputNumber.value = this.currentValue + this.currentStep;
      this.checkVaildValue();
    });
    btnMinus.addEventListener('click', () => {
      this.currentValue = inputNumber.value = this.currentValue - this.currentStep;
      this.checkVaildValue();
    });
  };

  checkVaildValue() {
    let container = this.container;
    let inputNumber = container.querySelector('input.number');
    if (this.currentValue > this.currentMax)
    {
      this.currentValue = inputNumber.value = this.currentMax;
    }
    else if (this.currentValue < this.currentMin)
    {
      this.currentValue = inputNumber.value = this.currentMin;
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    let newIntValue = Number.isNaN(Number.parseInt(newVal))? 0: Number.parseInt(newVal);
    switch(attr) {
      case 'min':
      {
        this.currentMin = newIntValue;
        if (this.currentMin > this.currentMax)
        {
          this.currentMin = this.currentMax;
        };
        this.checkVaildValue();
        break;
      };
      case 'max':
      {
        this.currentMax = newIntValue;
        if (this.currentMax < this.currentMin)
        {
          this.currentMax = this.currentMin;
        };
        this.checkVaildValue();
        break;
      };
      case 'step':
      {
        this.currentStep = newIntValue;
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
    this.currentMin = -999999999;
    this.currentMax = 999999999;
    this.currentStep = 1;
    this.currentValue = 0;
    this.currentDisabled = false;
    this.#initEvents();
  };
};