export default class jtbcSyntaxHighlighter extends HTMLElement {
  static get observedAttributes() {
    return ['fontsize', 'language', 'value'];
  };

  set value(value) {
    this.currentValue = value;
    this.container.innerHTML = '';
    let preEl = document.createElement('pre');
    let codeEl = document.createElement('code');
    codeEl.append(this.currentValue);
    preEl.classList.add('language-' + this.currentLanguage);
    preEl.append(codeEl);
    this.container.append(preEl);
    if (this.inited == true)
    {
      this.init();
    };
  };

  setFontSize(fontSize) {
    this.container.style.fontSize = fontSize;
  };

  init() {
    if (this.inited == false)
    {
      this.inited = true;
    };
    this.container.querySelectorAll('code').forEach(el => {
      window.Prism.highlightElement(el);
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'fontsize':
      {
        this.setFontSize(newVal);
        break;
      };
      case 'language':
      {
        this.currentLanguage = newVal;
        break;
      };
      case 'value':
      {
        this.value = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
  };

  constructor() {
    super();
    this.ready = false;
    this.inited = false;
    this.currentValue = '';
    this.currentLanguage = 'markup';
    this.prismDir = import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/../../../vendor/prism/';
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importPrismCssUrl = this.prismDir + 'prism.css';
    let shadowRootHTML = `<style>@import url('${importPrismCssUrl}');</style><container></container>`;
    shadowRoot.innerHTML = shadowRootHTML;
    this.container = shadowRoot.querySelector('container');
    this.setFontSize('14px');
    if (window.Prism != undefined && window.Prism.inited == true)
    {
      this.init();
    }
    else
    {
      window.Prism = {'manual': true};
      let scriptpPrism = document.createElement('script');
      scriptpPrism.src = this.prismDir + 'prism.js';
      scriptpPrism.addEventListener('load', () => {
        window.Prism.inited = true;
        this.init();
      });
      shadowRoot.appendChild(scriptpPrism);
    };
  };
};