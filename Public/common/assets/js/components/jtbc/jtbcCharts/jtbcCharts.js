export default class jtbcCharts extends HTMLElement {
  static get observedAttributes() {
    return ['option', 'width', 'height'];
  };

  #option = null;
  #inited = false;
  instance = null;

  set option(option) {
    this.#option = option;
    this.#init();
  };

  #loadECharts() {
    let container = this.container;
    if (typeof echarts == 'undefined')
    {
      return new Promise((resolve) => {
        let parentNode = container.parentNode;
        let echartsScript = document.createElement('script');
        echartsScript.src = this.echartsPath + 'echarts.min.js';
        parentNode.insertBefore(echartsScript, container);
        echartsScript.addEventListener('load', () => resolve(this));
      });
    }
    else
    {
      return new Promise((resolve) => { resolve(this); });
    };
  };

  #init() {
    if (this.#inited === false)
    {
      this.#inited = true;
      this.#loadECharts().then(() => {
        let option = this.#option;
        this.instance = echarts.init(this.container);
        this.instance.setOption(option instanceof Object? option: JSON.parse(option));
      });
    };
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
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let basePath = import.meta.url.substring(0, import.meta.url.lastIndexOf('/') + 1);
    let importCssUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('.')) + '.css';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.echartsPath = basePath + '../../../vendor/echarts/';
  };
};