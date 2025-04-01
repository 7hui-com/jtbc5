export default class wave extends HTMLElement {
  static get observedAttributes() {
    return ['height', 'wave-layer1-fill', 'wave-layer2-fill', 'wave-layer3-fill'];
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'height':
      {
        this.style.height = isFinite(newVal)? newVal + 'px': newVal;
        break;
      };
      case 'wave-layer1-fill':
      {
        this.style.setProperty('--wave-layer1-fill', newVal);
        break;
      };
      case 'wave-layer2-fill':
      {
        this.style.setProperty('--wave-layer2-fill', newVal);
        break;
      };
      case 'wave-layer3-fill':
      {
        this.style.setProperty('--wave-layer3-fill', newVal);
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
      <div part="container" class="container" style="display:none">
        <svg class="wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 28" preserveAspectRatio="none">
          <defs>
            <path id="defs-wave" d="m -160,44.4 c 30,0 58, -18 87.7,-18 30.3,0 58.3, 18 87.3,18 30,0 58,-18 88, -18 30,0 58,18 88,18 l 0, 34.5 -351,0 z"></path>
          </defs>
          <g class="parallax">
            <use href="#defs-wave" x="50" y="0" class="wave-layer1"></use>
            <use href="#defs-wave" x="50" y="4" class="wave-layer2"></use>
            <use href="#defs-wave" x="50" y="8" class="wave-layer3"></use>
          </g>
        </svg>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
  };
};