export default class jtbcProgress extends HTMLElement {
  static get observedAttributes() {
    return ['percent', 'visible', 'width', 'height', 'track-color', 'track-border', 'track-border-radius', 'bar-color', 'bar-border', 'bar-border-radius', 'percent-background-color', 'percent-border', 'percent-border-radius', 'percent-font-color', 'percent-line-height', 'percent-padding', 'percent-font-size'];
  };

  #percent = 0;
  #visible = true;

  get percent() {
    return this.#percent;
  };

  get visible() {
    return this.#visible;
  };

  set percent(percent) {
    let container = this.container;
    if (isFinite(percent))
    {
      let percentEl = container.querySelector('span.percent');
      percent = Math.max(0, Math.min(100, Number.parseInt(percent)));
      if (this.#percent != percent)
      {
        this.#percent = percent;
        let percentVal = percent + '%';
        percentEl.innerText = percentVal;
        percentEl.style.transform = 'translate(' + (100 - percent) + '%, -50%)';
        percentEl.parentElement.style.width = percentVal;
        this.dispatchEvent(new CustomEvent('changed', {detail: {'percent': percent}, bubbles: true}));
        if (percent === 100)
        {
          this.dispatchEvent(new CustomEvent('progressdone', {bubbles: true}));
        };
      };
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  set visible(visible) {
    let container = this.container;
    if (visible.toLowerCase() === 'false')
    {
      this.#visible = false;
      container.setAttribute('visible', 'false');
    }
    else
    {
      this.#visible = true;
      container.removeAttribute('visible');
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'percent':
      {
        this.percent = newVal;
        break;
      };
      case 'visible':
      {
        this.visible = newVal;
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
      default:
      {
        this.style.setProperty('--' + attr, newVal);
      };
    };
  };

  connectedCallback() {
    this.ready = true;
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('.')) + '.css';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><div class="bar"><span class="percent"></span></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
  };
};