export default class jtbcCountUp extends HTMLElement {
  static get observedAttributes() {
    return ['start', 'end', 'delay', 'duration', 'divisor', 'separator', 'autoplay'];
  };

  #current = 0;
  #start = 0;
  #end = null;
  #delay = 0;
  #duration = 3000;
  #divisor = 1;
  #separator = ',';
  #autoplay = true;
  #played = false;
  #playing = false;

  get current() {
    return this.#current;
  };

  get autoplay() {
    return this.#autoplay;
  };

  get played() {
    return this.#played;
  };

  get playing() {
    return this.#playing;
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

  #run() {
    let that = this;
    let startNumber = this.#start;
    let endNumber = this.#end;
    if (Number.isInteger(startNumber) && Number.isInteger(endNumber))
    {
      if (startNumber != endNumber)
      {
        let duration = this.#duration;
        let startStamp = new Date().getTime();
        const easeOutQuint = (x, t, b, c, d) => c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        const run = function() {
          let currentStamp = new Date().getTime();
          let stampGap = currentStamp - startStamp;
          if (stampGap < duration)
          {
            let currentNumber = easeOutQuint(stampGap / duration, stampGap, startNumber, endNumber - startNumber, duration);
            that.#current = startNumber < endNumber? Math.min(endNumber, currentNumber): Math.max(endNumber, currentNumber);
            requestAnimationFrame(run);
          }
          else
          {
            that.#played = true;
            that.#playing = false;
            that.#current = endNumber;
          };
          that.#setText();
        };
        requestAnimationFrame(run);
      }
      else
      {
        this.#playing = false;
      };
    }
    else
    {
      this.#playing = false;
    };
  };

  #setText() {
    let realNumber = Math.round(this.#current) / this.#divisor;
    let realNumberArray = realNumber.toString().split('.');
    realNumberArray[0] = realNumberArray[0].replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), '$1' + this.#separator);
    this.innerText = realNumberArray.join('.');
  };

  #initEvents() {
    window.addEventListener('scroll', e => this.#autoPlay());
  };

  play() {
    if (this.#playing === false)
    {
      this.#playing = true;
      if (this.#delay == 0)
      {
        this.#run();
      }
      else
      {
        setTimeout(() => {
          this.#run();
        }, this.#delay);
      };
    };
  };

  update(target) {
    if (isFinite(target))
    {
      this.#end = Number.parseInt(target);
      if (this.#playing === false)
      {
        this.#start = this.current ?? this.#start;
        this.play();
      };
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'start':
      {
        this.#start = isFinite(newVal)? Number.parseInt(newVal): 0;
        break;
      };
      case 'end':
      {
        this.#end = isFinite(newVal)? Number.parseInt(newVal): null;
        break;
      };
      case 'delay':
      {
        this.#delay = isFinite(newVal)? Number.parseInt(newVal): 0;
        break;
      };
      case 'duration':
      {
        this.#duration = isFinite(newVal)? Number.parseInt(newVal): 3000;
        break;
      };
      case 'divisor':
      {
        this.#divisor = isFinite(newVal)? Number.parseInt(newVal): 1;
        break;
      };
      case 'separator':
      {
        this.#separator = newVal;
        break;
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
  };
};