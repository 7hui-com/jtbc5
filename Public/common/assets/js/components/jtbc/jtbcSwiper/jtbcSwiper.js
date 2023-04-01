import Swiper from '../../../vendor/swiper/swiper-bundle.esm.browser.min.js';

export default class jtbcSwiper extends HTMLElement {
  static get observedAttributes() {
    return ['param'];
  };

  #param = null;

  get param() {
    try
    {
      let param = JSON.parse(this.#param);
      return param instanceof Object? param: {};
    }
    catch(e) {
      console.log(e.message);
    };
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
      rootNode.head.appendChild(el);
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
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'param':
      {
        this.#param = newVal;
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
    this.basePath = import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/';
    this.swiperPath = new URL(this.basePath + '../../../vendor/swiper/');
    this.#appendStylesheet(this.swiperPath.pathname + 'swiper-bundle.min.css');
  };
};