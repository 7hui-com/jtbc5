import langHelper from '../../../library/lang/langHelper.js';
import validation from '../../../library/validation/validation.js';

export default class jtbcCalendar extends HTMLElement {
  static get observedAttributes() {
    return ['lang', 'min', 'max', 'value'];
  };

  #lang = 'zh-cn';
  #minYear = 1000;
  #minDate = null;
  #maxDate = null;
  #selectedDays = null;
 
  get lang() {
    return this.#lang;
  };

  get value() {
    let result = '';
    if (this.#selectedDays != null)
    {
      let valueArr = [];
      let selectedDays = this.#selectedDays.split(',');
      selectedDays.forEach(date => {
        if (validation.isDate(date))
        {
          valueArr.push(date);
        };
      });
      result = valueArr.join(',');
    };
    return result;
  };

  set lang(lang) {
    this.#lang = langHelper.getStandardLang(lang);
    this.textReset();
  };

  set value(value) {
    this.selectDays(value);
  };

  #getText() {
    let text = {
      'zh-cn': {'year':'\u5e74','month':['1\u6708','2\u6708','3\u6708','4\u6708','5\u6708','6\u6708','7\u6708','8\u6708','9\u6708','10\u6708','11\u6708','12\u6708'],'monday':'\u4e00','tuesday':'\u4e8c','wednesday':'\u4e09','thursday':'\u56db','friday':'\u4e94','saturday':'\u516d','sunday':'\u65e5'},
      'en': {'year': '','month':['Jan.','Feb.','Mar.','Apr.','May.','Jun.','Jul.','Aug.','Sept.','Oct.','Nov.','Dec.'],'monday': 'MO','tuesday': 'TU','wednesday': 'WE','thursday': 'TH','friday': 'FR','saturday': 'SA','sunday': 'SU',},
    };
    return text[this.#lang];
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    container.delegateEventListener('div.calendar span.date', 'click', function(){
      if (!this.classList.contains('disabled'))
      {
        that.dispatchEvent(new CustomEvent('dateclick', {detail: {date: this.getAttribute('date')}, bubbles: true}));
      };
    });
    container.delegateEventListener('div.calendar span.date', 'dblclick', function(){
      if (!this.classList.contains('disabled'))
      {
        that.dispatchEvent(new CustomEvent('datedblclick', {detail: {date: this.getAttribute('date')}, bubbles: true}));
      };
    });
    container.delegateEventListener('div.calendar span.date', 'mouseover', function(){
      if (!this.classList.contains('disabled'))
      {
        that.dispatchEvent(new CustomEvent('datemouseover', {detail: {date: this.getAttribute('date')}, bubbles: true}));
      };
    });
    container.delegateEventListener('div.calendar span.date', 'mouseout', function(){
      if (!this.classList.contains('disabled'))
      {
        that.dispatchEvent(new CustomEvent('datemouseout', {detail: {date: this.getAttribute('date')}, bubbles: true}));
      };
    });
    container.delegateEventListener('div.calendar em.prev', 'click', function(){
      let currentTargetDate = that.currentTargetDate;
      let currentYear = currentTargetDate.getFullYear();
      let currentMonth = currentTargetDate.getMonth() + 1;
      if (this.getAttribute('mode') == 'year')
      {
        currentYear -= 1;
      }
      else
      {
        currentMonth -= 1;
        if (currentMonth == 0)
        {
          currentMonth = 12;
          currentYear -= 1;
        };
      };
      that.render(currentYear + '-' + currentMonth + '-1');
    });
    container.delegateEventListener('div.calendar em.next', 'click', function(){
      let currentTargetDate = that.currentTargetDate;
      let currentYear = currentTargetDate.getFullYear();
      let currentMonth = currentTargetDate.getMonth() + 1;
      if (this.getAttribute('mode') == 'year')
      {
        currentYear += 1;
      }
      else
      {
        currentMonth += 1;
        if (currentMonth == 13)
        {
          currentMonth = 1;
          currentYear += 1;
        };
      };
      that.render(currentYear + '-' + currentMonth + '-1');
    });
    container.delegateEventListener('div.calendar em.year', 'click', function(){
      let calendar = container.querySelector('div.calendar');
      let yearSelector = container.querySelector('div.yearSelector');
      yearSelector.setAttribute('date', that.getDateString(that.currentTargetDate));
      yearSelector.dispatchEvent(new CustomEvent('loaddata', {bubbles: true}));
      calendar.classList.remove('on');
      yearSelector.classList.add('on');
    });
    container.delegateEventListener('div.calendar em.month', 'click', function(){
      let calendar = container.querySelector('div.calendar');
      let monthSelector = container.querySelector('div.monthSelector');
      monthSelector.setAttribute('date', that.getDateString(that.currentTargetDate));
      monthSelector.dispatchEvent(new CustomEvent('loaddata', {bubbles: true}));
      calendar.classList.remove('on');
      monthSelector.classList.add('on');
    });
    container.delegateEventListener('div.yearSelector', 'loaddata', function(){
      let text = that.#getText();
      let mainEl = this.querySelector('div.main').empty();
      let targetDate = new Date(this.getAttribute('date'));
      let currentYear = targetDate.getFullYear();
      let startYear = currentYear;
      while(startYear % 10 !== 0) startYear -= 1;
      let endYear = startYear + 9;
      this.querySelector('span.text').innerText = startYear + text.year + ' ~ ' + endYear + text.year;
      for (let year = startYear; year <= endYear; year ++)
      {
        let newSpanYear = document.createElement('span');
        newSpanYear.classList.add('year');
        newSpanYear.setAttribute('year', year);
        if (that.currentTargetDate.getFullYear() == year)
        {
          newSpanYear.classList.add('on');
        };
        newSpanYear.innerText = year;
        mainEl.append(newSpanYear);
      };
    });
    container.delegateEventListener('div.yearSelector em.prev', 'click', function(){
      let selector = container.querySelector('div.yearSelector');
      if (selector != null && selector.hasAttribute('date'))
      {
        let currentDate = new Date(selector.getAttribute('date'));
        currentDate.setFullYear(Math.max(currentDate.getFullYear() - 10, that.#minYear));
        selector.setAttribute('date', that.getDateString(currentDate));
        selector.dispatchEvent(new CustomEvent('loaddata', {bubbles: true}));
      };
    });
    container.delegateEventListener('div.yearSelector em.next', 'click', function(){
      let selector = container.querySelector('div.yearSelector');
      if (selector != null && selector.hasAttribute('date'))
      {
        let currentDate = new Date(selector.getAttribute('date'));
        currentDate.setFullYear(currentDate.getFullYear() + 10);
        selector.setAttribute('date', that.getDateString(currentDate));
        selector.dispatchEvent(new CustomEvent('loaddata', {bubbles: true}));
      };
    });
    container.delegateEventListener('div.yearSelector span.year', 'click', function(){
      let selector = container.querySelector('div.yearSelector');
      let monthSelector = container.querySelector('div.monthSelector');
      if (selector != null && monthSelector != null)
      {
        selector.classList.remove('on');
        monthSelector.setAttribute('date', this.getAttribute('year') + '-1-1');
        monthSelector.dispatchEvent(new CustomEvent('loaddata', {bubbles: true}));
        monthSelector.classList.add('on');
      };
    });
    container.delegateEventListener('div.monthSelector', 'loaddata', function(){
      let text = that.#getText();
      let mainEl = this.querySelector('div.main').empty();
      let targetDate = new Date(this.getAttribute('date'));
      let currentYear = targetDate.getFullYear();
      let currentMonth = targetDate.getMonth() + 1;
      let currentMonthIndex = 1;
      this.querySelector('span.text').innerText = currentYear + text.year;
      text.month.forEach(item => {
        let newSpanMonth = document.createElement('span');
        newSpanMonth.classList.add('month');
        newSpanMonth.setAttribute('month', currentMonthIndex);
        if (that.currentTargetDate.getFullYear() == currentYear && currentMonthIndex == currentMonth)
        {
          newSpanMonth.classList.add('on');
        };
        newSpanMonth.innerText = item;
        mainEl.append(newSpanMonth);
        currentMonthIndex += 1;
      });
    });
    container.delegateEventListener('div.monthSelector em.prev', 'click', function(){
      let selector = container.querySelector('div.monthSelector');
      if (selector != null && selector.hasAttribute('date'))
      {
        let currentDate = new Date(selector.getAttribute('date'));
        currentDate.setFullYear(Math.max(currentDate.getFullYear() - 1, that.#minYear));
        selector.setAttribute('date', that.getDateString(currentDate));
        selector.dispatchEvent(new CustomEvent('loaddata', {bubbles: true}));
      };
    });
    container.delegateEventListener('div.monthSelector em.next', 'click', function(){
      let selector = container.querySelector('div.monthSelector');
      if (selector != null && selector.hasAttribute('date'))
      {
        let currentDate = new Date(selector.getAttribute('date'));
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        selector.setAttribute('date', that.getDateString(currentDate));
        selector.dispatchEvent(new CustomEvent('loaddata', {bubbles: true}));
      };
    });
    container.delegateEventListener('div.monthSelector span.month', 'click', function(){
      let calendar = container.querySelector('div.calendar');
      let selector = container.querySelector('div.monthSelector');
      if (calendar != null && selector != null && selector.hasAttribute('date'))
      {
        selector.classList.remove('on');
        let currentDate = new Date(selector.getAttribute('date'));
        that.render(currentDate.getFullYear() + '-' + this.getAttribute('month') + '-1');
        calendar.classList.add('on');
      };
    });
  };

  resetStatus() {
    let calendar = this.container.querySelector('div.calendar');
    calendar.querySelectorAll('div.main span.date').forEach(el => {
      let currentDateDisabled = false;
      let currentDate = new Date(el.getAttribute('date'));
      if (this.#minDate != null && currentDate < this.#minDate)
      {
        currentDateDisabled = true;
      }
      else if (this.#maxDate != null && currentDate > this.#maxDate)
      {
        currentDateDisabled = true;
      };
      if (currentDateDisabled === true)
      {
        el.classList.add('disabled');
      }
      else
      {
        el.classList.remove('disabled');
      };
    });
    this.selectDays();
  };

  getAllDateElements() {
    let result = [];
    this.container.querySelectorAll('span.date').forEach(el => { result.push(el); });
    return result;
  };

  getDateString(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let monthString = month < 10? '0' + month: month;
    let dayString = day < 10? '0' + day: day;
    return year + '-' + monthString + '-' + dayString;
  };

  selectDays(days) {
    if (days != null)
    {
      this.#selectedDays = days;
    };
    if (this.#selectedDays != null)
    {
      let container = this.container;
      let selectedDays = this.#selectedDays.split(',');
      container.querySelectorAll('span.date').forEach(el => {
        if (selectedDays.includes(el.getAttribute('date')))
        {
          el.classList.add('selected');
        }
        else
        {
          el.classList.remove('selected');
        };
      });
    };
  };

  render(targetDate) {
    let today = new Date();
    let calendar = this.container.querySelector('div.calendar');
    let text = this.#getText();
    let main = calendar.querySelector('div.main');
    let date = new Date(targetDate ?? this.value);
    let isDate = date instanceof Date && !isNaN(date.getTime());
    if (isDate == false) date = new Date();
    let currentYear = date.getFullYear();
    let currentMonth = date.getMonth();
    if (currentYear < this.#minYear)
    {
      date.setFullYear(this.#minYear);
      date.setMonth(0);
      date.setDate(1);
    };
    this.currentTargetDate = new Date(date.valueOf());
    calendar.querySelector('div.title span.text em.year').innerText = currentYear + text.year;
    calendar.querySelector('div.title span.text em.month').innerText = text.month[currentMonth];
    const getFirstDate = (date) => {
      while (date.getDay() != 1 || date.getMonth() == currentMonth)
      {
        date.setDate(date.getDate() - 1);
      };
      return date;
    };
    let firstDate = getFirstDate(date);
    let newMain = document.createElement('div');
    newMain.classList.add('main');
    for (let i = 0; i < 42; i ++)
    {
      let currentDate = new Date(firstDate.valueOf());
      currentDate.setDate(firstDate.getDate() + i);
      let dateItem = document.createElement('span');
      dateItem.classList.add('date');
      dateItem.setAttribute('date', this.getDateString(currentDate));
      dateItem.innerHTML = '<em>' + currentDate.getDate() + '</em>';
      if (currentDate.getMonth() != currentMonth)
      {
        dateItem.classList.add('dim');
      }
      else
      {
        if (this.getDateString(today) == this.getDateString(currentDate))
        {
          dateItem.classList.add('today');
        };
      };
      newMain.append(dateItem);
    };
    main.replaceWith(newMain);
    this.resetStatus();
    this.dispatchEvent(new CustomEvent('renderend', {detail: {date: this.getDateString(this.currentTargetDate)}}));
  };

  textReset() {
    let text = this.#getText();
    let container = this.container;
    container.querySelector('.textMonday').innerText = text.monday;
    container.querySelector('.textTuesday').innerText = text.tuesday;
    container.querySelector('.textWednesday').innerText = text.wednesday;
    container.querySelector('.textThursday').innerText = text.thursday;
    container.querySelector('.textFriday').innerText = text.friday;
    container.querySelector('.textSaturday').innerText = text.saturday;
    container.querySelector('.textSunday').innerText = text.sunday;
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'lang':
      {
        this.lang = newVal;
        this.textReset();
        break;
      };
      case 'min':
      {
        this.#minDate = new Date(newVal);
        this.resetStatus();
        break;
      };
      case 'max':
      {
        this.#maxDate = new Date(newVal);
        this.resetStatus();
        break;
      };
      case 'value':
      {
        this.value = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.render();
    this.#initEvents();
    this.ready = true;
  };

  constructor() {
    super();
    this.ready = false;
    this.currentTargetDate = null;
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let text = this.#getText();
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <container style="display:none">
        <div class="box calendar on">
          <div class="title">
            <span class="icons iconsLeft"><em class="prev prevYear" mode="year"><jtbc-svg name="arrow_double"></jtbc-svg></em><em class="prev prevDay" mode="day"><jtbc-svg name="arrow_single"></jtbc-svg></em></span>
            <span class="text"><em class="year"></em><em class="month"></em></span>
            <span class="icons iconsRight"><em class="next nextDay" mode="day"><jtbc-svg name="arrow_single"></jtbc-svg></em><em class="next nextYear" mode="year"><jtbc-svg name="arrow_double"></jtbc-svg></em></span>
          </div>
          <div class="header"><em class="monday textMonday">${text.monday}</em><em class="tuesday textTuesday">${text.tuesday}</em><em class="wednesday textWednesday">${text.wednesday}</em><em class="thursday textThursday">${text.thursday}</em><em class="friday textFriday">${text.friday}</em><em class="saturday textSaturday">${text.saturday}</em><em class="sunday textSunday">${text.sunday}</em></div>
          <div class="main"></div>
        </div>
        <div class="box yearSelector">
          <div class="title">
            <span class="icons iconsLeft"><em class="prev prevYear" mode="year"><jtbc-svg name="arrow_double"></jtbc-svg></em></span>
            <span class="text"></span>
            <span class="icons iconsRight"><em class="next nextYear" mode="year"><jtbc-svg name="arrow_double"></jtbc-svg></em></span>
          </div>
          <div class="main"></div>
        </div>
        <div class="box monthSelector">
          <div class="title">
            <span class="icons iconsLeft"><em class="prev prevYear" mode="year"><jtbc-svg name="arrow_double"></jtbc-svg></em></span>
            <span class="text"></span>
            <span class="icons iconsRight"><em class="next nextYear" mode="year"><jtbc-svg name="arrow_double"></jtbc-svg></em></span>
          </div>
          <div class="main"></div>
        </div>
      </container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.container = shadowRoot.querySelector('container');
    this.container.loadComponents();
  };
};