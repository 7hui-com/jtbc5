import langHelper from '../../../library/lang/langHelper.js';

export default class jtbcFieldEditor extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'disabled', 'height', 'lang', 'placeholder'];
  };

  #height = 428;
  #minHeight = 428;
  #lang = 'zh-cn';
  #placeholder = null;
  #disabled = false;
  #value = null;
  #basePath = null;
  #iWindow = null;
  #iDocument = null;

  get name() {
    return this.getAttribute('name');
  };

  get lang() {
    return this.#lang;
  };

  get placeholder() {
    return this.#placeholder;
  };

  get contentType() {
    return 'html';
  };

  get height() {
    return this.#height;
  };

  get editor() {
    let result = null;
    let iWindow = this.#iWindow;
    let iDocument = this.#iDocument;
    if (iDocument != null)
    {
      let el = iDocument.querySelector('textarea.textarea');
      if (el != null)
      {
        result = iWindow.tinymce.get(el.id);
      };
    };
    return result;
  };

  get value() {
    return this.editor?.getContent() ?? this.#value ?? '';
  };

  get disabled() {
    return this.#disabled;
  };

  set lang(lang) {
    this.#lang = langHelper.getStandardLang(lang);
  };

  set placeholder(placeholder) {
    this.#placeholder = placeholder;
  };

  set value(value) {
    this.#value = value;
    this.editor?.resetContent(value);
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  set height(height) {
    this.#height = Math.max(this.#minHeight, Number.parseInt(height));
  };

  #loadEditor(el) {
    let container = this.container;
    let iWindow = this.#iWindow = el.contentWindow;
    let iDocument = this.#iDocument = el.contentDocument;
    let language = this.lang == 'zh-cn'? 'zh_CN': 'en';
    iDocument.querySelector('textarea.textarea').value = this.#value;
    iWindow.tinymce.init({
      license_key: 'gpl',
      autosave_ask_before_unload: false,
      statusbar: false,
      min_height: 300,
      skin: 'tinymce-5',
      selector: 'textarea.textarea',
      plugins: 'advlist link lists image charmap preview searchreplace code codesample fullscreen insertdatetime media table visualblocks emoticons',
      toolbar1: 'blocks | fontfamily | bold italic underline strikethrough removeformat | forecolor backcolor align lineheight | searchreplace fullscreen code',
      toolbar2: 'undo redo | table bullist numlist outdent indent | link unlink image media hr subscript superscript insertdatetime emoticons charmap codesample visualblocks preview',
      menubar: false,
      convert_urls: false,
      placeholder: this.placeholder,
      language: language,
      setup: function(editor) {
        editor.on('focus', e => container.classList.add('focused'));
        editor.on('blur', e => container.classList.remove('focused'));
        editor.on('FullscreenStateChanged', e => {
          if (e.state === true)
          {
            document.body.classList.add('f11');
            container.classList.add('fullscreen');
            document.documentElement.style.overflow = 'hidden';
          }
          else
          {
            document.body.classList.remove('f11');
            container.classList.remove('fullscreen');
            document.documentElement.style.overflow = null;
          };
        });
      },
    });
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

  insertContent(content) {
    this.editor?.insertContent(content);
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
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
        <div class="main"><iframe class="iframe" frameborder="0" scrolling="no"></iframe></div>
        <div class="mask"></div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.#basePath = basePath;
    this.container = shadowRoot.querySelector('div.container');
  };
};