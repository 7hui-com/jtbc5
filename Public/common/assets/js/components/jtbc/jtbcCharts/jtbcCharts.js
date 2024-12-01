import * as echarts from '../../../vendor/echarts/echarts.esm.min.js';

export default class jtbcCharts extends HTMLElement {
  static get observedAttributes() {
    return ['option', 'width', 'height'];
  };

  #option = null;
  #inited = false;
  instance = null;

  get option() {
    return this.#option;
  };

  set option(option) {
    this.#option = option;
    if (this.instance != null)
    {
      this.instance.setOption(option instanceof Object? option: JSON.parse(option));
    };
  };

  async #init() {
    let container = this.container;
    if (this.#inited === false)
    {
      this.#inited = true;
      let option = this.#option;
      await checkComputedStyle(container, 'display', 'block');
      this.instance = echarts.init(container);
      this.instance.setOption(option instanceof Object? option: JSON.parse(option));
      this.resizeObserver = new ResizeObserver(entries => this.instance.resize());
      this.resizeObserver.observe(this);
    };
    return this;
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'option':
      {
        this.option = newVal;
        break;
      };
      case 'width':
      {
        this.style.width = isFinite(newVal)? newVal + 'px': newVal;
        break;
      };
      case 'height':
      {
        this.style.height = isFinite(newVal)? newVal + 'px': newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#init().then(el => el.dispatchEvent(new CustomEvent('inited', {bubbles: true})));
  };

  disconnectedCallback() {
    this.resizeObserver?.disconnect();
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
  };
};