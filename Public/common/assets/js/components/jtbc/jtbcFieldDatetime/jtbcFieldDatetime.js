export default class jtbcFieldDatetime extends HTMLElement {
  static get observedAttributes() {
    return ['lang', 'min', 'max', 'value', 'disabled', 'width', 'placeholder'];
  };

  #changed = false;
  #closePickerTimeout;
  #lang;
  #minDate = null;
  #maxDate = null;

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
    if (this.#isDateTime(value))
    {
      let currentDate = new Date(value);
      let currentDateHours = currentDate.getHours();
      let currentDateMinutes = currentDate.getMinutes();
      let currentDateSeconds = currentDate.getSeconds();
      currentDateHours = currentDateHours < 10? '0' + currentDateHours: currentDateHours;
      currentDateMinutes = currentDateMinutes < 10? '0' + currentDateMinutes: currentDateMinutes;
      currentDateSeconds = currentDateSeconds < 10? '0' + currentDateSeconds: currentDateSeconds;
      value = this.#minDate != null && currentDate < this.#minDate? this.getDateString(this.#minDate): value;
      value = this.#maxDate != null && currentDate > this.#maxDate? this.getDateString(this.#maxDate): value;
      container.querySelector('input.datetime').value = this.currentValue = value;
      container.querySelector('.calendar').setAttribute('value', this.getDateString(currentDate));
      container.querySelectorAll('div.time div.item').forEach(item => {
        let currentItemValue = currentDateHours;
        if (item.classList.contains('m')) currentItemValue = currentDateMinutes;
        else if (item.classList.contains('s')) currentItemValue = currentDateSeconds;
        item.querySelectorAll('li').forEach(li => {
          li.getAttribute('value') == currentItemValue? li.classList.add('selected'): li.classList.remove('selected');
        });
      });
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
    this.currentDisabled = disabled;
  };

  #changeValue() {
    let container = this.container;
    let calendar = container.querySelector('.calendar');
    if (this.#changed === true)
    {
      let hourEl = container.querySelector('div.time div.h ul');
      let minuteEl = container.querySelector('div.time div.m ul');
      let secondEl = container.querySelector('div.time div.s ul');
      let currentDate = calendar.value == ''? this.getDateString(new Date()): calendar.value;
      let currentTime = hourEl.querySelector('li.selected').getAttribute('value') + ':' + minuteEl.querySelector('li.selected').getAttribute('value') + ':' + secondEl.querySelector('li.selected').getAttribute('value');
      this.value = currentDate + ' ' + currentTime;
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
      for (let i = 0; i < 24; i ++)
      {
        let text = i < 10? '0' + i: i;
        let newLi = document.createElement('li');
        newLi.innerText = text;
        newLi.setAttribute('value', text);
        if (i == 0)
        {
          newLi.classList.add('selected');
        };
        newHourEl.append(newLi);
      };
      hourEl.replaceWith(newHourEl);
      let newMinuteEl = document.createElement('ul');
      for (let i = 0; i < 60; i ++)
      {
        let text = i < 10? '0' + i: i;
        let newLi = document.createElement('li');
        newLi.innerText = text;
        newLi.setAttribute('value', text);
        if (i == 0)
        {
          newLi.classList.add('selected');
        };
        newMinuteEl.append(newLi);
      };
      minuteEl.replaceWith(newMinuteEl);
      let newSecondEl = document.createElement('ul');
      for (let i = 0; i < 60; i ++)
      {
        let text = i < 10? '0' + i: i;
        let newLi = document.createElement('li');
        newLi.innerText = text;
        newLi.setAttribute('value', text);
        if (i == 0)
        {
          newLi.classList.add('selected');
        };
        newSecondEl.append(newLi);
      };
      secondEl.replaceWith(newSecondEl);
    };
  };

  #isDateTime(datetime) {
    let result = false;
    let date = new Date(datetime);
    let dateRegExp = /^(\d{4})\-(\d{2})\-(\d{2})\s+(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;
    if (date instanceof Date && !isNaN(date.getTime()) && dateRegExp.test(datetime))
    {
      result = true;
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

  #initEvents() {
    let that = this;
    let container = this.container;
    let datetime = container.querySelector('input.datetime');
    let calendar = container.querySelector('.calendar');
    let datepicker = container.querySelector('div.datepicker');
    datetime.addEventListener('blur', function(){
      let value = this.value;
      if (!that.#isDateTime(value))
      {
        if (value.trim() == '')
        {
          that.currentValue = '';
          that.dispatchEvent(new CustomEvent('emptied', {bubbles: true}));
        }
        else
        {
          this.value = that.currentValue;
        };
      }
      else
      {
        that.value = value;
      };
    });
    calendar.addEventListener('dateclick', e => {
      this.#changed = true;
      calendar.setAttribute('value', e.detail.date);
    });
    calendar.addEventListener('datedblclick', () => {
      this.#changeValue();
      datepicker.classList.remove('on');
    });
    datepicker.addEventListener('mouseenter', function(){
      clearTimeout(that.#closePickerTimeout);
    });
    datepicker.addEventListener('mouseleave', function(){
      if (this.classList.contains('on'))
      {
        that.closePicker(1000);
      };
    });
    datepicker.addEventListener('transitionend', function(){
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
      datepicker.classList.remove('on');
    });
    container.delegateEventListener('span.btn', 'click', function(){
      if (!container.classList.contains('pickable'))
      {
        that.#setZIndex();
        container.classList.add('pickable');
        clearTimeout(that.#closePickerTimeout);
        if (that.getBoundingClientRect().bottom + datepicker.offsetHeight + 20 > document.documentElement.clientHeight)
        {
          if (that.getBoundingClientRect().top > datepicker.offsetHeight)
          {
            datepicker.classList.add('upper');
          };
        }
        else
        {
          datepicker.classList.remove('upper');
        };
        if (that.#isDateTime(that.value))
        {
          calendar.render(that.value);
          calendar.setAttribute('value', that.getDateString(new Date(that.value)));
        };
        datepicker.classList.add('on');
        datepicker.querySelectorAll('div.item').forEach(el => {
          let selectedLi = el.querySelector('li.selected');
          if (selectedLi != null)
          {
            selectedLi.parentNode.scrollTop = Math.max(selectedLi.index() - 5, 0) * selectedLi.offsetHeight;
          };
        });
      }
      else
      {
        datepicker.classList.remove('on');
      };
    });
  };

  closePicker(timeout = 0) {
    let container = this.container;
    let datepicker = container.querySelector('div.datepicker');
    this.#closePickerTimeout = setTimeout(() => {
      this.#changeValue();
      datepicker.classList.remove('on');
    }, timeout);
  };

  getDateString(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let monthString = month < 10? '0' + month: month;
    let dayString = day < 10? '0' + day: day;
    return year + '-' + monthString + '-' + dayString;
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    let container = this.container;
    let calendar = container.querySelector('.calendar');
    switch(attr) {
      case 'lang':
      {
        this.#lang = newVal;
        calendar.setAttribute('lang', this.#lang);
        break;
      };
      case 'min':
      {
        this.#minDate = new Date(newVal);
        calendar.setAttribute('min', newVal);
        break;
      };
      case 'max':
      {
        this.#maxDate = new Date(newVal);
        calendar.setAttribute('max', newVal);
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
        container.querySelector('input.datetime').setAttribute('placeholder', newVal);
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
      <div class="container" style="display:none"><input type="text" name="datetime" class="datetime" /><span class="box"></span><span class="btn"><jtbc-svg name="calendar"></jtbc-svg></span><div class="datepicker"><div class="date"><jtbc-calendar class="calendar"></jtbc-calendar></div><div class="time"><div class="item h"><ul></ul></div><div class="item m"><ul></ul></div><div class="item s"><ul></ul></div></div></div><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.currentValue = '';
    this.currentDisabled = false;
    this.container = shadowRoot.querySelector('div.container');
    this.#initTimeOptions();
    this.container.loadComponents().then(() => { this.#initEvents(); });
  };
};