import langHelper from '../../../library/lang/langHelper.js';
import validation from '../../../library/validation/validation.js';

export default class jtbcFieldDatetimeRange extends HTMLElement {
  static get observedAttributes() {
    return ['lang', 'min', 'max', 'value', 'disabled', 'width', 'placeholder_start', 'placeholder_end'];
  };

  #closePickerTimeout;
  #lang = 'zh-cn';
  #value = '';
  #disabled = false;
  #minDate = null;
  #maxDate = null;
  #startDate = null;
  #endDate = null;
  #startDateTime = null;
  #endDateTime = null;

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
    this.#lang = langHelper.getStandardLang(lang);
    this.container.querySelectorAll('.calendar').forEach(calendar => { calendar.setAttribute('lang', this.#lang); });
  };

  set value(value) {
    let container = this.container;
    let startDateValue = '';
    let endDateValue = '';
    let startDatetimeValue = '';
    let endDateTimeValue = '';
    if (this.#isDateTimeRange(value))
    {
      this.#value = value;
      let valueArr = value.split('~');
      startDatetimeValue = valueArr[0];
      endDateTimeValue = valueArr[1];
      startDateValue = startDatetimeValue.split(' ')[0];
      endDateValue = endDateTimeValue.split(' ')[0];
      container.classList.add('loaded');
      this.dispatchEvent(new CustomEvent('changed', {bubbles: true}));
    }
    else
    {
      this.#value = '';
      container.classList.remove('loaded');
      this.dispatchEvent(new CustomEvent('emptied', {bubbles: true}));
    };
    this.#startDate = startDateValue;
    this.#endDate = endDateValue;
    this.#startDateTime = startDatetimeValue;
    this.#endDateTime = endDateTimeValue;
    container.querySelector('input[name=startdatetime]').value = this.#startDateTime;
    container.querySelector('input[name=enddatetime]').value = this.#endDateTime;
    if (this.isComponentInitialized)
    {
      this.#selectTime();
      this.#dateThroughReset();
    };
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #isDateTimeRange(value) {
    let result = false;
    if (value.includes('~'))
    {
      let valueArr = value.split('~');
      if (valueArr.length == 2)
      {
        if (validation.isDateTime(valueArr[0]) && validation.isDateTime(valueArr[1]))
        {
          let startDatetime = new Date(valueArr[0]);
          let endDatetime = new Date(valueArr[1]);
          if (startDatetime <= endDatetime)
          {
            result = true;
          };
          if (this.#minDate != null && startDatetime < this.#minDate)
          {
            result = false;
          };
          if (this.#maxDate != null && endDatetime > this.#maxDate)
          {
            result = false;
          };
        };
      };
    };
    return result;
  };

  #changeValue() {
    let container = this.container;
    let currentStartDate = this.#startDate;
    let currentEndDate = this.#endDate;
    let calendarStartEl = container.querySelector('.calendar_start');
    let calendarEndEl = container.querySelector('.calendar_end');
    if (validation.isDate(currentStartDate) && validation.isDate(currentEndDate))
    {
      const getSelectedTime = calendar => {
        let result = null;
        let timeEl = calendar.parentElement.parentElement.querySelector('div.time');
        if (timeEl != null)
        {
          result = timeEl.querySelector('select.hour').value + ':' + timeEl.querySelector('select.minute').value + ':' + timeEl.querySelector('select.second').value;
        };
        return result;
      };
      this.value = currentStartDate + ' ' + getSelectedTime(calendarStartEl) + '~' + currentEndDate + ' ' + getSelectedTime(calendarEndEl);
    };
  };

  #selectTime() {
    let container = this.container;
    let startDateTime = this.#startDateTime;
    let endDateTime = this.#endDateTime;
    if (validation.isDateTime(startDateTime) && validation.isDateTime(endDateTime))
    {
      let currentStartDateTime = new Date(startDateTime);
      let currentEndDateTime = new Date(endDateTime);
      const prefixZero = num => num >= 10? num: '0' + num;
      container.querySelectorAll('div.time').forEach(el => {
        let currentDateTime = el.parentElement.classList.contains('start')? currentStartDateTime: currentEndDateTime;
        el.querySelector('select.hour').value = prefixZero(currentDateTime.getHours());
        el.querySelector('select.minute').value = prefixZero(currentDateTime.getMinutes());
        el.querySelector('select.second').value = prefixZero(currentDateTime.getSeconds());
      });
    };
  };

  #dateThroughReset(startDate, endDate, confirmed = true) {
    let container = this.container;
    let newStartDate = null, newEndDate = null;
    let calendarStartEl = container.querySelector('.calendar_start');
    let calendarEndEl = container.querySelector('.calendar_end');
    let currentStartDate = this.#startDate;
    let currentEndDate = this.#endDate;
    calendarStartEl.getAllDateElements().forEach(el => el.classList.remove('through'));
    calendarEndEl.getAllDateElements().forEach(el => el.classList.remove('through'));
    if ((validation.isDate(startDate) || validation.isDate(currentStartDate)) && (validation.isDate(endDate) || validation.isDate(currentEndDate)))
    {
      if (validation.isDate(currentStartDate) && validation.isDate(currentEndDate))
      {
        let originalStartDate = new Date(currentStartDate);
        let originalEndDate = new Date(currentEndDate);
        if (validation.isDate(startDate))
        {
          let tempDate = new Date(startDate);
          if (tempDate >= originalEndDate)
          {
            newStartDate = originalStartDate;
            newEndDate = tempDate;
          }
          else
          {
            newStartDate = tempDate;
            newEndDate = originalEndDate;
          };
        }
        else if (validation.isDate(endDate))
        {
          let tempDate = new Date(endDate);
          if (tempDate <= originalStartDate)
          {
            newStartDate = tempDate;
            newEndDate = originalEndDate;
          }
          else
          {
            newStartDate = originalStartDate;
            newEndDate = tempDate;
          };
        }
        else
        {
          newStartDate = originalStartDate;
          newEndDate = originalEndDate;
        };
      }
      else
      {
        newStartDate = new Date(startDate ?? currentStartDate);
        newEndDate = new Date(endDate ?? currentEndDate);
      };
    }
    else if (validation.isDate(startDate))
    {
      if (validation.isDate(currentStartDate))
      {
        let tempDate1 = new Date(startDate);
        let tempDate2 = new Date(currentStartDate);
        if (tempDate1 >= tempDate2)
        {
          newStartDate = tempDate2;
          newEndDate = tempDate1;
        }
        else
        {
          newStartDate = tempDate1;
          newEndDate = tempDate2;
        };
      }
      else if (confirmed === true)
      {
        this.#startDate = startDate;
        calendarStartEl.value = startDate;
      };
    }
    else if (validation.isDate(endDate))
    {
      if (validation.isDate(currentEndDate))
      {
        let tempDate1 = new Date(endDate);
        let tempDate2 = new Date(currentEndDate);
        if (tempDate1 >= tempDate2)
        {
          newStartDate = tempDate2;
          newEndDate = tempDate1;
        }
        else
        {
          newStartDate = tempDate1;
          newEndDate = tempDate2;
        };
      }
      else if (confirmed === true)
      {
        this.#endDate = endDate;
        calendarEndEl.value = endDate;
      };
    };
    if (newStartDate instanceof Date && newEndDate instanceof Date)
    {
      if (newStartDate <= newEndDate)
      {
        calendarStartEl.getAllDateElements().forEach(el => {
          let currentDate = new Date(el.getAttribute('date'));
          if (currentDate >= newStartDate && currentDate <= newEndDate)
          {
            el.classList.add('through');
          };
        });
        calendarEndEl.getAllDateElements().forEach(el => {
          let currentDate = new Date(el.getAttribute('date'));
          if (currentDate >= newStartDate && currentDate <= newEndDate)
          {
            el.classList.add('through');
          };
        });
        if (confirmed === true)
        {
          this.#startDate = this.getDateString(newStartDate);
          this.#endDate = this.getDateString(newEndDate);
          calendarStartEl.value = this.#startDate + ',' + this.#endDate;
          calendarEndEl.value = this.#startDate + ',' + this.#endDate;
        };
      };
    };
  };

  #initCalendar() {
    let container = this.container;
    let today = new Date();
    let nextMonth = null;
    let startMonth = this.getAttribute('start_month');
    let endMonth = this.getAttribute('end_month');
    if (today.getMonth() == 11)
    {
      nextMonth = (today.getFullYear() + 1) + '-01';
    }
    else
    {
      let monthValue = today.getMonth() + 2;
      nextMonth = today.getFullYear() + '-' + (monthValue < 10? '0' + monthValue: monthValue);
    };
    container.querySelectorAll('.calendar').forEach(calendar => {
      if (calendar.getAttribute('mode') == 'start')
      {
        let startTargetDate = startMonth + '-01';
        if (validation.isDate(startTargetDate))
        {
          calendar.render(startTargetDate);
        };
      }
      else
      {
        let endTargetDate = endMonth + '-01';
        calendar.render(validation.isDate(endTargetDate)? endTargetDate: nextMonth + '-01');
      };
      let timeEl = calendar.parentElement.parentElement.querySelector('div.time');
      if (timeEl != null)
      {
        const prefixZero = num => num >= 10? num: '0' + num;
        let hourEl = document.createElement('select');
        hourEl.classList.add('hour');
        for (let i = 0; i < 24; i ++)
        {
          hourEl.options.add(new Option(prefixZero(i), prefixZero(i)));
        };
        timeEl.querySelector('span.hour').innerHTML = hourEl.outerHTML;
        let minuteEl = document.createElement('select');
        minuteEl.classList.add('minute');
        for (let i = 0; i < 60; i ++)
        {
          minuteEl.options.add(new Option(prefixZero(i), prefixZero(i)));
        };
        timeEl.querySelector('span.minute').innerHTML = minuteEl.outerHTML;
        let secondEl = document.createElement('select');
        secondEl.classList.add('second');
        for (let i = 0; i < 60; i ++)
        {
          secondEl.options.add(new Option(prefixZero(i), prefixZero(i)));
        };
        timeEl.querySelector('span.second').innerHTML = secondEl.outerHTML;
      };
    });
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
    let datepicker = container.querySelector('div.datepicker');
    container.querySelectorAll('input.date').forEach(input => {
      input.addEventListener('focus', function() {
        container.querySelector('span.box')?.classList.add('focus');
      });
      input.addEventListener('blur', function() {
        let value = this.value;
        if (validation.isDateTime(value))
        {
          let calendarEl = null;
          let valueArr = value.split(' ');
          let timeArr = valueArr[1].split(':');
          if (this.getAttribute('mode') == 'start')
          {
            that.#startDate = valueArr[0];
            calendarEl = container.querySelector('.calendar_start');
          }
          else
          {
            that.#endDate = valueArr[0];
            calendarEl = container.querySelector('.calendar_end');
          };
          if (calendarEl != null)
          {
            let timeEl = calendarEl.parentElement.parentElement.querySelector('div.time');
            if (timeEl != null)
            {
              timeEl.querySelector('select.hour').value = timeArr[0];
              timeEl.querySelector('select.minute').value = timeArr[1];
              timeEl.querySelector('select.second').value = timeArr[2];
            };
          };
          that.#changeValue();
        }
        else
        {
          that.value = '';
        };
        container.querySelector('span.box')?.classList.remove('focus');
      });
    });
    container.querySelectorAll('.calendar').forEach(calendar => {
      calendar.addEventListener('dateclick', e => {
        if (e.target.getAttribute('mode') == 'start')
        {
          that.#dateThroughReset(e.detail.date, null);
        }
        else
        {
          that.#dateThroughReset(null, e.detail.date);
        };
      });
      calendar.addEventListener('datedblclick', e => {
        that.#changeValue();
        datepicker.classList.remove('on');
      });
      calendar.addEventListener('datemouseover', e => {
        if (e.target.getAttribute('mode') == 'start')
        {
          that.#dateThroughReset(e.detail.date, null, false);
        }
        else
        {
          that.#dateThroughReset(null, e.detail.date, false);
        };
      });
      calendar.addEventListener('datemouseout', e => { that.#dateThroughReset(); });
      calendar.addEventListener('renderend', e => {
        if (e.target.ready)
        {
          that.#dateThroughReset();
        };
      });
    });
    datepicker.addEventListener('mouseenter', function() {
      clearTimeout(that.#closePickerTimeout);
    });
    datepicker.addEventListener('mouseleave', function() {
      if (this.classList.contains('on'))
      {
        that.closePicker(1000);
      };
    });
    datepicker.addEventListener('transitionend', function() {
      if (!this.classList.contains('on'))
      {
        that.#unsetZIndex();
        container.classList.remove('pickable');
      };
    });
    container.delegateEventListener('span.btn.delete', 'click', function() {
      that.value = '';
    });
    container.delegateEventListener('span.btn.select', 'click', function() {
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
        if (validation.isDate(that.#startDate))
        {
          datepicker.querySelector('jtbc-calendar[mode=start]').render(that.#startDate);
        };
        if (validation.isDate(that.#endDate))
        {
          datepicker.querySelector('jtbc-calendar[mode=end]').render(that.#endDate);
        };
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
    switch(attr) {
      case 'lang':
      {
        this.lang = newVal;
        break;
      };
      case 'min':
      {
        this.#minDate = new Date(newVal);
        container.querySelector('.calendar_start')?.setAttribute('min', newVal);
        break;
      };
      case 'max':
      {
        this.#maxDate = new Date(newVal);
        container.querySelector('.calendar_end')?.setAttribute('max', newVal);
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
        container.querySelector('input[name=startdatetime]')?.setAttribute('placeholder', newVal);
        break;
      };
      case 'placeholder_end':
      {
        container.querySelector('input[name=enddatetime]')?.setAttribute('placeholder', newVal);
        break;
      };
    };
  };

  connectedCallback() {
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
      <div class="container" style="display:none">
        <div class="input">
          <span class="date"><input type="text" name="startdatetime" class="date" mode="start" autocomplete="off" /></span>
          <span class="separator">~</span>
          <span class="date"><input type="text" name="enddatetime" class="date" mode="end" autocomplete="off" /></span>
        </div>
        <span class="box"></span>
        <span class="btn delete"><jtbc-svg name="close_small"></jtbc-svg></span>
        <span class="btn select"><jtbc-svg name="calendar"></jtbc-svg></span>
        <div class="datepicker">
          <div class="start">
            <div><jtbc-calendar class="calendar calendar_start" mode="start" lang="zh-cn"></jtbc-calendar></div>
            <div class="time"><span class="item hour"></span><span class="item minute"></span><span class="item second"></span></div>
          </div>
          <div class="end">
            <div><jtbc-calendar class="calendar calendar_end" mode="end" lang="zh-cn"></jtbc-calendar></div>
            <div class="time"><span class="item hour"></span><span class="item minute"></span><span class="item second"></span></div>
          </div>
        </div>
        <div class="mask"></div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.container.loadComponents().then(() => {
      this.#initCalendar();
      this.#selectTime();
      this.#dateThroughReset();
      this.isComponentInitialized = true;
    });
  };
};