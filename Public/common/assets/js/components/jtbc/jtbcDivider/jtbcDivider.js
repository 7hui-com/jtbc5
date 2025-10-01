export default class jtbcDivider extends HTMLElement {
  static get observedAttributes() {
    return ['line-color', 'line-height', 'line-style', 'gap', 'padding', 'position'];
  };

  #position = 'center';

  get position() {
    return this.#position;
  };

  set position(position) {
    this.container.setAttribute('position', position);
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    container.querySelectorAll('slot').forEach(el => {
      el.addEventListener('slotchange', function(){
        let assignedNodes = this.assignedNodes();
        if (assignedNodes.length != 0)
        {
          container.classList.add('assigned');
        }
        else
        {
          container.classList.remove('assigned');
        };
      });
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'line-color':
      {
        this.style.setProperty('--line-color', newVal);
        break;
      };
      case 'line-height':
      {
        this.style.setProperty('--line-height', isFinite(newVal)? newVal + 'px': newVal);
        break;
      };
      case 'line-style':
      {
        this.style.setProperty('--line-style', newVal);
        break;
      };
      case 'gap':
      {
        this.style.setProperty('--gap', isFinite(newVal)? newVal + 'px': newVal);
        break;
      };
      case 'padding':
      {
        this.style.setProperty('--padding', isFinite(newVal)? newVal + 'px': newVal);
        break;
      };
      case 'position':
      {
        this.position = ['left', 'center', 'right'].includes(newVal)? newVal: 'center';
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#initEvents();
  };

  constructor() {
    super();
    this.ready = false;
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    shadowRoot.innerHTML = `<style>@import url('${importCssUrl}');</style><container style="display:none"><slot></slot></container>`;
    this.container = shadowRoot.querySelector('container');
  };
};