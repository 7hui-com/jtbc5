export default class jtbcMarkdownViewer extends HTMLElement {
  static get observedAttributes() {
    return ['lang', 'value'];
  };

  #lang = 'zh-cn';
  #value = null;
  #basePath = null;
  #libPath = null;
  #pluginCss = null;
  #options = {
    'lang': 'zh_CN',
    'theme': {},
  };

  get lang() {
    return this.#lang;
  };

  get value() {
    return this.#value ?? '';
  };

  set lang(lang) {
    if (['0', 'zh-cn'].includes(lang))
    {
      this.#lang = 'zh-cn';
      this.#options.lang = 'zh_CN';
    }
    else if (['1', 'en'].includes(lang))
    {
      this.#lang = 'en';
      this.#options.lang = 'en_US';
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  set value(value) {
    this.#value = value;
    this.render();
  };

  #initVditor(el) {
    let pluginCss = this.#pluginCss;
    let iWindow = el.contentWindow;
    let iDocument =  el.contentDocument;
    if (pluginCss != null)
    {
      let pluginStyle = document.createElement('link');
      pluginStyle.setAttribute('type', 'text/css');
      pluginStyle.setAttribute('rel', 'stylesheet');
      pluginStyle.setAttribute('href', pluginCss);
      iDocument.head.appendChild(pluginStyle);
    };
    let contentEl = iDocument.querySelector('div.content');
    this.resizeObserver = new ResizeObserver(entries => this.#resize(entries, contentEl));
    this.resizeObserver.observe(contentEl);
    iWindow.Vditor.preview(contentEl, this.value, this.getOptions(el));
  };

  #resize(entries, contentEl) {
    let container = this.container;
    let iframe = container.querySelector('iframe.iframe');
    if (iframe != null)
    {
      iframe.style.height = contentEl.scrollHeight + 'px';
    };
  };

  getOptions(el) {
    this.#options.cdn = this.#libPath;
    this.#options.theme.path = this.#libPath + '/dist/css/content-theme';
    this.#options.after = () => {
      this.#resize(null, el);
      this.dispatchEvent(new CustomEvent('renderend', {detail: {'el': el}}));
    };
    return this.#options;
  };

  render() {
    let container = this.container.empty();
    let iframe = document.createElement('iframe');
    iframe.classList.add('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.addEventListener('load', e => this.#initVditor(e.target));
    iframe.setAttribute('src', this.#basePath + 'content.html');
    container.append(iframe);
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'lang':
      {
        this.lang = newVal;
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

  disconnectedCallback() {
    this.resizeObserver?.disconnect();
  };

  constructor() {
    super();
    this.ready = false;
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let basePath = import.meta.url.substring(0, import.meta.url.lastIndexOf('/') + 1);
    let shadowRootHTML = `<style>@import url('${importCssUrl}');</style><container style="display:none"></container>`;
    shadowRoot.innerHTML = shadowRootHTML;
    this.#basePath = basePath;
    this.#libPath = basePath + '../../../vendor/vditor';
    this.#pluginCss = this.getAttribute('plugin_css');
    this.container = shadowRoot.querySelector('container');
  };
};