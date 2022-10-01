export default class jtbcFieldCurrencyInput extends HTMLElement {
  static get observedAttributes() {
    return ['currency', 'mode', 'value', 'maxlength', 'placeholder', 'disabled', 'width'];
  };

  #mode = 'integer';
  #disabled = false;
  #currency = decodeURIComponent('%C2%A5');

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = '';
    let container = this.container;
    let currentValue = container.querySelector('input.value').value;
    currentValue = currentValue.endsWith('.')? currentValue.slice(0, -1): currentValue;
    if (currentValue != '' && this.#isVaildValue(currentValue))
    {
      if (this.#mode == 'integer')
      {
        if (currentValue.includes('.'))
        {
          result = Math.round(Number.parseFloat(currentValue) * 100);
        }
        else
        {
          result = Number.parseInt(currentValue) * 100;
        };
      }
      else
      {
        result = Number.parseFloat(currentValue).toFixed(2);
      };
    };
    return result;
  };

  get currency() {
    return this.#currency;
  };

  get disabled() {
    return this.#disabled;
  };

  set value(value) {
    let container = this.container;
    if (this.#isVaildValue(value))
    {
      let currentValue = value;
      if (this.#mode == 'integer')
      {
        currentValue = Number.parseFloat(Number.parseInt(value) / 100).toFixed(2);
      };
      container.querySelector('input.value').value = currentValue;
      container.querySelector('input.value').dispatchEvent(new InputEvent('input'));
    };
  };

  set currency(currency) {
    this.#currency = currency;
    this.container.querySelector('div.currency').innerText = currency;
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

  #isVaildValue(value) {
    let result = false;
    if (isFinite(value))
    {
      if (typeof(value) == 'number')
      {
        value = value.toString();
      };
      const isNumber = v => /^\d+$/.test(v);
      if (!value.includes('.'))
      {
        result = isNumber(value);
      }
      else
      {
        let valueL = value.substring(0, value.indexOf('.'));
        let valueR = value.substring(value.indexOf('.') + 1);
        if (isNumber(valueL) && isNumber(valueR))
        {
          result = true;
        };
      };
    };
    return result;
  };

  #initEvents() {
    let container = this.container;
    container.querySelector('input.value').addEventListener('keydown', e => {
      let refused = false;
      let target = e.target;
      let targetValue = target.value;
      let keyCode = e.keyCode;
      let allowedKeyCode = [8, 37, 39, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 110, 190];
      if (keyCode == 229)
      {
        target.readOnly = true;
      }
      else
      {
        target.readOnly = false;
        if (!allowedKeyCode.includes(keyCode))
        {
          refused = true;
        }
        else if (targetValue.includes('.') && keyCode == 190)
        {
          refused = true;
        };
        if (refused === true)
        {
          e.preventDefault();
        };
      };
    });
    container.querySelector('input.value').addEventListener('input', e => {
      let suffix = null;
      let target = e.target;
      let targetValue = target.value;
      let parent = target.parentElement;
      if (targetValue.includes('.') && targetValue.substring(targetValue.indexOf('.') + 1).length > 2)
      {
        let valueL = targetValue.substring(0, targetValue.indexOf('.'));
        let valueR = targetValue.substring(targetValue.indexOf('.') + 1);
        target.value = valueL + '.' + valueR.substring(0, 2);
      }
      else
      {
        let mirror = parent.querySelector('div.mirror');
        mirror.innerText = targetValue;
        if (targetValue != '')
        {
          if (!targetValue.includes('.'))
          {
            suffix = '.00';
          }
          else
          {
            let decimal = targetValue.substring(targetValue.indexOf('.') + 1);
            if (decimal.length == 0)
            {
              suffix = '00';
            }
            else if (decimal.length == 1)
            {
              suffix = '0';
            };
          };
        };
        if (suffix == null)
        {
          parent.removeAttribute('suffix');
        }
        else
        {
          parent.setAttribute('suffix', suffix);
          parent.style.setProperty('--suffix-left', mirror.clientWidth + 'px');
        };
        this.dispatchEvent(new CustomEvent('changed', {bubbles: true}));
      };
    });
    container.querySelector('input.value').addEventListener('paste', e => e.preventDefault());
    container.querySelector('input.value').addEventListener('focus', e => container.classList.add('on'));
    container.querySelector('input.value').addEventListener('blur', e => container.classList.remove('on'));
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'currency':
      {
        this.currency = newVal;
      };
      case 'mode':
      {
        if (['integer', 'decimal'].includes(newVal))
        {
          this.#mode = newVal;
        };
        break;
      };
      case 'value':
      {
        this.value = newVal;
        break;
      };
      case 'maxlength':
      {
        this.container.querySelector('input.value').setAttribute('maxlength', newVal);
      };
      case 'placeholder':
      {
        this.container.querySelector('input.value').setAttribute('placeholder', newVal);
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
    this.container.querySelector('div.currency').innerText = this.currency;
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><div class="currency"></div><div class="value"><input type="text" name="value" class="value" /><div class="mirror"></div></div><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.#initEvents();
  };
};