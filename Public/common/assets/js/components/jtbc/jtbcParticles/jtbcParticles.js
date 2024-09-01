export default class jtbcParticles extends HTMLElement {
  static get observedAttributes() {
    return ['color', 'line-color'];
  };

  #basePath;
  #color = '#ffffff';
  #lineColor = '#ffffff';

  render() {
    let container = this.container;
    let iframe = container.querySelector('iframe.particles');
    iframe.addEventListener('load', e => {
      let particles = e.target.contentDocument.querySelector('div.particles');
      if (particles != null)
      {
        particles.dataset.color = this.#color;
        particles.dataset.lineColor = this.#lineColor;
        particles.dispatchEvent(new CustomEvent('run'));
      };
    });
    iframe.src = this.#basePath + 'particles.html';
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'color':
      {
        this.#color = newVal;
        break;
      };
      case 'line-color':
      {
        this.#lineColor = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.render();
    this.ready = true;
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    this.#basePath = import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container"><iframe class="particles" frameborder="no" border="0" scrolling="no" allowtransparency="yes"></iframe></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
  };
};