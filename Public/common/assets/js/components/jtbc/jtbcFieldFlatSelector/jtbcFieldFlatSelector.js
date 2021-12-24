export default class jtbcFieldFlatSelector extends HTMLElement {
  static get observedAttributes() {
    return ['align', 'data', 'type', 'columns', 'max', 'value', 'disabled', 'width'];
  };

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let value = '';
    if (this.selected.length != 0)
    {
      value = JSON.stringify(this.selected);
    };
    return value;
  };

  get disabled() {
    return this.currentDisabled;
  };

  set value(value) {
    this.selected = [];
    this.currentValue = value? JSON.parse(value): [];
    if (Array.isArray(this.currentValue))
    {
      this.currentValue.forEach(item => {
        this.pushSelectedValue(item);
      });
    };
    this.reselect();
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
    this.currentDisabled = disabled;
  };

  getMax() {
    let currentMax = 1;
    if (this.currentType != 'radio')
    {
      if (this.currentMax == null)
      {
        currentMax = 1000000;
      }
      else
      {
        currentMax = Number.parseInt(this.currentMax);
        if (currentMax < 1) currentMax = 1;
      };
    };
    return currentMax;
  };

  pushSelectedValue(value) {
    if (!this.selected.includes(value))
    {
      this.selected.push(value);
      this.reselect();
    };
  };

  shiftSelectedValue(value) {
    if (this.selected.includes(value))
    {
      this.selected = this.selected.filter(item => item != value);
      this.reselect();
    };
  };

  initEvents() {
    let that = this;
    let container = this.container;
    container.delegateEventListener('item', 'click', function(){
      if (that.disabled != true)
      {
        let value = this.getAttribute('value');
        if (that.selected.includes(value))
        {
          that.shiftSelectedValue(value);
        }
        else
        {
          that.pushSelectedValue(value);
        };
      };
    });
  };

  render() {
    let container = this.container;
    let currentData = this.currentData;
    container.innerHTML = '';
    if (currentData != null)
    {
      let data = JSON.parse(currentData);
      if (Array.isArray(data))
      {
        data.forEach(item => {
          let newItem = document.createElement('item');
          let newItemEm = document.createElement('em');
          let newItemText = document.createElement('span');
          newItem.setAttribute('value', item.value);
          newItemText.innerText = item.text;
          newItem.append(newItemEm, newItemText);
          container.appendChild(newItem);
        });
      };
    };
    this.reselect();
  };

  reselect() {
    let container = this.container;
    while (this.selected.length > this.getMax())
    {
      this.selected.shift();
    };
    container.querySelectorAll('item').forEach(item => {
      let itemValue = item.getAttribute('value');
      if (this.selected.includes(itemValue))
      {
        item.classList.add('on');
      }
      else
      {
        item.classList.remove('on');
      };
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    let container = this.container;
    switch(attr) {
      case 'align':
      {
        this.currentAlign = newVal.toLowerCase();
        container.setAttribute('align', this.currentAlign);
        break;
      }; 
      case 'data':
      {
        this.currentData = newVal;
        break;
      };
      case 'type':
      {
        this.currentType = newVal.toLowerCase();
        container.setAttribute('type', this.currentType);
        break;
      };
      case 'columns':
      {
        this.currentColumns = isFinite(newVal)? newVal: 3;
        container.setAttribute('columns', this.currentColumns);
        break;
      };
      case 'max':
      {
        this.currentMax = isFinite(newVal)? newVal: null;
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
      case 'width':
      {
        this.style.width = isFinite(newVal)? newVal + 'px': newVal;
        break;
      };
    };
    if (this.ready == true)
    {
      if (attr == 'data')
      {
        this.render();
      }
      else if (['type', 'max'].includes(attr))
      {
        this.reselect();
      };
    };
  };

  connectedCallback() {
    this.render();
    this.initEvents();
    this.ready = true;
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('.')) + '.css';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.selected = [];
    this.container = shadowRoot.querySelector('div.container');
    this.currentAlign = null;
    this.currentData = null;
    this.currentType = null;
    this.currentColumns = null;
    this.currentMax = null;
    this.currentValue = '';
    this.currentDisabled = false;
  };
};