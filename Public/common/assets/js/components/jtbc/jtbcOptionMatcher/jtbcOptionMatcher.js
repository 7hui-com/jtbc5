export default class jtbcOptionMatcher extends HTMLElement {
  static get observedAttributes() {
    return ['mode', 'data', 'value', 'default', 'separator'];
  };

  #mode = 'single';
  #data = [];
  #value = null;
  #default = '';
  #separator = ',';
  #allowedModes = ['single', 'multi'];

  get data() {
    return this.#data;
  };

  get value() {
    return this.#value;
  };

  set data(data) {
    try
    {
      this.#data = JSON.parse(data);
      if (this.#value != null)
      {
        this.match();
      };
    }
    catch(e) {};
  };

  set value(value) {
    this.#value = value;
    this.match();
  };

  match() {
    let data = this.data;
    let container = this.container;
    if (Array.isArray(data) && data.length != 0)
    {
      let text = [];
      let value = this.#mode == 'single'? this.#value: JSON.parse(this.#value);
      data.forEach(item => {
        if (Array.isArray(value))
        {
          if (value.includes(item.value))
          {
            text.push(item.text);
          };
        }
        else
        {
          if (value == item.value)
          {
            text.push(item.text);
          };
        };
      });
      if (text.length == 0)
      {
        container.innerText = this.#default;
        container.classList.add('default');
      }
      else
      {
        container.innerText = text.join(this.#separator);
        container.classList.remove('default');
      };
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'mode':
      {
        if (this.#allowedModes.includes(newVal))
        {
          this.#mode = newVal;
        };
        break;
      };
      case 'data':
      {
        this.data = newVal;
        break;
      };
      case 'value':
      {
        this.value = newVal;
        break;
      };
      case 'default':
      {
        this.#default = newVal;
        break;
      };
      case 'separator':
      {
        this.#separator = newVal;
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
    this.baseURL = import.meta.url.substring(0, import.meta.url.lastIndexOf('/') + 1);
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `<style>@import url('${importCssUrl}');</style><container style="display:none"></container>`;
    shadowRoot.innerHTML = shadowRootHTML;
    this.container = shadowRoot.querySelector('container');
  };
};