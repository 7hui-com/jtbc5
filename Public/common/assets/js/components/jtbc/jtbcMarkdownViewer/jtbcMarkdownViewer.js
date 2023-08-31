import langHelper from '../../../library/lang/langHelper.js';

export default class jtbcMarkdownViewer extends HTMLElement {
  static get observedAttributes() {
    return ['code-theme', 'theme', 'lang', 'value'];
  };

  #codeTheme = 'github';
  #theme = 'light';
  #lang = 'zh-cn';
  #value = null;
  #basePath = null;
  #libPath = null;
  #themePath = null;
  #pluginCss = null;
  #options = {
    'hljs': {
      'style': 'github',
      'lineNumber': true,
    },
    'lang': 'zh_CN',
    'theme': {
      'current': 'light',
      'path': null,
    },
  };

  get codeTheme() {
    return this.#codeTheme;
  };

  get theme() {
    return this.#theme;
  };

  get lang() {
    return this.#lang;
  };

  get value() {
    return this.#value ?? '';
  };

  set codeTheme(codeTheme) {
    this.#codeTheme = codeTheme;
    this.#options.hljs.style = codeTheme;
    if (this.inited === true)
    {
      this.vditor.setCodeTheme(codeTheme, this.#libPath);
    };
  };

  set theme(theme) {
    this.#theme = theme;
    this.#options.theme.current = theme;
    if (this.inited === true)
    {
      this.vditor.setContentTheme(theme, this.#themePath);
    };
  };

  set lang(lang) {
    let langMap = {'zh-cn': 'zh_CN', 'en': 'en_US'};
    this.#lang = langHelper.getStandardLang(lang);
    this.#options.lang = langMap[this.#lang];
  };

  set value(value) {
    this.#value = value;
    this.render();
  };

  #initVditor(el) {
    let pluginCss = this.#pluginCss;
    let iDocument =  el.contentDocument;
    this.vditor = el.contentWindow.Vditor;
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
    this.vditor.preview(contentEl, this.value, this.getOptions(el));
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
    this.#options.theme.path = this.#themePath;
    this.#options.after = () => {
      this.inited = true;
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
      case 'code-theme':
      {
        this.codeTheme = newVal;
        break;
      };
      case 'theme':
      {
        this.theme = newVal;
        break;
      };
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
    this.vditor = null;
    this.inited = false;
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let basePath = import.meta.url.substring(0, import.meta.url.lastIndexOf('/') + 1);
    let shadowRootHTML = `<style>@import url('${importCssUrl}');</style><container style="display:none"></container>`;
    shadowRoot.innerHTML = shadowRootHTML;
    this.#basePath = basePath;
    this.#libPath = basePath + '../../../vendor/vditor';
    this.#themePath = this.#libPath + '/dist/css/content-theme';
    this.#pluginCss = this.getAttribute('plugin_css');
    this.container = shadowRoot.querySelector('container');
  };
};