export default class jtbcFieldDate extends HTMLElement {
  static get observedAttributes() {
    return ['lang', 'min', 'max', 'value', 'disabled', 'width'];
  };

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
    let currentDate = new Date(value);
    value = this.#minDate != null && currentDate < this.#minDate? this.getDateString(this.#minDate): value;
    value = this.#maxDate != null && currentDate > this.#maxDate? this.getDateString(this.#maxDate): value;
    container.querySelector('input.date').value = this.currentValue = value;
    container.querySelector('.calendar').setAttribute('value', this.currentValue);
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

  getDateString(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let monthString = month < 10? '0' + month: month;
    let dayString = day < 10? '0' + day: day;
    return year + '-' + monthString + '-' + dayString;
  };

  closePicker(timeout = 0) {
    let container = this.container;
    let datepicker = container.querySelector('div.datepicker');
    this.#closePickerTimeout = setTimeout(() => {
      datepicker.classList.remove('on');
    }, timeout);
  };

  initEvents() {
    let that = this;
    let container = this.container;
    let date = container.querySelector('input.date');
    let calendar = container.querySelector('.calendar');
    let datepicker = container.querySelector('div.datepicker');
    date.addEventListener('blur', function(){
      let value = this.value;
      let date = new Date(value);
      let dateRegExp = /^(\d{4})\-(\d{2})\-(\d{2})$/;
      let isDate = date instanceof Date && !isNaN(date.getTime()) && dateRegExp.test(value);
      if (isDate != true)
      {
        if (value.trim() == '')
        {
          that.currentValue = '';
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
      this.value = e.detail.date;
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
        container.classList.remove('pickable');
      };
    });
    container.delegateEventListener('span.btn', 'click', function(){
      if (!container.classList.contains('pickable'))
      {
        container.classList.add('pickable');
        clearTimeout(that.#closePickerTimeout);
        if (that.offsetTop + datepicker.offsetHeight > that.offsetParent.offsetHeight)
        {
          if (that.offsetTop > datepicker.offsetHeight)
          {
            datepicker.classList.add('upper');
          };
        };
        datepicker.classList.add('on');
      }
      else
      {
        datepicker.classList.remove('on');
      };
    });
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
    };
  };

  connectedCallback() {
    this.ready = true;
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('.')) + '.css';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><input type="text" name="date" class="date" /><span class="box"></span><span class="btn"><jtbc-svg name="calendar"></jtbc-svg></span><div class="datepicker"><jtbc-calendar class="calendar"></jtbc-calendar></div><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.currentValue = '';
    this.currentDisabled = false;
    this.container = shadowRoot.querySelector('div.container');
    this.container.loadComponents().then(() => { this.initEvents(); });
  };
};