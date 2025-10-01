export default class jtbcQrCode extends HTMLElement {
  static get observedAttributes() {
    return ['content', 'size', 'param', 'text'];
  };

  #content = null;
  #size = null;
  #param = null;
  #rendered = false;
  #text = null;

  get content() {
    return this.#content;
  };

  get param() {
    let result = this.#param;
    if (result == null)
    {
      result = {
        'render': 'svg',
      };
    };
    if (this.#content != null)
    {
      result.text = this.#content;
    };
    if (Number.isInteger(this.#size))
    {
      result.size = this.#size;
    };
    return result;
  };

  get rendered() {
    return this.#rendered;
  };

  get text() {
    return this.#text;
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

  set text(text) {
    this.#text = text;
  };

  #render() {
    let result = false;
    if (this.ready === true && this.content != null)
    {
      const render = () => {
        let qrcode = kjua(this.param);
        if (qrcode instanceof HTMLImageElement)
        {
          qrcode.setAttribute('title', this.text ?? '');
        };
        this.empty().appendChild(qrcode);
        this.#rendered = result = true;
        this.dispatchEvent(new CustomEvent('qrcoderendered', {bubbles: true}));
      };
      if (window.kjua !== undefined)
      {
        render();
      }
      else
      {
        let rootNode = this.getRootNode();
        let script = document.createElement('script');
        script.addEventListener('load', e => render());
        script.setAttribute('src', this.vendorPath + '/kjua.min.js');
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
    return result;
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'content':
      {
        this.#content = newVal;
        this.#render();
        break;
      };
      case 'size':
      {
        this.#size = isFinite(newVal)? Number.parseInt(newVal): 200;
        this.#render();
        break;
      };
      case 'param':
      {
        this.param = newVal;
        this.#render();
        break;
      };
      case 'text':
      {
        this.text = newVal;
        this.#render();
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#render();
  };

  constructor() {
    super();
    this.ready = false;
    this.basePath = import.meta.url.substring(0, import.meta.url.lastIndexOf('/') + 1);
    this.vendorPath = this.basePath.substring(0, this.basePath.indexOf('/components/')) + '/vendor/kjua';
  };
};