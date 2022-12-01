export default class jtbcPopupConfirm extends HTMLElement {
  static get observedAttributes() {
    return ['disabled', 'position', 'text-tips', 'text-button-yes', 'text-button-no'];
  };

  #disabled = false;
  #position = 'bottom';
  #textTips = 'Are you sure?';
  #textButtonYes = 'Yes';
  #textButtonNo = 'No';

  get disabled() {
    return this.#disabled;
  };

  get position() {
    return this.#position;
  };

  set disabled(disabled) {
    this.#disabled = disabled? true: false;
  };

  set position(position) {
    this.#position = ['top', 'top-start', 'top-end', 'right', 'right-start', 'right-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end'].includes(position)? position: 'bottom';
    this.textEl.setAttribute('position', this.#position);
  };

  #setZIndex() {
    window.jtbcActiveZIndex = (window.jtbcActiveZIndex ?? 7777777) + 1;
    this.style.setProperty('--z-index', window.jtbcActiveZIndex);
  };

  #unsetZIndex() {
    this.style.removeProperty('--z-index');
  };

  #updateText(name) {
    if (name == 'tips')
    {
      this.textEl.querySelector('div.tips').innerText = this.#textTips;
    }
    else if (name == 'button-yes')
    {
      this.textEl.querySelector('button.yes').innerText = this.#textButtonYes;
    }
    else if (name == 'button-no')
    {
      this.textEl.querySelector('button.no').innerText = this.#textButtonNo;
    };
  };

  #initEvents() {
    let container = this.container;
    let textEl = this.textEl;
    container.delegateEventListener('div.mask', 'click', e => {
      if (this.disabled != true)
      {
        if (!textEl.classList.contains('on'))
        {
          this.#setZIndex();
          textEl.classList.add('on');
          textEl.dataset.opened = 'true';
          setTimeout(() => textEl.classList.add('show'), 100);
        };
      };
    });
    container.delegateEventListener('button.yes', 'click', e => {
      if (this.disabled != true)
      {
        textEl.dataset.opened = 'false';
        textEl.classList.remove('show');
        e.currentTarget.querySelector('div.slot > slot').assignedElements().forEach(el => el.click());
      };
    });
    container.delegateEventListener('button.no', 'click', e => {
      textEl.dataset.opened = 'false';
      textEl.classList.remove('show');
    });
    container.delegateEventListener('div.text', 'transitionend', e => {
      let self = e.target;
      if (self.dataset.opened == 'false' && !self.classList.contains('show'))
      {
        this.#unsetZIndex();
        self.classList.remove('on');
      };
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'disabled':
      {
        this.disabled = this.hasAttribute('disabled')? true: false;
        break;
      };
      case 'position':
      {
        this.position = newVal;
        break;
      };
      case 'text-tips':
      {
        this.#textTips = newVal;
        this.#updateText('tips');
        break;
      };
      case 'text-button-yes':
      {
        this.#textButtonYes = newVal;
        this.#updateText('button-yes');
        break;
      };
      case 'text-button-no':
      {
        this.#textButtonNo = newVal;
        this.#updateText('button-no');
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none">
        <div class="slot"><slot></slot></div>
        <div class="mask"></div>
        <div class="text">
          <div class="content">
            <div class="tips">${this.#textTips}</div>
            <div class="button"><button class="yes">${this.#textButtonYes}</button><button class="no">${this.#textButtonNo}</button></div>
          </div>
        </div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.textEl = this.container.querySelector('div.text');
    this.textEl.setAttribute('position', this.position);
    this.#initEvents();
  };
};