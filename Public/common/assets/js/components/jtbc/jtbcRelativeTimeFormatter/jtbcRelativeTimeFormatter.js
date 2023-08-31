import langHelper from '../../../library/lang/langHelper.js';

export default class jtbcRelativeTimeFormatter extends HTMLElement {
  static get observedAttributes() {
    return ['now', 'lang', 'value'];
  };

  #lang = 'zh-cn';
  #value = null;
  #now = null;
  #text = {
    'zh-cn': {'current': '\u73b0\u5728', 'before': {'second': '\u79d2\u524d', 'minute': '\u5206\u949f\u524d', 'hour': '\u5c0f\u65f6\u524d', 'day': '\u5929\u524d', 'week': '\u5468\u524d', 'month': '\u6708\u524d', 'year': '\u5e74\u524d'}, 'after': {'second': '\u79d2\u540e', 'minute': '\u5206\u949f\u540e', 'hour': '\u5c0f\u65f6\u540e', 'day': '\u5929\u540e', 'week': '\u5468\u540e', 'month': '\u6708\u540e', 'year': '\u5e74\u540e'},
    },
    'en': {'current': 'now', 'before': {'second': 'second(s) ago', 'minute': 'minute(s) ago', 'hour': 'hour(s) ago', 'day': 'day(s) ago', 'week': 'week(s) ago', 'month': 'month(s) ago', 'year': 'year(s) ago'}, 'after': {'second': 'second(s) later', 'minute': 'minute(s) later', 'hour': 'hour(s) later', 'day': 'day(s) later', 'week': 'week(s) later', 'month': 'month(s) later', 'year': 'year(s) later'},
    },
  };

  get now() {
    let result = new Date();
    if (this.#now != null)
    {
      let current = new Date(this.#now);
      if (!Number.isNaN(current.getTime()))
      {
        result = current;
      };
    };
    return result;
  };

  get lang() {
    return this.#lang;
  };

  get value() {
    return this.#value;
  };

  set now(now) {
    this.#now = now;
    this.format();
  };

  set lang(lang) {
    this.#lang = langHelper.getStandardLang(lang);
    this.format();
  };

  set value(value) {
    this.#value = value;
    this.format();
  };

  #getText() {
    return this.#text[this.#lang] ?? null;
  };

  #getRelativeTime(time) {
    let result = '';
    let current = this.now;
    let diff = time - current;
    let text = this.#getText();
    let milliseconds = {'year': 31536000000, 'month': 2592000000, 'week': 604800000, 'day': 86400000, 'hour': 3600000, 'minute': 60000, 'second': 1000};
    if (text != null)
    {
      let absDiff = Math.abs(diff);
      let type = diff < 0? 'before': 'after';
      if (absDiff < milliseconds.second)
      {
        result = text.current;
      }
      else if (absDiff < milliseconds.minute)
      {
        result = Math.floor(absDiff / milliseconds.second) + String.fromCharCode(32) + text[type]['second'];
      }
      else if (absDiff < milliseconds.hour)
      {
        result = Math.floor(absDiff / milliseconds.minute) + String.fromCharCode(32) + text[type]['minute'];
      }
      else if (absDiff < milliseconds.day)
      {
        result = Math.floor(absDiff / milliseconds.hour) + String.fromCharCode(32) + text[type]['hour'];
      }
      else if (absDiff < milliseconds.week)
      {
        result = Math.floor(absDiff / milliseconds.day) + String.fromCharCode(32) + text[type]['day'];
      }
      else if (absDiff < milliseconds.month)
      {
        result = Math.floor(absDiff / milliseconds.week) + String.fromCharCode(32) + text[type]['week'];
      }
      else if (absDiff < milliseconds.year)
      {
        result = Math.floor(absDiff / milliseconds.month) + String.fromCharCode(32) + text[type]['month'];
      }
      else
      {
        result = Math.floor(absDiff / milliseconds.year) + String.fromCharCode(32) + text[type]['year'];
      };
    };
    return result;
  };

  format() {
    if (this.ready == true && this.value != null)
    {
      let time = new Date(this.value);
      if (!Number.isNaN(time.getTime()))
      {
        this.innerText = this.#getRelativeTime(time);
      };
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'now':
      {
        this.now = newVal;
        break;
      };
      case 'lang':
      {
        this.lang = newVal;
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
    this.ready = true;
    this.format();
  };

  constructor() {
    super();
    this.ready = false;
  };
};