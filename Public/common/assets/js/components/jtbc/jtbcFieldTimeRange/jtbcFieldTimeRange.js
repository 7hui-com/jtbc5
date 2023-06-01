export default class jtbcFieldTimeRange extends HTMLElement {
  static get observedAttributes() {
    return ['min-hour', 'max-hour', 'minute-step', 'second-step', 'value', 'disabled', 'width', 'placeholder_start', 'placeholder_end'];
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
    let startTime = '';
    let endTime = '';
    let container = this.container;
    if (this.#isTimeRange(value))
    {
      this.#value = value;
      this.#selectTime();
      container.classList.add('loaded');
      [startTime, endTime] = value.split('~');
      this.dispatchEvent(new CustomEvent('changed', {bubbles: true}));
    }
    else
    {
      this.#value = '';
      this.#initTimeOptions();
      container.classList.remove('loaded');
      this.dispatchEvent(new CustomEvent('emptied', {bubbles: true}));
    };
    container.querySelector('input[name=starttime]').value = startTime;
    container.querySelector('input[name=endtime]').value = endTime;
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
      const getCurrentTime = name => {
        let result = null;
        let el = container.querySelector('div.' + name);
        if (el != null)
        {
          let hourEl = el.querySelector('div.h ul');
          let minuteEl = el.querySelector('div.m ul');
          let secondEl = el.querySelector('div.s ul');
          let hourSelectedEl = hourEl.querySelector('li.selected');
          let minuteSelectedEl = minuteEl.querySelector('li.selected');
          let secondSelectedEl = secondEl.querySelector('li.selected');
          if (hourSelectedEl != null && minuteSelectedEl != null && secondSelectedEl != null)
          {
            result = hourSelectedEl.getAttribute('value') + ':' + minuteSelectedEl.getAttribute('value') + ':' + secondSelectedEl.getAttribute('value');
          };
        };
        return result;
      };
      let startTime = getCurrentTime('start');
      let endTime = getCurrentTime('end');
      if (startTime != null && endTime != null)
      {
        if (this.#compareTime(startTime, endTime) == 1)
        {
          this.value = endTime + '~' + startTime;
        }
        else
        {
          this.value = startTime + '~' + endTime;
        };
      };
    };
  };

  #initTimeOptions() {
    let container = this.container;
    const appendOptions = (...args) => {
      args.forEach(name => {
        let el = container.querySelector('div.' + name);
        if (el != null)
        {
          let hourEl = el.querySelector('div.h ul');
          let minuteEl = el.querySelector('div.m ul');
          let secondEl = el.querySelector('div.s ul');
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
      });
    };
    appendOptions('start', 'end');
  };

  #isTime(time) {
    let timeRegExp = /^(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;
    return timeRegExp.test(time)? true: false;
  };

  #isTimeRange(value) {
    let result = false;
    if (value.includes('~'))
    {
      let valueArr = value.split('~');
      if (valueArr.length == 2)
      {
        if (this.#isTime(valueArr[0]) && this.#isTime(valueArr[1]))
        {
          result = true;
        };
      };
    };
    return result;
  };

  #compareTime(startTime, endTime) {
    let result = null;
    if (this.#isTime(startTime) && this.#isTime(endTime))
    {
      result = 0;
      let [sh, sm, ss] = startTime.split(':').map(v => Number.parseInt(v));
      let [eh, em, es] = endTime.split(':').map(v => Number.parseInt(v));
      if (sh == eh)
      {
        if (sm == em)
        {
          if (ss != es)
          {
            result = ss < es? -1: 1;
          };
        }
        else
        {
          result = sm < em? -1: 1;
        };
      }
      else
      {
        result = sh < eh? -1: 1;
      };
    };
    return result;
  };

  #setZIndex() {
    window.jtbcActiveZIndex = (window.jtbcActiveZIndex ?? 7777777) + 1;
    this.style.setProperty('--z-index', window.jtbcActiveZIndex);
  };

  #unsetZIndex() {
    this.style.removeProperty('--z-index');
  };

  #selectTime() {
    let value = this.value;
    let container = this.container;
    if (this.#isTimeRange(value))
    {
      let [startTime, endTime] = value.split('~');
      const selectTime = (name, value) => {
        let [h, m, s] = value.split(':');
        let el = container.querySelector('div.' + name);
        if (el != null)
        {
          el.querySelectorAll('div.item').forEach(item => {
            let currentItemValue = h;
            if (item.classList.contains('m')) currentItemValue = m;
            else if (item.classList.contains('s')) currentItemValue = s;
            item.querySelectorAll('li').forEach(li => {
              li.classList.toggle('selected', li.getAttribute('value') == currentItemValue);
            });
          });
        };
      };
      selectTime('start', startTime);
      selectTime('end', endTime);
    };
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    let timepicker = container.querySelector('div.timepicker');
    container.querySelectorAll('input.time').forEach(input => {
      input.addEventListener('focus', function(){
        container.querySelector('span.box')?.classList.add('focus');
      });
      input.addEventListener('blur', function(){
        let value = this.value;
        if (that.#isTime(value))
        {
          if (that.#isTimeRange(that.value))
          {
            let [startTime, endTime] = that.value.split('~');
            if (this.getAttribute('mode') == 'start')
            {
              startTime = value;
            }
            else
            {
              endTime = value;
            };
            if (that.#compareTime(startTime, endTime) == 1)
            {
              that.value = endTime + '~' + startTime;
            }
            else
            {
              that.value = startTime + '~' + endTime;
            };
          };
        }
        else
        {
          that.value = '';
        };
        container.querySelector('span.box')?.classList.remove('focus');
      });
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
    container.delegateEventListener('span.btn.delete', 'click', function(){
      that.value = '';
    });
    container.delegateEventListener('span.btn.select', 'click', function(){
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
      case 'placeholder_start':
      {
        container.querySelector('input[name=starttime]')?.setAttribute('placeholder', newVal);
        break;
      };
      case 'placeholder_end':
      {
        container.querySelector('input[name=endtime]')?.setAttribute('placeholder', newVal);
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
      <div class="container" style="display:none">
        <div class="input">
          <span class="time"><input type="text" name="starttime" class="time" mode="start" autocomplete="off" /></span>
          <span class="separator">~</span>
          <span class="time"><input type="text" name="endtime" class="time" mode="end" autocomplete="off" /></span>
        </div>
        <span class="box"></span>
        <span class="btn delete"><jtbc-svg name="close_small"></jtbc-svg></span>
        <span class="btn select"><jtbc-svg name="alarm"></jtbc-svg></span>
        <div class="timepicker">
          <div class="time start">
            <div class="item h"><ul></ul></div>
            <div class="item m"><ul></ul></div>
            <div class="item s"><ul></ul></div>
          </div>
          <div class="time end">
            <div class="item h"><ul></ul></div>
            <div class="item m"><ul></ul></div>
            <div class="item s"><ul></ul></div>
          </div>
        </div>
        <div class="mask"></div>
      </div>
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