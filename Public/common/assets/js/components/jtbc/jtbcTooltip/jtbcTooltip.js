export default class jtbcTooltip extends HTMLElement {
  static get observedAttributes() {
    return ['text', 'disabled', 'position'];
  };

  #text = '';
  #disabled = false;
  #position = 'top';
  #hideTextTimeout;
  #showTextTimeout;

  get text() {
    return this.#text;
  };

  get disabled() {
    return this.#disabled;
  };

  get position() {
    return this.#position;
  };

  set text(text) {
    this.#text = text;
    this.textEl.innerText = text;
  };

  set disabled(disabled) {
    this.#disabled = disabled? true: false;
  };

  set position(position) {
    this.#position = ['top', 'top-start', 'top-end', 'right', 'right-start', 'right-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end'].includes(position)? position: 'top';
    this.textEl.setAttribute('position', this.#position);
  };

  #initEvents() {
    let that = this;
    this.addEventListener('mouseenter', function(){
      if (that.disabled != true)
      {
        that.textEl.classList.add('on');
        that.#showTextTimeout = setTimeout(function(){
          that.textEl.classList.add('show');
        }, 600);
        clearTimeout(that.#hideTextTimeout);
      };
    });
    this.addEventListener('mouseleave', function(){
      clearTimeout(that.#showTextTimeout);
      if (that.textEl.classList.contains('show'))
      {
        that.#hideTextTimeout = setTimeout(function(){
          that.textEl.classList.remove('show');
        }, 600);
      };
    });
    this.textEl.addEventListener('transitionend', function(){
      if (!this.classList.contains('show'))
      {
        this.classList.remove('on');
      };
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'text':
      {
        this.text = newVal;
        break;
      };
      case 'disabled':
      {
        this.disabled = this.hasAttribute('disabled')? true: false;
        break;
      };
      case 'position':
      {
        this.position = newVal;
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
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <slot></slot>
      <div class="text"><slot name="text"></slot></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.textEl = shadowRoot.querySelector('div.text');
    this.textEl.setAttribute('position', this.position);
  };
};