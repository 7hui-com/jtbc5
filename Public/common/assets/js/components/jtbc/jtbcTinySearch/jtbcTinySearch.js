export default class jtbcTinySearch extends HTMLElement {
  static get observedAttributes() {
    return ['url', 'keyword', 'placeholder', 'width'];
  };

  get keyword()
  {
    return this.container.querySelector('input.keyword').value;
  };

  set keyword(keyword)
  {
    let container = this.container;
    container.querySelector('input.keyword').value = keyword;
  };

  set placeholder(placeholder)
  {
    let container = this.container;
    container.querySelector('input.keyword').setAttribute('placeholder', placeholder);
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'url':
      {
        this.currentUrl = newVal;
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

  initEvents() {
    let container = this.container;
    container.delegateEventListener('span.btn', 'click', () => {
      if (this.currentUrl != null)
      {
        let target = this.getTarget();
        target.href = this.currentUrl + (this.keyword == ''? '': '&keyword=' + encodeURIComponent(this.keyword));
      };
      this.dispatchEvent(new CustomEvent('search', {detail: {keyword: this.keyword}, bubbles: true}));
    });
    container.querySelector('input.keyword').addEventListener('keyup', (e) => {
      if (e.which == 13)
      {
        container.querySelector('span.btn').click();
      };
    });
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
      <div class="container" style="display:none"><input type="text" name="keyword" class="keyword" autocomplete="off" /><span class="box"></span><span class="btn"><jtbc-svg name="search"></jtbc></span></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.currentUrl = null;
    this.container.loadComponents().then(() => { this.initEvents(); });
  };
};