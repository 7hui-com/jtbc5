import { animate } from '../../../vendor/anime/anime.esm.min.js';

export default class jtbcReadmore extends HTMLElement {
  static get observedAttributes() {
    return ['max-height'];
  };

  #locked = false;
  #maxHeight = 200;
  #contentHeight = null;

  get duration() {
    let result = 600;
    if (Number.isInteger(this.maxHeight) && Number.isInteger(this.contentHeight))
    {
      if (this.contentHeight > this.maxHeight)
      {
        result = (this.contentHeight - this.maxHeight) / 3 * 2;
      };
    };
    return result;
  };

  get maxHeight() {
    return this.#maxHeight;
  };

  get contentHeight() {
    return this.#contentHeight;
  };

  set maxHeight(maxHeight) {
    if (isFinite(maxHeight))
    {
      this.#maxHeight = Number.parseInt(maxHeight);
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  #resize(entry) {
    let el = entry.target;
    if (!el.classList.contains('unfolded'))
    {
      let maxHeight = this.maxHeight;
      let scrollHeight = el.scrollHeight;
      this.#contentHeight = scrollHeight;
      if (scrollHeight < maxHeight)
      {
        el.style.height = 'auto';
        el.parentElement.setAttribute('fold', 'none');
      }
      else
      {
        el.style.height = maxHeight + 'px';
        el.parentElement.setAttribute('fold', 'true');
      };
    };
  };

  #initEvents() {
    let that = this;
    let content = this.container.querySelector('div.content');
    this.resizeObserver =  new ResizeObserver(entries => {
      entries.forEach(entry => this.#resize(entry));
    });
    this.resizeObserver.observe(content);
    this.container.delegateEventListener('div.fold', 'click', e => {
      if (!that.isLocked())
      {
        that.#locked = true;
        content.style.height = this.contentHeight + 'px';
        animate(content, {
          height: this.maxHeight,
          duration: this.duration,
          ease: 'inOutQuint',
          onComplete: function() {
            that.#locked = false;
            content.classList.remove('unfolded');
            content.parentElement.setAttribute('fold', 'true');
            that.dispatchEvent(new CustomEvent('folded'));
          },
        });
      };
    });
    this.container.delegateEventListener('div.unfold', 'click', e => {
      if (!that.isLocked())
      {
        that.#locked = true;
        content.classList.add('unfolded');
        animate(content, {
          height: this.contentHeight,
          duration: this.duration,
          ease: 'inOutQuint',
          onComplete: function() {
            that.#locked = false;
            content.style.height = 'auto';
            content.parentElement.setAttribute('fold', 'false');
            that.dispatchEvent(new CustomEvent('unfolded'));
          },
        });
      };
    });
  };

  isLocked() {
    let result = false;
    if (this.#locked !== false)
    {
      result = true;
    };
    return result;
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'max-height':
      {
        this.maxHeight = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
  };

  disconnectedCallback() {
    this.resizeObserver?.disconnect();
  };

  constructor() {
    super();
    this.ready = false;
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none">
        <div class="content"><slot></slot></div>
        <div class="unfold"><slot name="btn-unfold"><div class="btn" part="btn-unfold"><jtbc-svg name="arrow_down"></jtbc-svg></div></slot></div>
        <div class="fold"><slot name="btn-fold"><div class="btn" part="btn-fold"><jtbc-svg name="arrow_up"></jtbc-svg></div></slot></div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.container = shadowRoot.querySelector('div.container');
    this.container.loadComponents().then(result => this.#initEvents());
  };
};