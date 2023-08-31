export default class jtbcChartCircle extends HTMLElement {
  static get observedAttributes() {
    return ['value'];
  };

  #value = 0;

  get value() {
    return this.#value;
  };

  set value(value) {
    let container = this.container;
    let currentValue = Math.max(Math.min(Number.parseInt(value), 100), 0);
    if (this.value != currentValue)
    {
      this.#value = currentValue;
      this.setAttribute('value', currentValue);
      let currentDeg = Math.round(360 * (currentValue / 100));
      if (currentDeg >= 180)
      {
        container.querySelector('div.box').classList.add('full');
        container.querySelector('span.c1').style.transform = 'rotate(180deg)';
        container.querySelector('span.c2').style.transform = 'rotate(' + currentDeg + 'deg)';
      }
      else
      {
        container.querySelector('div.box').classList.remove('full');
        container.querySelector('span.c1').style.transform = 'rotate(' + currentDeg + 'deg)';
        container.querySelector('span.c2').style.transform = 'rotate(0deg)';
      };
      container.querySelector('div.text b').innerText = currentValue;
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'value':
      {
        this.value = newVal;
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
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container">
        <div class="bg"></div>
        <div class="box">
          <span class="c1"></span>
          <span class="c2"></span>
        </div>
        <div class="text"><slot><b></b><em>%</em></slot></div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
  };
};