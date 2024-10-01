export default class jtbcTinySearch extends HTMLElement {
  static get observedAttributes() {
    return ['url', 'keyword', 'placeholder', 'width'];
  };

  #url = null;

  get url() {
    return this.#url;
  };

  get keyword() {
    return this.container.querySelector('input.keyword').value;
  };

  set url(url) {
    this.#url = url;
  };

  set keyword(keyword) {
    let container = this.container;
    container.querySelector('input.keyword').value = keyword;
  };

  set placeholder(placeholder) {
    let container = this.container;
    container.querySelector('input.keyword').setAttribute('placeholder', placeholder);
  };

  #initEvents() {
    let container = this.container;
    container.delegateEventListener('div.btn', 'click', e => {
      if (this.url != null)
      {
        let target = this.getTarget();
        target.href = this.url + (this.keyword == ''? '': '&keyword=' + encodeURIComponent(this.keyword));
      };
      this.dispatchEvent(new CustomEvent('search', {detail: {keyword: this.keyword}, bubbles: true}));
    });
    container.querySelector('input.keyword').addEventListener('focus', e => container.classList.add('on'));
    container.querySelector('input.keyword').addEventListener('blur', e => container.classList.remove('on'));
    container.querySelector('input.keyword').addEventListener('keyup', e => {
      if (e.which == 13)
      {
        container.querySelector('div.btn').click();
      };
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'url':
      {
        this.url = newVal;
        break;
      };
      case 'keyword':
      {
        this.keyword = newVal;
        break;
      };
      case 'placeholder':
      {
        this.placeholder = newVal;
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
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none">
        <div class="input"><input type="text" name="keyword" class="keyword" autocomplete="off" /></div>
        <div class="btn"><jtbc-svg name="search"></jtbc></div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.container.loadComponents().then(() => { this.#initEvents(); });
  };
};