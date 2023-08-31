import mixedFieldCreator from '../../../library/field/mixedFieldCreator.js';

export default class jtbcFieldMix extends HTMLElement {
  static get observedAttributes() {
    return ['columns', 'value', 'disabled', 'width'];
  };

  #disabled = false;
  #value = null;

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = '';
    let hasValue = false;
    let item = {};
    this.content.querySelectorAll('[role=field]').forEach(field => {
      let value = field.value;
      let valueType = typeof value;
      if (['boolean', 'number', 'bigint'].includes(valueType))
      {
        hasValue = true;
      }
      else if (valueType == 'string' && value.trim().length != 0)
      {
        hasValue = true;
      };
      item[field.name] = value;
    });
    if (hasValue == true)
    {
      result = JSON.stringify(item);
    };
    return result;
  };

  get disabled() {
    return this.#disabled;
  };

  set value(value) {
    if (value != null)
    {
      let item = value? JSON.parse(value): {};
      if (this.inited == true)
      {
        Object.keys(item).forEach(key => {
          let field = this.content.querySelector("[name='" + key + "']");
          if (field != null && field.getAttribute('role') == 'field')
          {
            field.setAttribute('value', item[key]);
          };
        });
      };
    };
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  init() {
    if (this.inited == false)
    {
      let currentColumns = this.currentColumns;
      if (currentColumns != null)
      {
        let columns = JSON.parse(currentColumns);
        let liElement = document.createElement('li');
        let mixedField = new mixedFieldCreator(columns);
        liElement.append(mixedField.getFragment());
        liElement.loadComponents().then(() => {
          this.inited = true;
          this.content.append(liElement);
          this.value = this.#value;
        });
      };
      this.container.classList.add('on');
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'columns':
      {
        this.currentColumns = newVal;
        this.init();
        break;
      };
      case 'value':
      {
        this.value = this.#value = newVal;
        break;
      };
      case 'disabled':
      {
        this.disabled = this.hasAttribute('disabled')? true: false;
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
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <container style="display:none">
        <div class="main mixedFieldContainer">
          <div class="list">
            <ul class="content"></ul>
          </div>
        </div>
        <div class="mask"></div>
      </container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.inited = false;
    this.currentColumns = null;
    this.container = shadowRoot.querySelector('container');
    this.content = this.container.querySelector('ul.content');
  };
};