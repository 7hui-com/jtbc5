export default class jtbcFieldCodeInput extends HTMLElement {
  static get observedAttributes() {
    return ['length', 'value', 'disabled'];
  };

  #value = null;
  #disabled = false;
  #length = 6;
  #minLength = 1;
  #maxLength = 50;
  #rendered = false;
  #characters = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = '';
    let itemValue = [];
    let container = this.container;
    container.querySelectorAll('input.text').forEach(el => {
      if (el.value != '')
      {
        itemValue.push(el.value);
      };
    });
    if (itemValue.length == this.#length)
    {
      this.#value = itemValue.join('');
      result = this.#value;
    };
    return result;
  };

  get disabled() {
    return this.#disabled;
  };

  set value(value) {
    this.#value = value;
    this.syncValue();
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.syncDisabled();
  };

  #initEvents() {
    let container = this.container;
    container.delegateEventListener('input.text', 'input', e => {
      let input = e.target;
      if (!this.#characters.includes(input.value))
      {
        input.value = '';
      }
      else
      {
        let nextIndex = Number.parseInt(input.dataset.index) + 1;
        let nextItem = container.querySelector('div.item-' + nextIndex);
        if (nextItem != null)
        {
          nextItem.querySelector('input.text').focus();
        };
      };
    });
    container.delegateEventListener('input.text', 'keyup', e => {
      if (this.value != '')
      {
        this.dispatchEvent(new CustomEvent('inputted', {bubbles: true}));
      };
    });
    container.delegateEventListener('input.text', 'keydown', e => {
      let input = e.target;
      if (e.keyCode == 8)
      {
        if (input.value == '')
        {
          let prevIndex = Number.parseInt(input.dataset.index) - 1;
          let prevItem = container.querySelector('div.item-' + prevIndex);
          if (prevItem != null)
          {
            prevItem.querySelector('input.text').focus();
          };
        };
      };
    });
  };

  #render() {
    let length = this.#length;
    let container = this.container;
    container.querySelectorAll('div.item').forEach(el => el.classList.add('marked'));
    for (let i = 1; i <= length; i ++)
    {
      let item = container.querySelector('div.item-' + i);
      if (item != null)
      {
        item.classList.remove('marked');
      }
      else
      {
        let newItem = document.createElement('div');
        let newItemText = document.createElement('input');
        newItem.classList.add('item');
        newItem.classList.add('item-' + i);
        newItemText.setAttribute('type', 'text');
        newItemText.classList.add('text');
        newItemText.setAttribute('maxlength', 1);
        newItemText.setAttribute('data-index', i);
        newItem.append(newItemText);
        container.append(newItem);
      };
    };
    container.querySelectorAll('div.item.marked').forEach(el => el.remove());
    this.#rendered = true;
    this.syncValue();
    this.syncDisabled();
  };

  setLength(length) {
    if (isFinite(length))
    {
      length = Math.max(Math.min(Number.parseInt(length), this.#maxLength), this.#minLength);
      if (this.#length != length)
      {
        this.#length = length;
        if (this.#rendered === true)
        {
          this.#render();
        };
      };
    };
  };

  syncValue() {
    let container = this.container;
    if (this.#rendered === true)
    {
      let value = this.#value;
      if (value != null && value.length == this.#length)
      {
        let itemIndex = 0;
        value.split('').forEach(char => {
          itemIndex += 1;
          let item = container.querySelector('div.item-' + itemIndex);
          if (item != null)
          {
            let input = item.querySelector('input.text');
            if (input != null && input.value == '')
            {
              input.value = char;
            };
          };
        });
      };
    };
  };

  syncDisabled() {
    let container = this.container;
    if (this.#rendered === true)
    {
      container.querySelectorAll('input.text').forEach(el => {
        el.disabled = this.#disabled;
      });
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'length':
      {
        this.setLength(newVal);
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
    this.#render();
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <container style="display:none"></container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('container');
    this.#initEvents();
  };
};