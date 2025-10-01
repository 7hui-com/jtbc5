export default class jtbcMasonry extends HTMLElement {
  static get observedAttributes() {
    return ['column-width', 'column-name', 'gutter', 'param'];
  };

  #columnWidth = null;
  #columnName = 'item';
  #gutter = null;
  #param = null;

  get param() {
    let result = this.#param ?? {};
    if (Number.isInteger(this.#columnWidth))
    {
      result.columnWidth = this.#columnWidth;
    };
    if (Number.isInteger(this.#gutter))
    {
      result.gutter = this.#gutter;
    };
    result.initLayout = false;
    result.itemSelector = '.' + this.#columnName;
    return result;
  };

  set param(param) {
    if (typeof param == 'object')
    {
      this.#param = param;
    }
    else if (typeof param == 'string')
    {
      try
      {
        this.param = JSON.parse(param);
      }
      catch(e)
      {
        throw new Error('Unexpected value');
      };
    };
  };

  #initMasonry() {
    this.masonry = new Masonry(this, this.param);
    this.masonry.on('layoutComplete', () => {
      this.dispatchEvent(new CustomEvent('layoutcomplete', {bubbles: true}));
    });
    this.masonry.layout();
    nap(300).then(() => this.masonry.layout());
  };

  #loadMasonry() {
    if (window.Masonry !== undefined)
    {
      this.#initMasonry();
    }
    else
    {
      let rootNode = this.getRootNode();
      let script = document.createElement('script');
      script.addEventListener('load', e => this.#initMasonry());
      script.setAttribute('src', this.vendorPath + '/masonry.pkgd.min.js');
      if (rootNode.nodeType == 9)
      {
        rootNode.head.appendChild(script);
      }
      else if (rootNode.nodeType == 11)
      {
        rootNode.appendChild(script);
      }
      else
      {
        throw new Error('Unsupported root node type');
      };
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'column-width':
      {
        this.#columnWidth = isFinite(newVal)? Number.parseInt(newVal): null;
        break;
      };
      case 'column-name':
      {
        this.#columnName = newVal;
        break;
      };
      case 'gutter':
      {
        this.#gutter = isFinite(newVal)? Number.parseInt(newVal): null;
        break;
      };
      case 'param':
      {
        this.param = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#loadMasonry();
  };

  constructor() {
    super();
    this.ready = false;
    this.basePath = import.meta.url.substring(0, import.meta.url.lastIndexOf('/') + 1);
    this.vendorPath = this.basePath.substring(0, this.basePath.indexOf('/components/')) + '/vendor/masonry';
  };
};