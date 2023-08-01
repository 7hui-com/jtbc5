export default class jtbcTimeline extends HTMLElement {
  static get observedAttributes() {
    return ['mode'];
  };

  #index = 0;
  #mode = 'standard';

  get mode() {
    return this.#mode;
  };

  set mode(mode) {
    this.#mode = mode;
    this.container.setAttribute('mode', mode);
  };

  #getNextIndex() {
    this.#index += 1;
    return this.#index;
  };

  #initEvent() {
    this.mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => mutation.target.render());
    });
    this.mutationObserver.observe(this, {'childList': true, 'subtree': true});
  };

  render() {
    let children = this.children;
    let container = this.container.empty();
    for (let i = 0; i < children.length; i++)
    {
      let child = children[i];
      if ('time' in child.dataset)
      {
        let currentIndex = this.#getNextIndex();
        child.setAttribute('slot', 'slot-' + currentIndex);
        let item = document.createElement('div');
        let divTime = document.createElement('div');
        let divContent = document.createElement('div');
        let divContentSlot = document.createElement('slot');
        item.classList.add('item');
        divTime.classList.add('time');
        divTime.innerText = child.dataset.time;
        divContent.classList.add('content');
        divContentSlot.setAttribute('name', 'slot-' + currentIndex);
        divContent.append(divContentSlot);
        item.append(divTime, divContent);
        if ('dotcolor' in child.dataset)
        {
          item.style.setProperty('--dot-color', child.dataset.dotcolor);
        };
        container.append(item);
      };
    };
    this.dispatchEvent(new CustomEvent('renderend', {bubbles: true}));
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'mode':
      {
        this.mode = newVal;
        break;
      };
      default:
      {
        this.style.setProperty('--' + attr, newVal);
      };
    };
  };

  connectedCallback() {
    this.render();
    this.ready = true;
  };

  disconnectedCallback() {
    this.mutationObserver?.disconnect();
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" mode="standard" style="display:none"></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.#initEvent();
  };
};