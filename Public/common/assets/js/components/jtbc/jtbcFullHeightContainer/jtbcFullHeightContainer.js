export default class jtbcFullHeightContainer extends HTMLElement {
  static get observedAttributes() {
    return ['offset', 'min-height', 'max-height'];
  };

  #offset = 0;
  #height = null;
  #minHeight = null;
  #maxHeight = null;

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
    this.resizeObserver = new ResizeObserver(entries => this.setHeight());
    this.resizeObserver.observe(document.documentElement);
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
  };

  disconnectedCallback() {
    this.resizeObserver.disconnect();
  };

  constructor() {
    super();
    this.ready = false;
    this.setHeight();
    this.#initEvents();
  };
};