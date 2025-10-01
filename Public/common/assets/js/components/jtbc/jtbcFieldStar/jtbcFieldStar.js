export default class jtbcFieldStar extends HTMLElement {
  static get observedAttributes() {
    return ['length', 'value', 'disabled'];
  };

  #disabled = false;
  #value = 0;

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    return this.#value;
  };

  get disabled() {
    return this.#disabled;
  };

  set value(value) {
    let currentIndex = 0;
    let container = this.container;
    let currentValue = Number.parseInt(value);
    if (currentValue < 0) currentValue = 0;
    container.querySelectorAll('star').forEach(el => {
      currentIndex += 1;
      currentIndex <= currentValue? el.classList.add('on'): el.classList.remove('on');
    });
    this.#value = currentValue;
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    container.addEventListener('mouseleave', () => {
      this.value = this.#value;
    });
    container.delegateEventListener('star', 'mouseover', function(){
      if (that.disabled != true)
      {
        let hasEnded = false;
        this.parentNode.querySelectorAll('star').forEach(el => {
          hasEnded == false? el.classList.add('on'): el.classList.remove('on');
          hasEnded = (hasEnded || this == el);
        });
      };
    });
    container.delegateEventListener('star', 'click', function(){
      if (that.disabled != true)
      {
        that.value = this.index();
        that.dispatchEvent(new CustomEvent('changed', {bubbles: true}));
      };
    });
  };

  render() {
    let container = this.container;
    container.querySelectorAll('star').forEach(el => { el.remove(); });
    for (let i = 0; i < this.currentLength; i ++)
    {
      let newStar = document.createElement('star');
      newStar.innerHTML = '<jtbc-svg name="star" class="star"></jtbc-svg><jtbc-svg name="star_fill" class="star_fill"></jtbc-svg>';
      container.append(newStar);
    };
    this.value = this.#value;
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'length':
      {
        this.currentLength = Number.parseInt(newVal);
        if (this.currentLength < 1) this.currentLength = 1;
        this.render();
        break;
      };
      case 'value':
      {
        this.value = newVal;
        break;
      };
      case 'disabled':
      {
        this.disabled = this.hasAttribute('disabled')? true: false;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#initEvents();
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <container style="display:none"></container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('container');
    this.currentLength = 5;
    this.render();
  };
};