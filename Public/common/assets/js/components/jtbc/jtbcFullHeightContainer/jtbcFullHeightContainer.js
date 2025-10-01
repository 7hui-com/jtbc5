export default class jtbcFullHeightContainer extends HTMLElement {
  static get observedAttributes() {
    return ['offset', 'min-height', 'max-height'];
  };

  #offset = 0;
  #height = null;
  #minHeight = null;
  #maxHeight = null;
  #resizeObserver = null;

  get offset() {
    return this.#offset;
  };

  get height() {
    return this.#height;
  };

  get minHeight() {
    return this.#minHeight;
  };

  get maxHeight() {
    return this.#maxHeight;
  };

  #initEvents() {
    this.#resizeObserver = () => this.setHeight();
    window.addEventListener('resize', this.#resizeObserver);
  };

  setHeight() {
    this.style.height = (document.documentElement.clientHeight + this.offset) + 'px';
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'offset':
      {
        this.#offset = isFinite(newVal)? Number.parseInt(newVal): 0;
        break;
      };
      case 'min-height':
      {
        if (isFinite(newVal))
        {
          this.#minHeight = Number.parseInt(newVal);
          this.style.minHeight = this.minHeight + 'px';
        };
        break;
      };
      case 'max-height':
      {
        if (isFinite(newVal))
        {
          this.#maxHeight = Number.parseInt(newVal);
          this.style.maxHeight = this.maxHeight + 'px';
        };
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#initEvents();
  };

  disconnectedCallback() {
    window.removeEventListener('resize', this.#resizeObserver);
  };

  constructor() {
    super();
    this.ready = false;
    this.setHeight();
  };
};