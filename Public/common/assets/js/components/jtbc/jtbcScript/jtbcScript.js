export default class jtbcScript extends HTMLElement {
  static get observedAttributes() {
    return ['src'];
  };

  #src = '';
  #appended = false;
  #readied = false;
  #instance = null;
  #rootNode = null;

  get appended() {
    return this.#appended;
  };

  get src() {
    return this.#src;
  };

  get ready() {
    return this.#readied;
  };

  get instance() {
    return this.#instance;
  };

  get rootNode() {
    return this.#rootNode;
  };

  set src(value) {
    this.#src = value;
    this.loadScript();
  };

  appendedCallback() {
    this.#appended = true;
    this.readiedCallback();
  };

  readiedCallback() {
    if (this.ready == false)
    {
      if (this.appended == true && this.instance != null)
      {
        this.#readied = true;
        if ('readiedCallback' in this.instance)
        {
          this.instance.readiedCallback();
        };
      };
    };
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
    if (this.rootNode.contains(this))
    {
      this.appendedCallback();
    };
  };

  constructor() {
    super();
    this.#rootNode = this.getRootNode();
  };
};