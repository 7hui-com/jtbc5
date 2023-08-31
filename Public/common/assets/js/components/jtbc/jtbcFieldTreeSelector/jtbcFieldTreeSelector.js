export default class jtbcFieldTreeSelector extends HTMLElement {
  static get observedAttributes() {
    return ['data', 'value', 'disabled'];
  };

  #disabled = false;
  #value = null;

  get data() {
    return this.currentData;
  };

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = '';
    let checked = [];
    let container = this.container;
    container.querySelectorAll('input.item').forEach(el => {
      if (el.checked == true) checked.push(el.value);
    });
    if (checked.length != 0)
    {
      result = JSON.stringify(checked);
    };
    return result;
  };

  get disabled() {
    return this.#disabled;
  };

  set data(data) {
    this.currentData = data;
    this.render();
  };

  set value(value) {
    this.#value = value;
    this.resetChecked();
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    container.addEventListener('selectItem', e => {
      let result = false;
      let id = e.detail.res[1];
      let valueArr = this.getValueArr();
      if (valueArr.includes(id))
      {
        result = true;
      };
      e.detail.result = result;
    });
    container.addEventListener('renderend', e => {
      this.resetChecked();
    });
    container.delegateEventListener('input.item', 'click', function(){
      const fatherChecked = node => {
        let fatherEl = container.querySelector('input.item-' + node.getAttribute('father_id'));
        if (fatherEl != null)
        {
          fatherEl.checked = true;
          fatherChecked(fatherEl);
        };
      };
      const childrenChecked = node => {
        container.querySelectorAll("input.item[father_id='" + node.getAttribute('value') + "']").forEach(el => {
          el.checked = true;
          childrenChecked(el);
        });
      };
      const childrenUnChecked = node => {
        container.querySelectorAll("input.item[father_id='" + node.getAttribute('value') + "']").forEach(el => {
          el.checked = false;
          childrenUnChecked(el);
        });
      };
      if (that.disabled != true)
      {
        if (!this.checked)
        {
          childrenUnChecked(this);
        }
        else
        {
          fatherChecked(this);
          childrenChecked(this);
        };
      };
    });
  };

  getValueArr() {
    let result = [];
    let currentValue = this.#value;
    if (currentValue != null && currentValue.trim() != '')
    {
      result = JSON.parse(currentValue);
    };
    return result;
  };

  render() {
    let container = this.container;
    container.innerHTML = '';
    container.appendFragment(this.template.content).then((el) => {
      el.querySelector('template').setAttribute('data', this.data);
    });
  };

  resetChecked() {
    let container = this.container;
    let valueArr = this.getValueArr();
    if (valueArr.length != 0)
    {
      container.querySelectorAll('input.item').forEach(el => {
        el.setAttribute('selected', valueArr.includes(el.value)? 'true': 'false');
      });
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
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
      case 'disabled':
      {
        this.disabled = this.hasAttribute('disabled')? true: false;
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
      <div class="container" style="display:none"></div>
      <template>
        <template is="jtbc-template">
          <ul isloop="true">
            <li>
              <div class="option"><label class="checkbox"><input is="jtbc-input" type="checkbox" class="item item-\${$id}" father_id="\${$father_id}" value="\${$id}" selected="\${$.customEvent('selectItem', $.raw.id)}" /><span>\${$title}</span></div>\${$.selfie($.raw.children)}
            </li>
          </ul>
        </template>
      </template>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.currentData = null;
    this.template = shadowRoot.querySelector('template');
    this.container = shadowRoot.querySelector('div.container');
    this.#initEvents();
  };
};