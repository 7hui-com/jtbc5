export default class jtbcChartCircle extends HTMLElement {
  static get observedAttributes() {
    return ['value'];
  };

  set value(value) {
    let currentValue = parseInt(value);
    if (currentValue < 0) currentValue = 0;
    else if (currentValue >= 100) currentValue = 100;
    if (this.currentValue != currentValue)
    {
      this.currentValue = currentValue;
      this.setAttribute('value', currentValue);
      let currentDeg = Math.round(360 * (currentValue / 100));
      if (currentDeg >= 180)
      {
        this.container.querySelector('div.container').classList.add('full');
        this.container.querySelector('span.c1').style.transform = 'rotate(180deg)';
        this.container.querySelector('span.c2').style.transform = 'rotate(' + currentDeg + 'deg)';
      }
      else
      {
        this.container.querySelector('div.container').classList.remove('full');
        this.container.querySelector('span.c1').style.transform = 'rotate(' + currentDeg + 'deg)';
        this.container.querySelector('span.c2').style.transform = 'rotate(0deg)';
      };
      this.container.querySelector('div.text b').innerHTML = currentValue;
    };
  };

  get value() {
    return this.currentValue;
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
      <div class="circle">
        <div class="bg"></div>
        <div class="container">
          <span class="c1"></span>
          <span class="c2"></span>
        </div>
        <div class="text"><b></b><em>%</em></div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.circle');
    this.currentValue = 0;
  };
};