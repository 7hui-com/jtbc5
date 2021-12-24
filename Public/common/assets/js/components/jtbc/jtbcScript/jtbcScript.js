export default class jtbcScript extends HTMLElement {
  static get observedAttributes() {
    return ['src'];
  };

  get appended() {
    return this.currentAppended;
  };

  get src() {
    return this.currentSrc;
  };

  get ready() {
    return this.currentReadied;
  };

  get instance() {
    return this.currentInstance;
  };

  set src(value) {
    this.currentSrc = value;
    this.loadScript();
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

  appendedCallback() {
    this.currentAppended = true;
    this.readiedCallback();
  };

  readiedCallback() {
    if (this.currentReadied == false)
    {
      if (this.currentAppended == true && this.currentInstance != null)
      {
        this.currentReadied = true;
        if ('readiedCallback' in this.currentInstance)
        {
          this.currentInstance.readiedCallback();
        };
      };
    };
  };

  connectedCallback() {
    if (document.body.contains(this))
    {
      this.appendedCallback();
    };
  };

  loadScript() {
    let currentURL = new URL(document.baseURI);
    let currentPath = currentURL.origin + currentURL.pathname.substring(0, currentURL.pathname.lastIndexOf('/') + 1);
    let currentSrc = this.currentSrc.substring(0, 1) == '/'? this.currentSrc: currentPath + this.currentSrc;
    import(currentSrc).then(module => {
      this.currentInstance = new module.default(this);
      this.readiedCallback();
    });
  };

  constructor() {
    super();
    this.currentSrc = '';
    this.currentAppended = false;
    this.currentReadied = false;
    this.currentInstance = null;
  };
};