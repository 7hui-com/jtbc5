export default class jtbcQrCode extends HTMLElement {
  static get observedAttributes() {
    return ['content', 'size', 'param'];
  };

  #content = null;
  #size = null;
  #param = null;
  #rendered = false;
  #basePath = null;
  #libPath = null;

  get content() {
    return this.#content;
  };

  get param() {
    let result = this.#param ?? {};
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
    this.#render();
  };

  #render() {
    let result = false;
    let container = this.container;
    if (this.ready === true && this.content != null)
    {
      const render = () => {
        this.#rendered = result = true;
        container.empty().appendChild(kjua(this.param));
        this.dispatchEvent(new CustomEvent('qrcoderendered', {bubbles: true}));
      };
      if (typeof kjua == 'undefined')
      {
        let parentNode = container.parentNode;
        let script = document.createElement('script');
        script.src = this.#libPath + '/kjua.min.js';
        parentNode.insertBefore(script, container);
        script.addEventListener('load', () => render());
      }
      else
      {
        render();
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
    let shadowRoot = this.attachShadow({mode: 'open'});
    let basePath = import.meta.url.substring(0, import.meta.url.lastIndexOf('/') + 1);
    shadowRoot.innerHTML = `<style>:host { display: inline-block } div.container * { vertical-align: top }</style><div class="container"></div>`;
    this.ready = false;
    this.#basePath = basePath;
    this.#libPath = basePath + '../../../vendor/kjua';
    this.container = shadowRoot.querySelector('div.container');
  };
};