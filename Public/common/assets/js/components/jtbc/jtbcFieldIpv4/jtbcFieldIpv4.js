import validation from '../../../library/validation/validation.js';

export default class jtbcFieldIpv4 extends HTMLElement {
  static get observedAttributes() {
    return ['mode', 'value', 'disabled', 'separator', 'template', 'width'];
  };

  #mode = 'normal';
  #template = null;
  #separator = '.';
  #disabled = false;
  #value = null;
  #limit = {};

  get name() {
    return this.getAttribute('name');
  };

  get mode() {
    return this.#mode;
  };

  get template() {
    return this.#template;
  };

  get separator() {
    return this.#separator;
  };

  get value() {
    let result = this.#value ?? '';
    let container = this.container;
    if (this.ready == true)
    {
      let valueArr = [];
      container.querySelectorAll('input[type=text]').forEach(el => valueArr.push(el.value));
      if (this.mode == 'strict')
      {
        let tempResult = valueArr.join('.');
        result = validation.isIPV4(tempResult)? tempResult: '';
      }
      else
      {
        result = valueArr.join('.');
      };
    };
    return result;
  };

  get disabled() {
    return this.#disabled;
  };

  set mode(mode) {
    this.#mode = mode;
  };

  set template(template) {
    if (template.includes('.'))
    {
      let container = this.container;
      let templateArr = template.split('.');
      if (templateArr.length === 4)
      {
        let index = 1;
        this.#limit = {};
        this.#template = template;
        templateArr.forEach(tpl => {
          let el = container.querySelector('input[name="section-' + index + '"]');
          if (el != null)
          {
            if (tpl == '*')
            {
              el.classList.remove('disabled');
              this.#limit['section-' + index] = null;
            }
            else if (tpl.includes('~'))
            {
              el.classList.remove('disabled');
              el.value = tpl.substring(0, tpl.indexOf('~'));
              this.#limit['section-' + index] = tpl;
            }
            else
            {
              let tplValue = Number.parseInt(tpl);
              if (!Number.isNaN(tplValue))
              {
                if (tplValue >= 0 && tplValue <= 255)
                {
                  el.value = tplValue;
                  el.classList.add('disabled');
                };
              };
            };
          };
          index += 1;
        });
      };
    };
  };

  set separator(separator) {
    this.#separator = separator;
    this.container.querySelectorAll('em.separator').forEach(el => {
      el.innerText = separator;
    });
  };

  set value(value) {
    let container = this.container;
    if (this.ready != true)
    {
      this.#value = value;
    }
    else
    {
      let index = 1;
      let valueArr = value.split('.');
      valueArr.forEach(section => {
        let el = container.querySelector('input[name="section-' + index + '"]');
        if (el != null)
        {
          if (!el.classList.contains('disabled'))
          {
            let targetValue = Number.parseInt(section);
            if (!Number.isNaN(targetValue) && targetValue >= 0 && targetValue <= 255)
            {
              el.value = targetValue;
            };
          };
        };
        index += 1;
      });
    };
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    container.querySelector('div.input').querySelectorAll('input[type=text]').forEach(el => {
      el.addEventListener('focus', function(){
        container.dataset.focused = 'true';
        container.classList.add('focused');
      });
      el.addEventListener('blur', function(){
        container.dataset.focused = 'false';
        setTimeout(() => {
          if (container.dataset.focused == 'false')
          {
            container.classList.remove('focused');
          };
        }, 100);
      });
      el.addEventListener('keydown', function(e){
        if (e.keyCode === 8)
        {
          if (this.value.length == 0)
          {
            this.dispatchEvent(new CustomEvent('focusprev'));
          };
        }
        else if ([37, 38].includes(e.keyCode))
        {
          this.dispatchEvent(new CustomEvent('focusprev'));
        }
        else if ([39, 40].includes(e.keyCode))
        {
          this.dispatchEvent(new CustomEvent('focusnext'));
        };
      });
      el.addEventListener('keyup', function(e){
        if (e.keyCode === 190)
        {
          this.value = this.value.replaceAll('.', '');
          this.dispatchEvent(new CustomEvent('focusnext'));
        };
      });
      el.addEventListener('input', function(){
        let isValid = true;
        let value = Number(this.value);
        let currentIndex = Number.parseInt(this.dataset.index);
        let limit = that.#limit['section-' + currentIndex] ?? '';
        value = Number.isNaN(value)? 0: Number.parseInt(value);
        value = Math.max(0, Math.min(255, value));
        if (limit.includes('~'))
        {
          let limitArr = limit.split('~');
          if (limitArr.length === 2)
          {
            let leftLimit = Number.parseInt(limitArr[0]);
            let rightLimit = Number.parseInt(limitArr[1]);
            if (!Number.isNaN(leftLimit) && value < leftLimit)
            {
              isValid = false;
            };
            if (!Number.isNaN(rightLimit) && value > rightLimit)
            {
              isValid = false;
            };
          };
        };
        if (this.value != value)
        {
          this.value = value;
        }
        else
        {
          if (value >= 100)
          {
            this.dispatchEvent(new CustomEvent('focusnext'));
          };
        };
        this.classList.toggle('invalid', !isValid);
      });
      el.addEventListener('focusprev', function(){
        let currentIndex = Number.parseInt(this.dataset.index);
        if (currentIndex > 0)
        {
          let prevIndex = currentIndex - 1;
          let prevInput = container.querySelector('input[name="section-' + prevIndex + '"]');
          if (prevInput != null)
          {
            prevInput.focus();
            prevInput.select();
          };
        };
      });
      el.addEventListener('focusnext', function(){
        let currentIndex = Number.parseInt(this.dataset.index);
        if (currentIndex < 4)
        {
          let nextIndex = currentIndex + 1;
          let nextInput = container.querySelector('input[name="section-' + nextIndex + '"]');
          if (nextInput != null)
          {
            nextInput.focus();
            nextInput.select();
          };
        };
      });
    });
  };

  syncValue() {
    if (this.#value != null)
    {
      this.value = this.#value;
      this.#value = null;
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'mode':
      {
        this.mode = newVal;
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
      case 'separator':
      {
        this.separator = newVal;
        break;
      };
      case 'template':
      {
        this.template = newVal;
        break;
      };
      case 'width':
      {
        this.style.setProperty('--width', isFinite(newVal)? newVal + 'px': newVal);
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#initEvents();
    this.syncValue();
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none">
        <div class="input"><span class="section"><input type="text" name="section-1" data-index="1" /></span><em class="separator">.</em><span class="section"><input type="text" name="section-2" data-index="2" /></span><em class="separator">.</em><span class="section"><input type="text" name="section-3" data-index="3" /></span><em class="separator">.</em><span class="section"><input type="text" name="section-4" data-index="4" /></span></div>
        <div class="mask"></div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
  };
};