import Typed from '../../../vendor/typed/typed.esm.min.js';

export default class jtbcTypewriter extends HTMLElement {
  static get observedAttributes() {
    return ['back-speed', 'back-delay', 'show-cursor', 'start-delay', 'type-speed', 'loop', 'strings'];
  };

  #backSpeed = 50;
  #backDelay = 1000;
  #showCursor = false;
  #startDelay = 0;
  #typeSpeed = 50;
  #loop = true;
  #strings = [];
  #instance = null;

  get backSpeed() {
    return this.#backSpeed;
  };

  get backDelay() {
    return this.#backDelay;
  };

  get showCursor() {
    return this.#showCursor;
  };

  get startDelay() {
    return this.#startDelay;
  };

  get typeSpeed() {
    return this.#typeSpeed;
  };

  get loop() {
    return this.#loop;
  };

  get strings() {
    return this.#strings;
  };

  get instance() {
    return this.#instance;
  };

  set backSpeed(backSpeed) {
    this.#backSpeed = isFinite(backSpeed)? Number.parseInt(backSpeed): 50;
  };

  set backDelay(backDelay) {
    this.#backDelay = isFinite(backDelay)? Number.parseInt(backDelay): 1000;
  };

  set showCursor(showCursor) {
    this.#showCursor = (showCursor != 'false'? true: false);
  };

  set startDelay(startDelay) {
    this.#startDelay = isFinite(startDelay)? Number.parseInt(startDelay): 0;
  };

  set typeSpeed(typeSpeed) {
    this.#typeSpeed = isFinite(typeSpeed)? Number.parseInt(typeSpeed): 50;
  };

  set loop(loop) {
    this.#loop = (loop != 'false'? true: false);
  };

  set strings(strings) {
    this.#strings = [];
    try
    {
      let tempArray = JSON.parse(strings);
      if (Array.isArray(tempArray))
      {
        this.#strings = tempArray;
        this.startTyping();
      };
    }
    catch(e) {};
  };

  startTyping() {
    let strings = this.#strings;
    if (this.ready == true && Array.isArray(strings) && strings.length != 0)
    {
      this.#instance = new Typed(this, {'autoInsertCss': false, 'showCursor': this.#showCursor, 'strings': strings, 'backSpeed': this.#backSpeed, 'backDelay': this.#backDelay, 'startDelay': this.#startDelay, 'typeSpeed': this.#typeSpeed, 'loop': this.#loop});
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'back-speed':
      {
        this.backSpeed = newVal;
        break;
      };
      case 'back-delay':
      {
        this.backDelay = newVal;
        break;
      };
      case 'show-cursor':
      {
        this.showCursor = newVal;
        break;
      };
      case 'start-delay':
      {
        this.startDelay = newVal;
        break;
      };
      case 'type-speed':
      {
        this.typeSpeed = newVal;
        break;
      };
      case 'loop':
      {
        this.loop = newVal;
        break;
      };
      case 'strings':
      {
        this.strings = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.startTyping();
  };

  disconnectedCallback() {
    this.instance?.destroy();
  };

  constructor() {
    super();
    this.ready = false;
  };
};