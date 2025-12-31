import langHelper from '../../../library/lang/langHelper.js';

export default class jtbcFieldMarkdownEditor extends HTMLElement {
  static get observedAttributes() {
    return ['toolbar', 'value', 'disabled', 'width', 'height', 'lang', 'placeholder'];
  };

  #lang = 'zh-cn';
  #editor = null;
  #disabled = false;
  #toolbar = 'standard';
  #toolbarGroup = {
    'tiny': ['headings', 'bold', 'italic', 'strike', '|', 'undo', 'redo'],
    'basic': ['headings', 'bold', 'italic', 'strike', '|', 'list', 'ordered-list', '|', 'undo', 'redo'],
    'standard': ['headings', 'bold', 'italic', 'strike', 'link', '|', 'list', 'ordered-list', 'check', 'outdent', 'indent', 'insert-before', 'insert-after', '|', 'undo', 'redo', '|', 'line', 'quote', 'table', 'code', 'inline-code', 'fullscreen', 'edit-mode'],
  };
  #options = {
    'height': 400,
    'lang': 'zh_CN',
    'placeholder': '',
    'preview': {
      'maxWidth': 4096,
      'theme': {},
    },
    'counter': {
      'enable': true,
      'type': 'text',
    },
    'cache': {
      'enable': false,
    },
    'customWysiwygToolbar': function(type, el) {
    },
  };
  #value = null;
  #basePath = null;
  #libPath = null;
  #iWindow = null;
  #iDocument = null;

  get name() {
    return this.getAttribute('name');
  };

  get lang() {
    return this.#lang;
  };

  get contentType() {
    return 'markdown';
  };

  get value() {
    let result = '';
    let editor = this.#editor;
    if (editor != null)
    {
      result = editor.getValue();
      if (result.length == 1 && result == String.fromCharCode(10))
      {
        result = '';
      };
    }
    else
    {
      result = this.#value ?? '';
    };
    return result;
  };

  get disabled() {
    return this.#disabled;
  };

  set lang(lang) {
    let langMap = {'zh-cn': 'zh_CN', 'en': 'en_US'};
    this.#lang = langHelper.getStandardLang(lang);
    this.#options.lang = langMap[this.#lang];
  };

  set value(value) {
    this.#value = value;
    let editor = this.#editor;
    if (editor != null)
    {
      editor.setValue(value);
    };
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #setHeight(height) {
    this.#options.height = height;
  };

  #setPlaceholder(placeholder) {
    this.#options.placeholder = placeholder;
  };

  #toggleFullscreen(fullscreen) {
    let container = this.container;
    let iDocument = this.#iDocument;
    let iframe = container.querySelector('iframe.iframe');
    if (iframe != null)
    {
      if (fullscreen == true)
      {
        document.body.classList.add('f11');
        container.classList.add('fullscreen');
        document.documentElement.style.overflow = 'hidden';
        iframe.style.height = document.documentElement.clientHeight + 'px';
      }
      else
      {
        document.body.classList.remove('f11');
        container.classList.remove('fullscreen');
        document.documentElement.style.overflow = null;
        iframe.style.height = iframe.dataset.height + 'px';
        if (iDocument != null)
        {
          let el = iDocument.querySelector('div.editor');
          el.querySelectorAll('button.vditor-tooltipped').forEach(item => {
            if (item.classList.contains('vditor-tooltipped__n'))
            {
              item.classList.add('vditor-tooltipped__s');
              item.classList.remove('vditor-tooltipped__n');
            }
            else if (item.classList.contains('vditor-tooltipped__ne'))
            {
              item.classList.add('vditor-tooltipped__se');
              item.classList.remove('vditor-tooltipped__ne');
            }
            else if (item.classList.contains('vditor-tooltipped__nw'))
            {
              item.classList.add('vditor-tooltipped__sw');
              item.classList.remove('vditor-tooltipped__nw');
            };
          });
        };
      };
    };
  };

  #initEditor() {
    let container = this.container;
    let iframe = container.querySelector('iframe.iframe');
    if (iframe != null)
    {
      iframe.dataset.height = this.#options.height;
      iframe.style.height = iframe.dataset.height + 'px';
      iframe.addEventListener('load', e => this.#initVditor(e.target));
      iframe.setAttribute('src', this.#basePath + 'editor.html');
    };
  };

  #initEvents() {
    this.resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        let container = this.container;
        if (container.classList.contains('fullscreen'))
        {
          let iframe = container.querySelector('iframe.iframe');
          if (iframe != null)
          {
            iframe.style.height = document.documentElement.clientHeight + 'px';
          };
        };
      });
    });
    this.resizeObserver.observe(document.documentElement);
  };

  #initVditor(el) {
    let iWindow = this.#iWindow = el.contentWindow;
    let iDocument = this.#iDocument = el.contentDocument;
    this.#editor = new iWindow.Vditor(iDocument.querySelector('div.editor'), this.getOptions());
  };

  #initVditorAfter(value) {
    this.ready = true;
    let iDocument = this.#iDocument;
    if (iDocument != null)
    {
      let editor = this.#editor;
      let el = iDocument.querySelector('div.editor');
      let observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.target.classList.contains('vditor--fullscreen'))
          {
            this.#toggleFullscreen(true);
          }
          else
          {
            this.#toggleFullscreen(false);
          };
        });
      });
      observer.observe(el, {'attributes': true, 'attributeFilter': ['class']});
      if (this.#value != null) editor.setValue(this.#value);
      this.#toggleFullscreen(false);
    };
    this.dispatchEvent(new CustomEvent('inited', {bubbles: true}));
  };

  getOptions() {
    this.#options.cdn = this.#libPath;
    this.#options.preview.theme.path = this.#libPath + '/dist/css/content-theme';
    this.#options.toolbar = this.#toolbarGroup[this.#toolbar];
    this.#options.after = value => this.#initVditorAfter(value);
    this.#options.focus = value => {
      this.container.classList.add('on');
      this.dispatchEvent(new Event('focus'));
    };
    this.#options.blur = value => {
      this.container.classList.remove('on');
      this.dispatchEvent(new Event('blur'));
    };
    this.#options.input = value => {
      this.dispatchEvent(new Event('input'));
    };
    return this.#options;
  };

  insertContent(content) {
    let editor = this.#editor;
    if (editor != null)
    {
      editor.insertValue(content);
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'toolbar':
      {
        if (this.#toolbarGroup.hasOwnProperty(newVal))
        {
          this.#toolbar = newVal;
        }
        else
        {
          throw new Error('Unexpected value');
        };
        break;
      };
      case 'value':
      {
        this.value = newVal;
        break;
      };
      case 'disabled':
      {
        this.disabled = this.hasAttribute('disabled')? true: false;
        break;
      };
      case 'width':
      {
        this.style.width = isFinite(newVal)? newVal + 'px': newVal;
        break;
      };
      case 'height':
      {
        if (isFinite(newVal))
        {
          this.#setHeight(Number.parseInt(newVal));
        }
        else
        {
          throw new Error('Unexpected value');
        };
        break;
      };
      case 'lang':
      {
        this.lang = newVal;
        break;
      };
      case 'placeholder':
      {
        this.#setPlaceholder(newVal);
        break;
      };
    };
  };

  connectedCallback() {
    this.#initEditor();
    this.#initEvents();
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  disconnectedCallback() {
    this.resizeObserver?.disconnect();
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let basePath = import.meta.url.substring(0, import.meta.url.lastIndexOf('/') + 1);
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <container style="display:none">
        <div class="main"><iframe class="iframe" frameborder="0" scrolling="no"></iframe></div>
        <div class="mask"></div>
      </container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.#basePath = basePath;
    this.#libPath = basePath + '../../../vendor/vditor';
    this.container = shadowRoot.querySelector('container');
  };
};