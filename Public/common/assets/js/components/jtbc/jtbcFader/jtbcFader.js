export default class jtbcFader extends HTMLElement {
  static get observedAttributes() {
    return ['duplex', 'gap'];
  };

  #gap = 100;
  #duplex = false;
  #handler = null;

  get gap() {
    return this.#gap;
  };

  get duplex() {
    return this.#duplex;
  };

  #startMonitor() {
    let index = 0;
    this.querySelectorAll('[fade]').forEach(el => {
      if (el.dataset.faded == undefined)
      {
        console.log(el.inViewport());
        if (el.inViewport())
        {
          el.dataset.faded = 'true';
          if (index == 0)
          {
            el.setAttribute('fade', 'in');
          }
          else
          {
            setTimeout(() => el.setAttribute('fade', 'in'), this.gap * index);
          };
          index += 1;
        };
      }
      else
      {
        if (this.duplex === true)
        {
          if (!el.inViewport())
          {
            delete el.dataset.faded;
            el.setAttribute('fade', 'out');
          };
        };
      };
    });
    this.#handler = requestAnimationFrame(() => this.#startMonitor());
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'duplex':
      {
        this.#duplex = newVal == 'true'? true: false;
        break;
      }
      case 'gap':
      {
        this.#gap = isFinite(newVal)? Number.parseInt(newVal): 0;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
  };

  disconnectedCallback() {
    cancelAnimationFrame(this.#handler);
  };

  constructor() {
    super();
    this.ready = false;
    this.#startMonitor();
  };
};