export default class jtbcSelect extends HTMLSelectElement {
  static get observedAttributes() {
    return ['value', 'width'];
  };

  #value = null;
  #selectedIndex = null;
  #observerInstance = null;

  get value() {
    return this.#value ?? this.getAttribute('value') ?? '';
  };

  set value(value) {
    let index = -1;
    let selectedIndex = 0;
    this.querySelectorAll('option').forEach(option => {
      index += 1;
      if (index == 0)
      {
        this.#value = option.value;
      };
      if (option.value == value)
      {
        this.#value = value;
        selectedIndex = index;
      };
    });
    this.selectedIndex = this.#selectedIndex = selectedIndex;
  };

  #initEvents() {
    this.addEventListener('change', e => {
      let target = e.target;
      if (this.#selectedIndex != target.selectedIndex)
      {
        this.#selectedIndex = target.selectedIndex;
        this.#value = target.options[this.#selectedIndex].value;
      };
    });
  };

  observer() {
    if (this.#observerInstance == null)
    {
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
    this.#initEvents();
    if (this.value == '')
    {
      if (this.selectedIndex != -1)
      {
        this.#value = this.options[this.selectedIndex].value;
      };
    };
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  disconnectedCallback() {
    this.#observerInstance?.disconnect();
  };

  constructor() {
    super();
    this.ready = false;
    this.observer();
  };
};