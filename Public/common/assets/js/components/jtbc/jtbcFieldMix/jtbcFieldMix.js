import mixedFieldCreator from '../../../library/field/mixedFieldCreator.js';

export default class jtbcFieldMix extends HTMLElement {
  static get observedAttributes() {
    return ['columns', 'value', 'disabled', 'width', 'with-global-headers'];
  };

  #columns = null;
  #disabled = false;
  #value = null;
  #withGlobalHeaders = null;

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = '';
    if (this.inited == false)
    {
      result = this.#value ?? '';
    }
    else
    {
      let item = {};
      let hasValue = false;
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
    };
    return result;
  };

  get columns() {
    return this.#columns;
  };

  get disabled() {
    return this.#disabled;
  };

  get withGlobalHeaders() {
    return this.#withGlobalHeaders;
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

  set columns(columns) {
    this.#columns = columns;
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  set withGlobalHeaders(withGlobalHeaders) {
    this.#withGlobalHeaders = withGlobalHeaders;
  };

  #init() {
    if (this.inited == false)
    {
      if (this.columns != null)
      {
        let columns = JSON.parse(this.columns);
        let liElement = document.createElement('li');
        let mixedField = new mixedFieldCreator(columns, this.withGlobalHeaders);
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
        this.columns = newVal;
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
      case 'with-global-headers':
      {
        this.withGlobalHeaders = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.#init();
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
    this.container = shadowRoot.querySelector('container');
    this.content = this.container.querySelector('ul.content');
  };
};