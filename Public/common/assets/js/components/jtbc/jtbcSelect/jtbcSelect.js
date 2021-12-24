export default class jtbcSelect extends HTMLSelectElement {
  static get observedAttributes() {
    return ['value', 'width'];
  };

  #observerInstance;

  observer() {
    if (this.#observerInstance == null)
    {
      this.addEventListener('change', () => {
        this.setAttribute('value', this.value);
      });
      this.#observerInstance = new MutationObserver(() => {
        if (this.hasAttribute('value'))
        {
          this.value = this.getAttribute('value');
        };
      });
      this.#observerInstance.observe(this, {childList: true});
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'value':
      {
        this.value = newVal;
        break;
      };
      case 'width':
      {
        this.style.width = isFinite(newVal)? newVal + 'px': newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
  };

  constructor() {
    super();
    this.ready = false;
    this.observer();
  };
};