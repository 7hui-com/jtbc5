export default class jtbcChoiceSelector extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'value'];
  };

  #type = 'radio';
  #value = null;

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    if (this.#hasOption())
    {
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
    };
    return this.#value;
  };

  set value(value) {
    this.setAttribute('value', value);
  };

  #hasOption() {
    let result = false;
    if (this.querySelectorAll('input').length != 0)
    {
      result = true;
    };
    return result;
  };

  #initEvents() {
    let that = this;
    this.addEventListener('renderend', function(){
      that.update();
    });
  };
  
  update() {
    if (this.#hasOption())
    {
      let value = this.#value;
      if (value != null)
      {
        if (this.#type == 'checkbox')
        {
          let valueArr = [];
          if (value != null)
          {
            if (value.startsWith('[') && value.endsWith(']'))
            {
              valueArr = JSON.parse(value);
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
            if (value == el.value)
            {
              el.checked = true;
            };
          });
        };
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
    this.#initEvents();
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    this.ready = false;
  };
};