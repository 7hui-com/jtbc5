export default class jtbcFieldLinkageSelector extends HTMLElement {
  static get observedAttributes() {
    return ['data', 'value', 'placeholder', 'separator', 'disabled'];
  };

  #data = [];
  #value = null;
  #placeholder = null;
  #separator = '-';
  #disabled = false;

  get data() {
    return this.#data;
  };

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = '';
    let currentSelected = [];
    let container = this.container;
    let target = container.querySelector('div.select')
    if (this.ready !== true)
    {
      result = this.#value ?? '';
    }
    else
    {
      target.querySelectorAll('select').forEach(select => {
        let selectedOption = select.options[select.selectedIndex];
        if (selectedOption.hasAttribute('value'))
        {
          currentSelected.push(selectedOption.value);
        };
      });
      if (currentSelected.length != 0)
      {
        result = currentSelected.join(this.#separator);
      };
    };
    return result;
  };

  get placeholder() {
    return this.#placeholder;
  };

  get disabled() {
    return this.#disabled;
  };

  get selected() {
    let result = [];
    let currentValue = this.#value;
    if (currentValue != null && currentValue.length != 0)
    {
      result = currentValue.split(this.#separator);
    };
    return result;
  };

  set data(data) {
    if (Array.isArray(data))
    {
      this.#data = data;
      this.render();
    };
  };

  set value(value) {
    this.#value = value;
    this.render();
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  set placeholder(placeholder) {
    this.#placeholder = placeholder;
    this.render();
  };

  #loadSelector(target, rank, children) {
    let selected = this.selected;
    let container = this.container;
    let placeholder = this.placeholder;
    let selectedItem = null;
    let selectedIndex = 0;
    let newSelect = document.createElement('select');
    newSelect.setAttribute('rank', rank);
    if (placeholder != null)
    {
      selectedIndex += 1;
      newSelect.appendChild(new Option(placeholder));
    };
    children.forEach((item, index) => {
      let option = document.createElement('option');
      option.innerText = item.text;
      option.setAttribute('value', item.value);
      if (item.hasOwnProperty('children'))
      {
        option.setAttribute('children', JSON.stringify(item.children));
      };
      newSelect.appendChild(option);
      if (selected.length != 0 && selected[rank] == item.value)
      {
        selectedItem = option;
        selectedIndex += index;
      };
    });
    if (!target.classList.contains('select'))
    {
      target.after(newSelect);
    }
    else
    {
      target.append(newSelect);
    };
    newSelect.addEventListener('focus', e => container.classList.add('focus'));
    newSelect.addEventListener('blur', e => container.classList.remove('focus'));
    if (selectedItem != null)
    {
      this.loadChildren(selectedItem);
      newSelect.selectedIndex = selectedIndex;
    }
    else
    {
      if (newSelect.firstElementChild.hasAttribute('value'))
      {
        this.loadChildren(newSelect.firstElementChild);
      };
    };
  };

  #initEvents() {
    this.container.delegateEventListener('select', 'change', e => {
      this.loadChildren(e.target.options[e.target.selectedIndex]);
      this.dispatchEvent(new CustomEvent('changed', {bubbles: true}));
    });
  };

  loadChildren(el) {
    if (el != null)
    {
      let parentEl = el.parentElement;
      let rank = Number.parseInt(parentEl.getAttribute('rank'));
      let children = el.hasAttribute('children')? JSON.parse(el.getAttribute('children')): null;
      parentEl.parentElement.querySelectorAll('select').forEach(select => {
        let currentRank = Number.parseInt(select.getAttribute('rank'));
        if (currentRank > rank)
        {
          select.remove();
        };
      });
      if (Array.isArray(children) && children.length != 0)
      {
        this.#loadSelector(parentEl, rank + 1, children);
      };
    };
  };

  render() {
    if (this.ready === true)
    {
      let container = this.container;
      let target = container.querySelector('div.select').empty();
      if (this.data.length != 0)
      {
        this.#loadSelector(target, 0, this.data);
      };
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'data':
      {
        this.data = JSON.parse(newVal);
        break;
      };
      case 'value':
      {
        this.value = newVal;
        break;
      };
      case 'placeholder':
      {
        this.placeholder = newVal;
        break;
      };
      case 'separator':
      {
        this.#separator = newVal;
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
    this.#initEvents();
    this.render();
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><div class="select"></div><div class="box"></div><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
  };
};