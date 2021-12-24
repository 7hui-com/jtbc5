export default class jtbcDialogHelper extends HTMLElement {
  static get observedAttributes() {
    return ['baseurl'];
  };

  async open(callback = null, suffix = null) {
    if (this.dialog != null)
    {
      let currentSuffix = suffix ?? this.suffix ?? this.getAttribute('suffix') ?? '';
      let result = await this.dialog.open(this.baseurl + currentSuffix, callback);
      return result;
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'baseurl':
      {
        this.baseurl = newVal;
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
    this.suffix = null;
    this.baseurl = null;
    this.dialog = document.getElementById('dialog');
    this.callbackArgs = this.dialog.callbackArgs;
  };
};