export default class jtbcJumper extends HTMLElement {
  static get observedAttributes() {
    return ['offset'];
  };

  #offset = 0;

  get offset() {
    return this.#offset;
  };

  #initEvents() {
    this.addEventListener('click', e => {
      let target = e.target.getTarget();
      if (target instanceof Element)
      {
        let targetTop = target.offsetTop + this.offset;
        window.scrollTo({'behavior': 'smooth', 'top': Math.max(0, targetTop)});
      };
    });
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
  };

  constructor() {
    super();
    this.ready = false;
    this.#initEvents();
  };
};