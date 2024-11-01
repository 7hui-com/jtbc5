import Glide from '../../../vendor/glide/glide.esm.min.js';

export default class jtbcGlide extends HTMLElement {
  static get observedAttributes() {
    return ['param'];
  };

  #param = null;

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

  #init() {
    this.instance = null;
    let glides = this.querySelectorAll('div.glide');
    if (glides.length == 1)
    {
      let el = glides[0];
      this.instance = new Glide(el, this.param);
      this.instance.mount();
    }
    else
    {
      this.instance = [];
      glides.forEach(el => {
        let instance = new Glide(el, this.param);
        instance.mount();
        this.instance.push(instance);
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
    this.#init();
    this.ready = true;
  };

  constructor() {
    super();
    this.ready = false;
  };
};