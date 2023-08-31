export default class jtbcScript extends HTMLElement {
  static get observedAttributes() {
    return ['src'];
  };

  #src = '';
  #readied = false;
  #instance = null;

  get src() {
    return this.#src;
  };

  get ready() {
    return this.#readied;
  };

  get instance() {
    return this.#instance;
  };

  set src(src) {
    this.#src = src;
    this.loadScript();
  };

  isReadied() {
    return this.#readied;
  };

  loadScript() {
    let currentURL = new URL(document.baseURI);
    let currentPath = currentURL.origin + currentURL.pathname.substring(0, currentURL.pathname.lastIndexOf('/') + 1);
    let currentSrc = this.#src.substring(0, 1) == '/'? this.#src: currentPath + this.#src;
    import(currentSrc).then(module => {
      this.#instance = new module.default(this);
      this.readiedCallback();
    });
  };

  readiedCallback() {
    if (!this.isReadied())
    {
      if (this.isConnected && this.instance != null)
      {
        this.#readied = true;
        if ('readiedCallback' in this.instance)
        {
          this.instance.readiedCallback();
        };
      };
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'src':
      {
        this.src = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.readiedCallback();
  };

  constructor() {
    super();
  };
};