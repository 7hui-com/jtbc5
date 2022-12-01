export default class jtbcFieldTime extends HTMLElement {
  static get observedAttributes() {
    return ['min-hour', 'max-hour', 'minute-step', 'second-step', 'value', 'disabled', 'width', 'placeholder'];
  };

  #changed = false;
  #minHour = 0;
  #maxHour = 23;
  #minuteStep = 1;
  #secondStep = 1;
  #value = '';
  #disabled = false;
  #closePickerTimeout;

  get name() {
    return this.getAttribute('name');
  };

  get minHour() {
    return this.#minHour;
  };

  get maxHour() {
    return this.#maxHour;
  };

  get minuteStep() {
    return this.#minuteStep;
  };

  get secondStep() {
    return this.#secondStep;
  };

  get value() {
    return this.#value;
  };

  get disabled() {
    return this.#disabled;
  };

  set minHour(minHour) {
    if (isFinite(minHour))
    {
      minHour = Number.parseInt(minHour);
      if (minHour >= 0 && minHour < this.#maxHour)
      {
        this.#minHour = minHour;
        this.reset();
      };
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  set maxHour(maxHour) {
    if (isFinite(maxHour))
    {
      maxHour = Number.parseInt(maxHour);
      if (maxHour <= 23 && maxHour > this.#minHour)
      {
        this.#maxHour = maxHour;
        this.reset();
      };
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  set minuteStep(minuteStep) {
    if (isFinite(minuteStep))
    {
      this.#minuteStep = Math.max(0, Math.min(30, Number.parseInt(minuteStep)));
      this.reset();
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  set secondStep(secondStep) {
    if (isFinite(secondStep))
    {
      this.#secondStep = Math.max(0, Math.min(30, Number.parseInt(secondStep)));
      this.reset();
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  set value(value) {
    let container = this.container;
    if (this.#isTime(value))
    {
      this.#value = value;
      this.#selectTime();
      container.querySelector('input.time').value = value;
      this.dispatchEvent(new CustomEvent('changed', {bubbles: true}));
    }
    else
    {
      throw new Error('Unexpected value');
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

  #resize() {
    let container = this.container;
    this.style.setProperty('--width', container.offsetWidth + 'px');
  };

  #changeValue() {
    let container = this.container;
    if (this.#changed === true)
    {
      let hourEl = container.querySelector('div.time div.h ul');
      let minuteEl = container.querySelector('div.time div.m ul');
      let secondEl = container.querySelector('div.time div.s ul');
      let hourSelectedEl = hourEl.querySelector('li.selected');
      let minuteSelectedEl = minuteEl.querySelector('li.selected');
      let secondSelectedEl = secondEl.querySelector('li.selected');
      if (hourSelectedEl != null && minuteSelectedEl != null && secondSelectedEl != null)
      {
        this.value = hourSelectedEl.getAttribute('value') + ':' + minuteSelectedEl.getAttribute('value') + ':' + secondSelectedEl.getAttribute('value');
      };
    };
  };

  #initTimeOptions() {
    let container = this.container;
    let hourEl = container.querySelector('div.time div.h ul');
    let minuteEl = container.querySelector('div.time div.m ul');
    let secondEl = container.querySelector('div.time div.s ul');
    if (hourEl != null && minuteEl != null && secondEl != null)
    {
      let newHourEl = document.createElement('ul');
      for (let i = this.#minHour; i <= this.#maxHour; i ++)
      {
        let text = i < 10? '0' + i: i;
        let newLi = document.createElement('li');
        newLi.innerText = text;
        newLi.setAttribute('value', text);
        newHourEl.append(newLi);
      };
      newHourEl.querySelector('li')?.classList.add('selected');
      hourEl.replaceWith(newHourEl);
      let newMinuteEl = document.createElement('ul');
      for (let i = 0; i < 60; i += this.minuteStep)
      {
        let text = i < 10? '0' + i: i;
        let newLi = document.createElement('li');
        newLi.innerText = text;
        newLi.setAttribute('value', text);
        newMinuteEl.append(newLi);
      };
      newMinuteEl.querySelector('li')?.classList.add('selected');
      minuteEl.replaceWith(newMinuteEl);
      let newSecondEl = document.createElement('ul');
      for (let i = 0; i < 60; i += this.secondStep)
      {
        let text = i < 10? '0' + i: i;
        let newLi = document.createElement('li');
        newLi.innerText = text;
        newLi.setAttribute('value', text);
        newSecondEl.append(newLi);
      };
      secondEl.replaceWith(newSecondEl);
      newSecondEl.querySelector('li')?.classList.add('selected');
    };
  };

  #isTime(time) {
    let timeRegExp = /^(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;
    return timeRegExp.test(time)? true: false;
  };

  #setZIndex() {
    window.jtbcActiveZIndex = (window.jtbcActiveZIndex ?? 7777777) + 1;
    this.style.setProperty('--z-index', window.jtbcActiveZIndex);
  };

  #unsetZIndex() {
    this.style.removeProperty('--z-index');
  };

  #selectTime() {
    let container = this.container;
    if (this.#isTime(this.#value))
    {
      let [h, m, s] = this.#value.split(':');
      container.querySelectorAll('div.time div.item').forEach(item => {
        let currentItemValue = h;
        if (item.classList.contains('m')) currentItemValue = m;
        else if (item.classList.contains('s')) currentItemValue = s;
        item.querySelectorAll('li').forEach(li => {
          li.classList.toggle('selected', li.getAttribute('value') == currentItemValue);
        });
      });
    };
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    let time = container.querySelector('input.time');
    let timepicker = container.querySelector('div.timepicker');
    time.addEventListener('blur', function(){
      let value = this.value;
      if (!that.#isTime(value))
      {
        if (value.trim() == '')
        {
          that.#value = '';
          that.dispatchEvent(new CustomEvent('emptied', {bubbles: true}));
        }
        else
        {
          this.value = that.#value;
        };
      }
      else
      {
        that.value = value;
      };
    });
    timepicker.addEventListener('mouseenter', function(){
      clearTimeout(that.#closePickerTimeout);
    });
    timepicker.addEventListener('mouseleave', function(){
      if (this.classList.contains('on'))
      {
        that.closePicker(1000);
      };
    });
    timepicker.addEventListener('transitionend', function(){
      if (!this.classList.contains('on'))
      {
        that.#unsetZIndex();
        container.classList.remove('pickable');
      };
    });
    container.delegateEventListener('div.time div.item li', 'click', function(){
      this.parentNode.querySelectorAll('li').forEach(el => {
        that.#changed = true;
        if (el == this)
        {
          el.classList.add('selected');
        }
        else
        {
          el.classList.remove('selected');
        };
      });
    });
    container.delegateEventListener('div.time div.item li', 'dblclick', function(){
      that.#changeValue();
      timepicker.classList.remove('on');
    });
    container.delegateEventListener('span.btn', 'click', function(){
      if (!container.classList.contains('pickable'))
      {
        that.#setZIndex();
        container.classList.add('pickable');
        clearTimeout(that.#closePickerTimeout);
        if (that.getBoundingClientRect().bottom + timepicker.offsetHeight + 20 > document.documentElement.clientHeight)
        {
          if (that.getBoundingClientRect().top > timepicker.offsetHeight)
          {
            timepicker.classList.add('upper');
          };
        }
        else
        {
          timepicker.classList.remove('upper');
        };
        timepicker.classList.add('on');
        timepicker.querySelectorAll('div.item').forEach(el => {
          let selectedLi = el.querySelector('li.selected');
          if (selectedLi != null)
          {
            selectedLi.parentNode.scrollTop = Math.max(selectedLi.index() - 5, 0) * selectedLi.offsetHeight;
          };
        });
      }
      else
      {
        timepicker.classList.remove('on');
      };
    });
  };

  closePicker(timeout = 0) {
    let container = this.container;
    let timepicker = container.querySelector('div.timepicker');
    this.#closePickerTimeout = setTimeout(() => {
      this.#changeValue();
      timepicker.classList.remove('on');
    }, timeout);
  };

  reset() {
    if (this.ready == true)
    {
      this.#initTimeOptions();
      this.#selectTime();
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    let container = this.container;
    switch(attr) {
      case 'min-hour':
      {
        this.minHour = newVal;
        break;
      };
      case 'max-hour':
      {
        this.maxHour = newVal;
        break;
      };
      case 'minute-step':
      {
        this.minuteStep = newVal;
        break;
      };
      case 'second-step':
      {
        this.secondStep = newVal;
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
      case 'placeholder':
      {
        container.querySelector('input.time').setAttribute('placeholder', newVal);
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#resize();
    this.#initTimeOptions();
    this.#selectTime();
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  disconnectedCallback() {
    this.resizeObserver.disconnect();
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><input type="text" name="time" class="time" /><span class="box"></span><span class="btn"><jtbc-svg name="alarm"></jtbc-svg></span><div class="timepicker"><div class="time"><div class="item h"><ul></ul></div><div class="item m"><ul></ul></div><div class="item s"><ul></ul></div></div></div><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.#disabled = false;
    this.container = shadowRoot.querySelector('div.container');
    this.container.loadComponents().then(() => { this.#initEvents(); });
    this.resizeObserver = new ResizeObserver(entries => this.#resize(entries));
    this.resizeObserver.observe(this.container);
  };
};