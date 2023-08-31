import Swiper from '../../../vendor/swiper/swiper-bundle.esm.browser.min.js';

export default class jtbcSwiper extends HTMLElement {
  static get observedAttributes() {
    return ['param'];
  };

  #param = null;
  #basePath = null;
  #libPath = null;

  get param() {
    let result = {};
    if (this.#param instanceof Object)
    {
      result = this.#param;
    }
    else
    {
      try
      {
        result = JSON.parse(this.#param);
      }
      catch(e)
      {
        throw new Error('Unexpected value');
      };
    };
    return result;
  };

  set param(param) {
    this.#param = param;
  };

  #appendStylesheet(path) {
    let rootNode = this.getRootNode();
    let el = rootNode.querySelector('link.swiper');
    if (el == null)
    {
      el = document.createElement('link');
      el.setAttribute('type', 'text/css');
      el.setAttribute('rel', 'stylesheet');
      el.setAttribute('href', path);
      if (rootNode instanceof ShadowRoot)
      {
        rootNode.prepend(el);
      }
      else if (rootNode instanceof Document)
      {
        rootNode.head.append(el);
      }
      else
      {
        throw new Error('Unexpected environment');
      };
    };
  };

  init() {
    this.instance = null;
    let swipers = this.querySelectorAll('div.swiper');
    if (swipers.length == 1)
    {
      this.instance = new Swiper(swipers[0], this.param);
    }
    else
    {
      this.instance = [];
      swipers.forEach(item => {
        this.instance.push(new Swiper(item, this.param));
      });
    };
    this.dispatchEvent(new CustomEvent('inited', {'detail': {'instance': this.instance}}));
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'param':
      {
        this.param = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.init();
  };

  constructor() {
    super();
    this.ready = false;
    this.#basePath = import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/';
    this.#libPath = this.#basePath + '../../../vendor/swiper';
    this.#appendStylesheet(this.#libPath + '/swiper-bundle.min.css');
  };
};