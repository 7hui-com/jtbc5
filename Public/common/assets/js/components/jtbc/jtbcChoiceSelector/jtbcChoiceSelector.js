export default class jtbcChoiceSelector extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'value'];
  };

  #type = 'radio';
  #value = null;

  get name() {
    return this.getAttribute('name');
  };

  set value(value) {
    this.setAttribute('value', value);
  };

  get value() {
    if (this.#type == 'checkbox')
    {
      let valueArr = [];
      this.querySelectorAll('input[type=checkbox]').forEach(el => {
        if (el.checked)
        {
          valueArr.push(el.value);
        };
      });
      this.#value = valueArr.length == 0? '': JSON.stringify(valueArr);
    }
    else
    {
      let checkedEl = this.querySelector('input[type=radio]:checked');
      this.#value = checkedEl == null? '': checkedEl.value;
    };
    return this.#value;
  };

  update() {
    let currentValue = this.#value;
    if (currentValue != null)
    {
      if (this.#type == 'checkbox')
      {
        let valueArr = [];
        if (currentValue != null)
        {
          if (currentValue.startsWith('[') && currentValue.endsWith(']'))
          {
            valueArr = JSON.parse(currentValue);
          };
        };
        this.querySelectorAll('input[type=checkbox]').forEach(el => {
          if (valueArr.includes(el.value))
          {
            el.checked = true;
          };
        });
      }
      else
      {
        this.querySelectorAll('input[type=radio]').forEach(el => {
          if (currentValue == el.value)
          {
            el.checked = true;
          };
        });
      };
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'type':
      {
        this.#type = newVal;
        this.update();
        break;
      };
      case 'value':
      {
        this.#value = newVal;
        this.update();
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    this.ready = false;
  };
};