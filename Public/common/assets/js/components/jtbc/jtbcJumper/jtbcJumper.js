export default class jtbcJumper extends HTMLElement {
  static get observedAttributes() {
    return ['offset'];
  };

  #offset = 0;
  #isEventInitialized = false;

  get offset() {
    return this.#offset;
  };

  #isFirstInitEvent() {
    let result = false;
    if (this.#isEventInitialized === false)
    {
      result = this.#isEventInitialized = true;
    };
    return result;
  };

  #initEvents() {
    if (this.#isFirstInitEvent())
    {
      this.addEventListener('click', e => {
        let target = e.target.getTarget();
        if (target instanceof Element)
        {
          let targetTop = target.offsetTop + this.offset;
          window.scrollTo({'behavior': 'smooth', 'top': Math.max(0, targetTop)});
        };
      });
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'offset':
      {
        this.#offset = isFinite(newVal)? Number.parseInt(newVal): 0;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#initEvents();
  };

  constructor() {
    super();
    this.ready = false;
  };
};