export default class jtbcFieldRange extends HTMLElement {
  static get observedAttributes() {
    return ['direction', 'divisor', 'marks', 'mode', 'min', 'max', 'step', 'separator', 'tooltip', 'value', 'disabled', 'width'];
  };

  #direction = 'horizontal';
  #divisor = 1;
  #marks = null;
  #min = 0;
  #max = 100;
  #mode = 'singleton';
  #step = 1;
  #leftValue = null;
  #rightValue = null;
  #separator = '~';
  #tooltip = true;
  #disabled = false;
  #tempValue = null;

  get direction() {
    return this.#direction;
  };

  get marks() {
    return this.#marks;
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

  get mode() {
    return this.#mode;
  };

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    return this.#mode == 'singleton'? this.#rightValue: this.#leftValue + this.#separator + this.#rightValue;
  };

  get separator() {
    return this.#separator;
  };

  get tooltip() {
    return this.#tooltip;
  };

  get disabled() {
    return this.#disabled;
  };

  set direction(direction) {
    this.#direction = direction;
    this.container.setAttribute('direction', direction);
    if (direction == 'horizontal')
    {
      this.style.width = 'var(--width)';
      this.style.height = 'var(--height)';
    }
    else
    {
      this.style.width = 'var(--height)';
      this.style.height = 'var(--width)';
    };
    this.container.querySelector('div.marks').dispatchEvent(new CustomEvent('locate'));
  };

  set mode(mode) {
    this.#mode = mode;
    this.container.setAttribute('mode', mode);
  };

  set tooltip(tooltip) {
    this.#tooltip = tooltip;
    this.container.setAttribute('tooltip', tooltip);
  };

  set value(value) {
    let container = this.container;
    let track = container.querySelector('span.track');
    let leftSlider = container.querySelector('span.slider[position=left]');
    let rightSlider = container.querySelector('span.slider[position=right]');
    if (value.includes(this.#separator))
    {
      let valueArr = value.split(this.#separator);
      let leftValue = valueArr.shift();
      let rightValue = valueArr.pop();
      this.#leftValue = Math.min(this.max, Math.max(this.min, Number.isNaN(Number.parseInt(leftValue))? 0: Number.parseInt(leftValue)));
      this.#rightValue = Math.min(this.max, Math.max(this.min, Number.isNaN(Number.parseInt(rightValue))? 0: Number.parseInt(rightValue)));
      if (this.#leftValue > this.#rightValue)
      {
        [this.#leftValue, this.#rightValue] = [this.#rightValue, this.#leftValue];
      };
    }
    else
    {
      this.#leftValue = this.min;
      this.#rightValue = Math.min(this.max, Math.max(this.min, Number.isNaN(Number.parseInt(value))? 0: Number.parseInt(value)));
    };
    let rightValue = this.#rightValue;
    let leftValue = this.#mode == 'singleton'? this.min: this.#leftValue;
    let leftPercentage = this.max == this.min? 100: Math.round((leftValue - this.min) / (this.max - this.min) * 100);
    let rightPercentage = this.max == this.min? 100: Math.round((rightValue - this.min) / (this.max - this.min) * 100);
    if (this.direction == 'horizontal')
    {
      delete track.style.top;
      delete leftSlider.style.top;
      delete rightSlider.style.top;
      track.style.left = leftPercentage + '%';
      track.style.width = (rightPercentage - leftPercentage) + '%';
      track.style.height = '100%';
      leftSlider.style.left = leftPercentage + '%';
      rightSlider.style.left = rightPercentage + '%';
    }
    else
    {
      delete track.style.left;
      delete leftSlider.style.left;
      delete rightSlider.style.left;
      track.style.top = leftPercentage + '%';
      track.style.width = '100%';
      track.style.height = (rightPercentage - leftPercentage) + '%';
      leftSlider.style.top = leftPercentage + '%';
      rightSlider.style.top = rightPercentage + '%';
    };
    this.setSliderValue();
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    let change = function(x, y) {
      let thisWidth = that.clientWidth;
      let thisHeight = that.clientHeight;
      let startPosition = that.startPosition;
      let startLeftValue = startPosition.leftValue;
      let startRightValue = startPosition.rightValue;
      let elPosition = that.startPosition.el.getAttribute('position');
      let percentage = that.direction == 'horizontal'? ((x - startPosition.startX) / thisWidth): ((y - startPosition.startY) / thisHeight);
      if (elPosition == 'left')
      {
        let targetLeftValue = Math.round(startLeftValue + (that.max - that.min) * percentage);
        if (targetLeftValue != that.max && that.step != 1)
        {
          targetLeftValue = targetLeftValue - targetLeftValue % that.step;
        };
        that.value = targetLeftValue + that.separator + startRightValue;
      }
      else
      {
        let targetRightValue = Math.round(startRightValue + (that.max - that.min) * percentage);
        if (targetRightValue != that.max && that.step != 1)
        {
          targetRightValue = targetRightValue - targetRightValue % that.step;
        };
        that.value = startLeftValue + that.separator + targetRightValue;
      };
    };
    container.querySelector('div.marks').addEventListener('locate', function() {
      this.querySelectorAll('div.mark').forEach(el => {
        if (that.direction == 'horizontal')
        {
          el.style.top = 'auto';
          el.style.left = el.dataset.percentage + '%';
        }
        else
        {
          el.style.top = el.dataset.percentage + '%';
          el.style.left = 'auto';
        };
      });
    });
    if (isTouchDevice())
    {
      container.delegateEventListener('div.rail span.slider', 'touchstart', function(e) {
        e.preventDefault();
        if (e.touches.length == 1)
        {
          let slide = function(e) {
            change(e.touches[0].screenX, e.touches[0].screenY);
          };
          let stop = function(e) {
            document.removeEventListener('touchmove', slide);
            document.removeEventListener('touchend', stop);
          };
          that.startPosition = {
            'el': this,
            'leftValue': that.#leftValue,
            'rightValue': that.#rightValue,
            'startX': e.touches[0].screenX,
            'startY': e.touches[0].screenY,
          };
          document.addEventListener('touchmove', slide);
          document.addEventListener('touchend', stop);
        };
      });
    }
    else
    {
      container.delegateEventListener('div.rail span.slider', 'mousedown', function(e) {
        e.preventDefault();
        let slide = function(e) {
          change(e.screenX, e.screenY);
        };
        let stop = function(e) {
          document.removeEventListener('mousemove', slide);
          document.removeEventListener('mouseup', stop);
        };
        that.startPosition = {
          'el': this,
          'leftValue': that.#leftValue,
          'rightValue': that.#rightValue,
          'startX': e.screenX,
          'startY': e.screenY,
        };
        document.addEventListener('mousemove', slide);
        document.addEventListener('mouseup', stop);
      });
    };
  };

  #initValue() {
    if (this.#tempValue != null)
    {
      this.value = this.#tempValue;
    };
    if (this.#leftValue == null)
    {
      this.#leftValue = this.#min;
    };
    if (this.#rightValue == null)
    {
      this.#rightValue = this.#mode == 'singleton'? Math.round(this.#max / 2): this.#max;
    };
    this.value = this.#leftValue + this.#separator + this.#rightValue;
  };

  #resetValue() {
    if (this.ready === true)
    {
      this.value = this.#leftValue + this.#separator + this.#rightValue;
    };
  };

  #setValue(value) {
    if (this.ready === true)
    {
      this.value = value;
    }
    else
    {
      this.#tempValue = value;
    };
  };

  setMarks(marks) {
    let marksObj = null;
    let container = this.container;
    try
    {
      marksObj = JSON.parse(marks);
    }
    catch(e)
    {
      throw new Error('Unexpected value');
    };
    if (marksObj instanceof Object)
    {
      this.#marks = marksObj;
      let marksEl = container.querySelector('div.marks').empty();
      Object.keys(marksObj).forEach(key => {
        let currentKey = Number.isNaN(Number.parseInt(key))? 0: Number.parseInt(key);
        if (currentKey >= this.min && currentKey <= this.max)
        {
          let percentage = Math.round((currentKey - this.min) / (this.max - this.min) * 100);
          let mark = document.createElement('div');
          let markSlot = document.createElement('slot');
          mark.classList.add('mark');
          mark.dataset.percentage = percentage;
          markSlot.setAttribute('name', 'mark' + currentKey);
          markSlot.innerText = marksObj[key];
          mark.append(markSlot);
          marksEl.append(mark);
        };
      });
      marksEl.dispatchEvent(new CustomEvent('locate'));
    };
  };

  setSliderValue() {
    let container = this.container;
    let leftSlider = container.querySelector('span.slider[position=left]');
    let rightSlider = container.querySelector('span.slider[position=right]');
    leftSlider.setAttribute('value', this.#leftValue / this.#divisor);
    rightSlider.setAttribute('value', this.#rightValue / this.#divisor);
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    let newIntValue = Number.isNaN(Number.parseInt(newVal))? 0: Number.parseInt(newVal);
    switch(attr) {
      case 'direction':
      {
        if (['horizontal', 'vertical'].includes(newVal))
        {
          this.direction = newVal;
          this.#resetValue();
        }
        else
        {
          throw new Error('Unexpected value');
        };
        break;
      };
      case 'divisor':
      {
        this.#divisor = Math.max(newIntValue, 1);
        this.#resetValue();
        break;
      };
      case 'tooltip':
      {
        this.tooltip = newVal == 'true'? true: false;
        break;
      };
      case 'marks':
      {
        this.setMarks(newVal);
      };
      case 'min':
      {
        this.#min = Math.min(newIntValue, this.max);
        this.#resetValue();
        break;
      };
      case 'max':
      {
        this.#max = Math.max(newIntValue, this.min);
        this.#resetValue();
        break;
      };
      case 'mode':
      {
        if (['range', 'singleton'].includes(newVal))
        {
          this.mode = newVal;
        }
        else
        {
          throw new Error('Unexpected value');
        };
        break;
      };
      case 'step':
      {
        this.#step = newIntValue;
        this.#resetValue();
        break;
      };
      case 'separator':
      {
        this.#separator = newVal;
        this.#resetValue();
        break;
      };
      case 'value':
      {
        this.#setValue(newVal);
        break;
      };
      case 'disabled':
      {
        this.disabled = this.hasAttribute('disabled')? true: false;
        break;
      };
      case 'width':
      {
        this.style.setProperty('--width', isFinite(newVal)? newVal + 'px': newVal);
        this.#resetValue();
        break;
      };
    };
  };

  connectedCallback() {
    this.#initValue();
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
      <div class="container" tooltip="true" mode="singleton" direction="horizontal" style="display:none">
        <div class="rail"><span class="track"></span><span class="slider" position="left" draggable="false"></span><span class="slider" position="right" draggable="false"></span></div>
        <div class="marks"></div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
  };
};