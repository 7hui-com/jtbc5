export default class jtbcChoiceSelector extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'value'];
  };

  get name() {
    return this.getAttribute('name');
  };

  set value(value) {
    this.setAttribute('value', value);
  };

  get value() {
    if (this.currentType == 'checkbox')
    {
      let valueArr = [];
      this.querySelectorAll('input[type=checkbox]').forEach(el => {
        if (el.checked)
        {
          valueArr.push(el.value);
        };
      });
      this.currentValue = valueArr.length == 0? '': JSON.stringify(valueArr);
    }
    else
    {
      let checkedEl = this.querySelector('input[type=radio]:checked');
      this.currentValue = checkedEl == null? '': checkedEl.value;
    };
    return this.currentValue;
  };

  update() {
    let currentValue = this.currentValue;
    if (currentValue != null)
    {
      if (this.currentType == 'checkbox')
      {
        let valueArr = currentValue? JSON.parse(currentValue): [];
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
        this.currentType = newVal;
        this.update();
        break;
      };
      case 'value':
      {
        this.currentValue = newVal;
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
    this.currentType = 'radio';
    this.currentValue = null;
    this.ready = false;
  };
};