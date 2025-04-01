export default class jtbcTabs extends HTMLElement {
  static get observedAttributes() {
    return ['theme', 'width', 'border-color', 'border-size', 'border-radius', 'tab-bar-background', 'tab-bar-padding', 'tab-bar-justify-content', 'label-width', 'label-height', 'label-padding', 'label-background', 'label-color', 'label-font-family', 'label-font-size', 'label-font-weight', 'label-selected-background', 'label-selected-color', 'label-selected-font-size', 'label-selected-font-weight', 'content-background', 'content-padding'];
  };

  #index = -1;
  #panes = [];
  #current = null;
  #theme = 'classic';
  #allowedThemes = ['classic', 'card'];

  get theme() {
    return this.#theme;
  };

  set theme(theme) {
    if (this.#allowedThemes.includes(theme))
    {
      this.#theme = theme;
      this.container.setAttribute('theme', theme);
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  #initEvents() {
    let that = this;
    let tabBar = this.container.querySelector('div.tabs');
    tabBar.delegateEventListener('div.label', 'click', function(){
      that.selectTab(this.dataset.index);
    });
    this.slotElement.addEventListener('slotchange', e => this.#initPane(e.target));
  };

  #initPane(slot) {
    this.#index = -1;
    this.#panes = [];
    this.#current = null;
    slot.assignedElements().forEach(el => {
      if (el.dataset.label != undefined)
      {
        this.#index += 1;
        this.#panes.push({'index': this.#index, 'el': el, 'label': el.dataset.label});
        el.dataset.index = this.#index;
        if (el.classList.contains('on'))
        {
          this.#current = el;
        }
        else
        {
          el.classList.add('hide');
        };
      };
    });
    this.#initTabs();
  };

  #initTabs() {
    let isSelected = false;
    let tabBar = this.container.querySelector('div.tabs').empty();
    this.#panes.forEach(item => {
      let newItem = document.createElement('div');
      newItem.classList.add('label');
      newItem.setAttribute('part', 'label');
      newItem.pane = item.el;
      newItem.innerText = item.label;
      newItem.dataset.index = item.index;
      if (this.#current?.dataset?.index == item.index)
      {
        isSelected = true;
        newItem.classList.add('on');
      };
      tabBar.append(newItem);
    });
    if (isSelected === false)
    {
      tabBar.firstElementChild.click();
    };
  };

  reset() {
    this.#initPane(this.slotElement);
  };

  selectTab(index) {
    let slotElement = this.slotElement;
    let tabBar = this.container.querySelector('div.tabs');
    slotElement.assignedElements().forEach(el => {
      if (el.dataset.label != undefined)
      {
        el.classList.add('hide');
      };
    });
    tabBar.querySelectorAll('div.label').forEach(item => {
      if (item.dataset.index == index)
      {
        this.#current = item.pane;
        item.classList.add('on');
        item.pane.classList.add('on');
        item.pane.classList.remove('hide');
        this.dispatchEvent(new CustomEvent('changed', {detail: {'index': index, 'pane': item.pane}, bubbles: true}));
      }
      else
      {
        item.classList.remove('on');
      };
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'theme':
      {
        this.theme = newVal;
        break;
      };
      case 'width':
      {
        this.style.width = isFinite(newVal)? newVal + 'px': newVal;
        break;
      };
      default:
      {
        this.style.setProperty('--' + attr, newVal);
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#initEvents();
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none">
        <div class="tabs" part="tabs"></div>
        <div class="content"><slot></slot></div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.slotElement = this.container.querySelector('slot');
  };
};