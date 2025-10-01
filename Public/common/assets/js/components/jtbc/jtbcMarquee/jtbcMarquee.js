export default class jtbcMarquee extends HTMLElement {
  static get observedAttributes() {
    return ['speed'];
  };

  #speed = 10;
  #paused = false;
  #marginLeft = 0;
  #contentWidth = 0;
  #handler = null;

  get speed() {
    return this.#speed;
  };

  set speed(speed) {
    if (!isFinite(speed))
    {
      this.#speed = 1;
    }
    else
    {
      this.#speed = Math.max(1, Number.parseInt(speed));
    };
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    container.addEventListener('mouseenter', function(){
      that.#paused = true;
    });
    container.addEventListener('mouseleave', function(){
      that.#paused = false;
    });
    container.delegateEventListener('slot', 'slotchange', function(){
      this.assignedElements().forEach(el => el.classList.add('slotted'));
      if (this.parentElement.classList.contains('content-1'))
      {
        checkComputedStyle(container, 'display', 'block').then(() => {
          that.#marginLeft = 0;
          that.#contentWidth = container.querySelector('div.content-1').offsetWidth;
          that.#run();
        });
      };
    });
  };

  #run() {
    if (this.#paused !== true)
    {
      this.#marginLeft += (this.speed / 10);
      if (this.#marginLeft >= this.#contentWidth)
      {
        this.#marginLeft = 0;
      };
      let box = this.container.querySelector('div.box');
      box.style.marginLeft = '-' + this.#marginLeft + 'px';
    };
    this.#handler = requestAnimationFrame(() => this.#run());
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'speed':
      {
        this.speed = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#initEvents();
  };

  disconnectedCallback() {
    cancelAnimationFrame(this.#handler);
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none">
        <div class="box">
          <div class="content content-1"><slot name="content-1"></slot></div>
          <div class="content content-2"><slot name="content-2"></slot></div>
        </div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
  };
};