export default class jtbcAnchor extends HTMLAnchorElement {
  static get observedAttributes() {
    return ['href'];
  };

  #href = null;
  #isEventInitialized = false;

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
      this.addEventListener('click', e => this.gotoLink(e));
    };
  };

  gotoLink(e) {
    e.preventDefault();
    let href = this.#href;
    let target = this.getTarget();
    if (href != null)
    {
      if (href.length != 0)
      {
        target.href = href;
      };
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'href':
      {
        this.#href = newVal;
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