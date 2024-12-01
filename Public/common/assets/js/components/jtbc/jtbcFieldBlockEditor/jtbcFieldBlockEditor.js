import i18nZHCN from './i18n/zh-cn.js';
import imagePlugin from './plugins/imagePlugin.js';
import twoImagesPlugin from './plugins/twoImagesPlugin.js';
import audioPlugin from './plugins/audioPlugin.js';
import videoPlugin from './plugins/videoPlugin.js';
import mixedTextPlugin from './plugins/mixedTextPlugin.js';
import diagramPlugin from './plugins/diagramPlugin.js';
import memoPlugin from './plugins/memoPlugin.js';
import chartPlugin from './plugins/chartPlugin.js';
import quotePlugin from './plugins/quotePlugin.js';
import codePlugin from './plugins/codePlugin.js';
import delimiterPlugin from './plugins/delimiterPlugin.js';
import alignmentPlugin from './plugins/alignmentPlugin.js';
import langHelper from '../../../library/lang/langHelper.js';

export default class jtbcFieldBlockEditor extends HTMLElement {
  static get observedAttributes() {
    return ['action', 'value', 'disabled', 'height', 'lang', 'placeholder', 'tail'];
  };

  #editor = null;
  #height = 620;
  #minHeight = 620;
  #lang = 'zh-cn';
  #placeholder = null;
  #disabled = false;
  #value = null;
  #tail = null;
  #basePath = null;
  #iWindow = null;
  #iDocument = null;

  get name() {
    return this.getAttribute('name');
  };

  get editor() {
    return this.#editor;
  };

  get lang() {
    return this.#lang;
  };

  get placeholder() {
    return this.#placeholder;
  };

  get height() {
    return this.#height;
  };

  get value() {
    return this.#value ?? '';
  };

  get disabled() {
    return this.#disabled;
  };

  get tail() {
    return this.#tail;
  };

  get iWindow() {
    return this.#iWindow;
  };

  get iDocument() {
    return this.#iDocument;
  };

  set lang(lang) {
    this.#lang = langHelper.getStandardLang(lang);
  };

  set placeholder(placeholder) {
    this.#placeholder = placeholder;
  };

  set value(value) {
    this.#value = value;
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  set height(height) {
    this.#height = Math.max(this.#minHeight, Number.parseInt(height));
  };

  set tail(tail) {
    this.#tail = tail;
  };

  #getI18n() {
    return this.lang == 'zh-cn'? i18nZHCN: {};
  };

  #loadEditor(el) {
    let that = this;
    let container = this.container;
    let iWindow = this.#iWindow = el.contentWindow;
    let iDocument = this.#iDocument = el.contentDocument;
    let holder = iDocument.querySelector('div.editor');
    let dialog = iDocument.querySelector('div.dialog');
    let miniMessage = iDocument.querySelector('.miniMessage');
    if (holder != null && miniMessage != null)
    {
      const pluginConfig = {
        'action': this.action,
        'dialog': dialog,
        'miniMessage': miniMessage,
        'tail': this.tail,
        'iWindow': iWindow,
        'iDocument': iDocument,
      };
      const getData = () => {
        let result = null;
        let value = this.#value;
        if (typeof(value) == 'string' && value.length != 0)
        {
          try
          {
            result = JSON.parse(value);
          }
          catch(e) {};
        };
        return result;
      };
      holder.addEventListener('focusin', e => container.classList.add('focused'));
      holder.addEventListener('focusout', e => container.classList.remove('focused'));
      holder.addEventListener('keydown', function(e){
        if (e.keyCode === 122)
        {
          e.preventDefault();
          e.returnValue = false;
          if (that.isFullScreen())
          {
            document.body.classList.remove('f11');
            document.documentElement.style.overflow = null;
            that.container.classList.remove('fullscreen');
          }
          else
          {
            document.body.classList.add('f11');
            document.documentElement.style.overflow = 'hidden';
            that.container.classList.add('fullscreen');
          };
        }
        else if (e.keyCode === 27)
        {
          e.preventDefault();
          e.returnValue = false;
          if (that.isFullScreen())
          {
            document.body.classList.remove('f11');
            document.documentElement.style.overflow = null;
            that.container.classList.remove('fullscreen');
          };
        };
      });
      this.#editor = new iWindow.editorjs.main({
        'holder': holder,
        'logLevel': 'ERROR',
        'inlineToolbar': ['bold', 'italic', 'underline', 'strikethrough', 'marker', 'link', 'inlineCode'],
        'defaultBlock': 'paragraph',
        'tools': {
          'paragraph': {
            'class': iWindow.editorjs.plugins.paragraph,
            'tunes': ['alignment'],
            'config': {
              'preserveBlank': true,
            },
          },
          'header': {
            'class': iWindow.editorjs.plugins.header,
            'tunes': ['alignment'],
            'config': {
              'preserveBlank': true,
            },
          },
          'list': {
            'class': iWindow.editorjs.plugins.list,
            'inlineToolbar': true,
            'config': {
              'defaultStyle': 'ordered',
            },
          },
          'table': {
            'class': iWindow.editorjs.plugins.table,
            'inlineToolbar': true,
          },
          'image': {
            'class': imagePlugin,
            'config': pluginConfig,
          },
          'twoImages': {
            'class': twoImagesPlugin,
            'config': pluginConfig,
          },
          'audio': {
            'class': audioPlugin,
            'config': pluginConfig,
          },
          'video': {
            'class': videoPlugin,
            'config': pluginConfig,
          },
          'mixedText': {
            'class': mixedTextPlugin,
            'config': pluginConfig,
            'inlineToolbar': true,
          },
          'diagram': {
            'class': diagramPlugin,
            'config': pluginConfig,
            'inlineToolbar': true,
          },
          'memo': {
            'class': memoPlugin,
            'config': pluginConfig,
            'inlineToolbar': true,
          },
          'chart': {
            'class': chartPlugin,
            'config': pluginConfig,
          },
          'quote': {
            'class': quotePlugin,
            'config': pluginConfig,
            'inlineToolbar': true,
          },
          'code': {
            'class': codePlugin,
            'config': pluginConfig,
          },
          'delimiter': {
            'class': delimiterPlugin,
          },
          'underline': {
            'class': iWindow.editorjs.plugins.underline,
            'shortcut': 'Ctrl+U',
          },
          'strikethrough': {
            'class': iWindow.editorjs.plugins.strikethrough,
            'shortcut': 'Ctrl+D',
          },
          'marker': {
            'class': iWindow.editorjs.plugins.marker,
            'shortcut': 'Ctrl+M',
          },
          'inlineCode': {
            'class': iWindow.editorjs.plugins.inlineCode,
            'shortcut': 'Ctrl+O',
          },
          'alignment': {
            'class': alignmentPlugin,
          },
        },
        'data': getData(),
        'i18n': this.#getI18n(),
        'placeholder': this.placeholder,
        'onChange': function(api) {
          api.saver.save().then(data => {
            that.#value = JSON.stringify(data);
          });
        },
      });
    };
  };

  #initEditor() {
    let container = this.container;
    let iframe = container.querySelector('iframe.iframe');
    if (iframe != null)
    {
      iframe.dataset.height = this.height;
      iframe.style.height = iframe.dataset.height + 'px';
      iframe.addEventListener('load', e => this.#loadEditor(e.target));
      iframe.setAttribute('src', this.#basePath + 'editor.html');
    };
  };

  isFullScreen() {
    return this.container.classList.contains('fullscreen')? true: false;
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'action':
      {
        this.action = newVal;
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
      case 'height':
      {
        this.height = newVal;
        break;
      };
      case 'lang':
      {
        this.lang = newVal;
        break;
      };
      case 'placeholder':
      {
        this.placeholder = newVal;
        break;
      };
      case 'tail':
      {
        this.tail = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#initEditor();
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let basePath = import.meta.url.substring(0, import.meta.url.lastIndexOf('/') + 1);
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none">
        <div class="main"><iframe class="iframe" frameborder="0" scrolling="auto"></iframe></div>
        <div class="mask"></div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.#basePath = basePath;
    this.container = shadowRoot.querySelector('div.container');
  };
};