import langHelper from '../../../library/lang/langHelper.js';
import validation from '../../../library/validation/validation.js';

export default class jtbcFieldDate extends HTMLElement {
  static get observedAttributes() {
    return ['lang', 'min', 'max', 'value', 'disabled', 'width', 'placeholder'];
  };

  #closePickerTimeout;
  #lang = 'zh-cn';
  #minDate = null;
  #maxDate = null;
  #disabled = false;
  #value = '';

  get name() {
    return this.getAttribute('name');
  };

  get lang() {
    return this.#lang;
  };

  get value() {
    return this.#value;
  };

  get disabled() {
    return this.#disabled;
  };

  set lang(lang) {
    let container = this.container;
    let calendar = container.querySelector('.calendar');
    this.#lang = langHelper.getStandardLang(lang);
    calendar.setAttribute('lang', this.#lang);
  };

  set value(value) {
    let container = this.container;
    if (value.length == 0)
    {
      container.querySelector('input.date').value = this.#value = '';
      this.dispatchEvent(new CustomEvent('changed', {bubbles: true}));
    }
    else if (validation.isDate(value))
    {
      let currentDate = new Date(value);
      value = this.#minDate != null && currentDate < this.#minDate? this.getDateString(this.#minDate): value;
      value = this.#maxDate != null && currentDate > this.#maxDate? this.getDateString(this.#maxDate): value;
      container.querySelector('input.date').value = this.#value = value;
      container.querySelector('.calendar').setAttribute('value', this.#value);
      this.dispatchEvent(new CustomEvent('changed', {bubbles: true}));
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #setZIndex() {
    this.style.setProperty('--z-index', window.getActiveZIndex());
  };

  #unsetZIndex() {
    this.style.removeProperty('--z-index');
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    let date = container.querySelector('input.date');
    let calendar = container.querySelector('.calendar');
    let datepicker = container.querySelector('div.datepicker');
    date.addEventListener('blur', function(){
      let value = this.value;
      if (validation.isDate(value))
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
        that.#unsetZIndex();
        container.classList.remove('pickable');
      };
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
        datepicker.classList.add('on');
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
        this.lang = newVal;
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
        container.querySelector('input.date').setAttribute('placeholder', newVal);
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
      <div class="container" style="display:none"><input type="text" name="date" class="date" /><span class="box"></span><span class="btn"><jtbc-svg name="calendar"></jtbc-svg></span><div class="datepicker"><jtbc-calendar class="calendar" lang="zh-cn"></jtbc-calendar></div><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.container.loadComponents().then(() => { this.#initEvents(); });
  };
};