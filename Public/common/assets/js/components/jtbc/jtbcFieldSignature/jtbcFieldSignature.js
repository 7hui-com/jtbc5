import signaturePad from '../../../vendor/signature_pad/signature_pad.min.js';

export default class jtbcFieldSignature extends HTMLElement {
  static get observedAttributes() {
    return ['pen-color', 'value', 'disabled', 'readonly'];
  };

  #disabled = false;
  #readonly = false;
  #value = null;
  #penColor = '#000000';
  signaturePad = null;

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = this.#value ?? '';
    if (this.signaturePad != null)
    {
      if (!this.signaturePad.isEmpty())
      {
        result = JSON.stringify(this.signaturePad.toData());
      };
    };
    return result;
  };

  get disabled() {
    return this.#disabled;
  };

  get readonly() {
    return this.#readonly;
  };

  set value(value) {
    this.#value = value;
    if (value.length != 0)
    {
      this.signaturePad?.fromData(JSON.parse(value));
    };
  };

  set disabled(disabled) {
    if (disabled == true)
    {
      this.container.classList.add('disabled');
    }
    else
    {
      this.container.classList.remove('disabled');
    };
    this.#disabled = disabled;
  };

  set readonly(readonly) {
    if (readonly == true)
    {
      this.signaturePad?.off();
    }
    else
    {
      this.signaturePad?.on();
    };
    this.#readonly = readonly;
  };

  #resize(entry) {
    let el = entry.target;
    let canvas = el.container.querySelector('canvas.signature');
    canvas.width = el.clientWidth;
    canvas.height = el.clientHeight;
    if (this.signaturePad.isEmpty())
    {
      if (this.hasValue())
      {
        this.signaturePad.fromData(JSON.parse(this.#value));
      };
    }
    else
    {
      this.signaturePad.fromData(this.signaturePad.toData());
    };
  };

  #initEvents() {
    this.resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => this.#resize(entry));
    });
    this.resizeObserver.observe(this);
  };

  clear() {
    return this.signaturePad?.clear();
  };

  createSignaturePad() {
    let options = {
      'penColor': this.#penColor,
    };
    this.signaturePad = new signaturePad(this.container.querySelector('canvas.signature'), options);
    if (this.readonly === true)
    {
      this.signaturePad.off();
    };
  };

  hasValue() {
    let result = false;
    if (this.#value != null && this.#value.length != 0)
    {
      result = true;
    };
    return result;
  };

  toDataURL(...args) {
    return this.signaturePad?.toDataURL(...args);
  };

  toSVG(...args) {
    return this.signaturePad?.toSVG(...args);
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'pen-color':
      {
        this.#penColor = newVal;
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
      case 'readonly':
      {
        this.readonly = this.hasAttribute('readonly')? true: false;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.createSignaturePad();
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><canvas class="signature"></canvas><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.#initEvents();
  };
};