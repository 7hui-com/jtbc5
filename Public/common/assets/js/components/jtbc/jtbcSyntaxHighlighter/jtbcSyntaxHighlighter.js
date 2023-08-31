export default class jtbcSyntaxHighlighter extends HTMLElement {
  static get observedAttributes() {
    return ['fontsize', 'language', 'value'];
  };

  #value = '';
  #language = 'markup';
  #fontSize = '14px';

  get value() {
    return this.#value;
  };

  get language() {
    return this.#language;
  };

  set value(value) {
    this.#value = value;
    this.syncValue();
  };

  #resetHeight() {
    this.iFrame.style.height = this.iFrame.contentDocument.documentElement.offsetHeight + 'px';
  };

  syncValue() {
    if (this.iFrameReady == true)
    {
      this.iFrame.contentDocument.body.innerHTML = '';
      let preEl = document.createElement('pre');
      let codeEl = document.createElement('code');
      codeEl.append(this.#value);
      preEl.classList.add('line-numbers');
      preEl.classList.add('language-' + this.#language);
      preEl.style.whiteSpace = 'pre-wrap';
      preEl.style.margin = '0px';
      preEl.style.borderRadius = '0px';
      preEl.append(codeEl);
      this.iFrame.contentDocument.body.append(preEl);
      this.iFrame.contentDocument.body.style.fontSize = this.#fontSize;
      if (this.iFrame.contentWindow.hasOwnProperty('Prism'))
      {
        this.iFrame.contentWindow.Prism.highlightElement(codeEl);
        this.#resetHeight();
      };
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'fontsize':
      {
        this.#fontSize = newVal;
        break;
      };
      case 'language':
      {
        this.#language = newVal;
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
    let basePath = import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/';
    let libPath = basePath + '../../../vendor/prism';
    let shadowRoot = this.attachShadow({mode: 'open'});
    let shadowRootHTML = `
      <style type="text/css">
      :host {
        display: block
      }
      div.container iframe {
        width: 100%; height: 0px; vertical-align: top
      }
      </style>
      <div class="container"><iframe frameborder="0"></iframe></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.container = shadowRoot.querySelector('div.container');
    this.iFrame = this.container.querySelector('iframe');
    this.iFrame.addEventListener('load', () => {
      this.iFrameReady = true;
      let prismCss = document.createElement('link');
      let prismjs = document.createElement('script');
      prismCss.setAttribute('type', 'text/css');
      prismCss.setAttribute('rel', 'stylesheet');
      prismCss.setAttribute('href', libPath + '/prism.css');
      prismjs.addEventListener('load', () => {
        this.iFrame.contentWindow.Prism.manual = true;
        this.iFrame.contentDocument.querySelectorAll('code').forEach(el => {
          this.iFrame.contentWindow.Prism.highlightElement(el);
        });
        this.#resetHeight();
      });
      prismjs.setAttribute('src', libPath + '/prism.js');
      this.iFrame.contentDocument.head.appendChild(prismCss);
      this.iFrame.contentDocument.head.appendChild(prismjs);
      this.iFrame.contentWindow.addEventListener('resize', () => {
        this.#resetHeight();
      });
      this.syncValue();
    });
    this.iFrame.setAttribute('src', basePath + 'highlighter.html');
  };
};