export default class jtbcDialogHelper extends HTMLElement {
  static get observedAttributes() {
    return ['baseurl', 'suffix'];
  };

  #suffix = null;
  #baseurl = null;

  get baseurl() {
    return this.#baseurl;
  };

  get suffix() {
    return this.#suffix;
  };

  set baseurl(baseurl) {
    this.#baseurl = baseurl;
  };

  set suffix(suffix) {
    this.#suffix = suffix;
  };

  async open(callback = null, suffix = null) {
    let result = null;
    if (this.dialog != null)
    {
      result = await this.dialog.open(this.baseurl + (suffix ?? this.suffix ?? ''), callback);
    };
    return result;
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'baseurl':
      {
        this.baseurl = newVal;
        break;
      };
      case 'suffix':
      {
        this.suffix = newVal;
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
    this.dialog = document.getElementById('dialog');
    this.callbackArgs = this.dialog?.callbackArgs;
  };
};