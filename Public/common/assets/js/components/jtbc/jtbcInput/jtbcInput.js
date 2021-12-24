export default class jtbcInput extends HTMLInputElement {
  static get observedAttributes() {
    return ['status', 'selected', 'width'];
  };

  update() {
    if (['checkbox', 'radio'].includes(this.type))
    {
      if (this.currentSelected == 'true')
      {
        this.checked = true;
      }
      else if (this.currentSelected == 'false')
      {
        this.checked = false;
      };
    };
    this.disabled = (this.currentStatus == 'disabled' || this.hasAttribute('disabled'))? true: false;
    this.readonly = (this.currentStatus == 'readonly' || this.hasAttribute('readonly'))? true: false;
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'status':
      {
        this.currentStatus = newVal;
        if (this.ready == true) this.update();
        break;
      };
      case 'selected':
      {
        this.currentSelected = newVal;
        if (this.ready == true) this.update();
        break;
      };
      case 'width':
      {
        if (['text','password'].includes(this.type))
        {
          this.style.width = isFinite(newVal)? newVal + 'px': newVal;
        };
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.update();
    if (this.type == 'text')
    {
      this.setAttribute('autocomplete', 'off');
    };
  };

  constructor() {
    super();
    this.currentStatus = null;
    this.currentSelected = null;
    this.ready = false;
  };
};