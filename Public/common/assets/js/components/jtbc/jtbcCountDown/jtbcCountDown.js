export default class jtbcCountDown extends HTMLElement {
  static get observedAttributes() {
    return ['target', 'autoplay'];
  };

  #target = null;
  #autoplay = true;
  #played = false;
  #playing = false;
  #interval = null;
  #currentSecond = null;

  get autoplay() {
    return this.#autoplay;
  };

  get played() {
    return this.#played;
  };

  get playing() {
    return this.#playing;
  };

  get target() {
    return this.#target;
  };

  set target(target) {
    if (this.#isDateTime(target))
    {
      this.#played = false;
      this.#target = target;
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  #autoPlay() {
    if (this.autoplay === true && this.played === false && this.playing === false)
    {
      if (this.inViewport())
      {
        this.play();
      };
    };
  };

  #initEvents() {
    window.addEventListener('scroll', e => this.#autoPlay());
  };

  #isDateTime(datetime)
  {
    let result = false;
    let date = new Date(datetime);
    let dateRegExp = /^(\d{4})\-(\d{2})\-(\d{2})\s+(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;
    if (date instanceof Date && !isNaN(date.getTime()) && dateRegExp.test(datetime))
    {
      result = true;
    };
    return result;
  };

  #run() {
    this.refresh();
    if (this.played == false)
    {
      this.#interval = setInterval(() => this.refresh(), 500);
    };
  };

  play() {
    if (this.#playing === false)
    {
      this.#playing = true;
      this.#run();
    };
  };

  refresh() {
    let currentTime = new Date();
    let value = {'days': 0, 'hours': 0, 'minutes': 0, 'seconds': 0};
    let milliseconds = {'day': 86400000, 'hour': 3600000, 'minute': 60000, 'second': 1000};
    let targetTime = this.target == null? null: new Date(this.target);
    if (targetTime != null)
    {
      if (targetTime > currentTime)
      {
        let surplus = targetTime - currentTime;
        value.days = Math.floor(surplus / milliseconds.day);
        surplus -= value.days * milliseconds.day;
        value.hours = Math.floor(surplus / milliseconds.hour);
        surplus -= value.hours * milliseconds.hour;
        value.minutes = Math.floor(surplus / milliseconds.minute);
        surplus -= value.minutes * milliseconds.minute;
        value.seconds = Math.floor(surplus / milliseconds.second);
        if (this.#currentSecond != value.seconds)
        {
          this.#currentSecond = value.seconds;
          this.dispatchEvent(new CustomEvent('changed', {detail: {'value': value}, bubbles: true}));
        };
      }
      else
      {
        this.#played = true;
        this.stop();
        this.dispatchEvent(new CustomEvent('timesup', {bubbles: true}));
      };
      this.container.style.display = 'block';
      this.container.querySelector('slot').assignedElements({flatten: true}).forEach(el => {
        if (el.hasAttribute('field'))
        {
          let currentField = el.getAttribute('field');
          if (value.hasOwnProperty(currentField))
          {
            el.setAttribute('data-' + currentField, value[currentField]);
            el.querySelectorAll('em').forEach(em => em.innerText = value[currentField]);
          };
        }
        else
        {
          ['days', 'hours', 'minutes', 'seconds'].forEach(item => {
            el.querySelectorAll('*[field=' + item + ']').forEach(fel => {
              if (value.hasOwnProperty(item))
              {
                fel.setAttribute('data-' + item, value[item]);
                fel.querySelectorAll('em').forEach(em => em.innerText = value[item]);
              };
            });
          });
        };
      });
    };
  };

  stop() {
    this.#playing = false;
    clearInterval(this.#interval);
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'target':
      {
        this.target = newVal;
      };
      case 'autoplay':
      {
        this.#autoplay = newVal.trim().toLowerCase() == 'false'? false: true;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#autoPlay();
    this.#initEvents();
  };

  constructor() {
    super();
    this.ready = false;
    let shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.innerHTML = `<div class="container" style="display:none"><slot><span field="days"><em></em> days, </span><span field="hours"><em></em> hours, </span><span field="minutes"><em></em> minutes, </span><span field="seconds"><em></em> seconds.</span></slot></div>`;
    this.container = shadowRoot.querySelector('div.container');
  };
};