export default class jtbcFieldMarkdownEditor extends HTMLElement {
  static get observedAttributes() {
    return ['toolbar', 'value', 'disabled', 'width', 'height', 'placeholder'];
  };

  #disabled = false;
  #toolbar = 'standard';
  #toolbarGroup = {
    'tiny': ['bold', 'italic', 'strikethrough', 'heading', '|', 'undo', 'redo'],
    'basic': ['bold', 'italic', 'strikethrough', 'heading', '|', 'unordered-list', 'ordered-list', '|', 'undo', 'redo'],
    'standard': ['bold', 'italic', 'strikethrough', 'heading', '|', 'unordered-list', 'ordered-list', 'horizontal-rule', 'link', 'image', 'table', 'code', '|', 'undo', 'redo', '|', 'side-by-side', 'fullscreen'],
    'full': ['bold', 'italic', 'strikethrough', 'heading', '|', 'unordered-list', 'ordered-list', 'horizontal-rule', 'link', 'image', 'table', 'code', 'quote', 'clean-block', '|', 'undo', 'redo', '|', 'preview', 'side-by-side', 'fullscreen'],
  };
  #options = {
    'autoDownloadFontAwesome': false,
    'spellChecker': false,
    'minHeight': '300px',
    'maxHeight': '300px',
    'sideBySideFullscreen': false,
    'status': false,
    'renderingConfig': {
      'sanitizerFunction': renderedHTML => DOMPurify.sanitize(renderedHTML),
    },
    'onToggleFullScreen': full => { this.#toggleFullScreen(full); },
  };
  #value = null;
  easyMDE = null;

  get name() {
    return this.getAttribute('name');
  };

  get contentType() {
    return 'markdown';
  };

  get value() {
    let result = '';
    if (this.easyMDE != null)
    {
      result = this.easyMDE.value();
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

  set value(value) {
    this.#value = value;
    if (this.easyMDE != null)
    {
      this.easyMDE.value(this.#value);
    };
  };

  set disabled(disabled) {
    if (disabled == true)
    {
      this.container.classList.add('disabled');
    }
    else
    {
      this.container.classList.remove('disabled');
    };
    this.#disabled = disabled;
  };

  #loadEasyMDE() {
    let container = this.container;
    if (typeof EasyMDE == 'undefined')
    {
      return new Promise((resolve) => {
        let parentNode = container.parentNode;
        let mdeScript = document.createElement('script');
        mdeScript.src = this.easyMDEPath + 'easymde.min.js';
        parentNode.insertBefore(mdeScript, container);
        mdeScript.addEventListener('load', () => resolve(this));
      });
    }
    else
    {
      return new Promise((resolve) => { resolve(this); });
    };
  };

  #loadDOMPurify() {
    let container = this.container;
    if (typeof DOMPurify == 'undefined')
    {
      return new Promise((resolve) => {
        let parentNode = container.parentNode;
        let purifyScript = document.createElement('script');
        purifyScript.src = this.easyMDEPath + '../DOMPurify/purify.min.js';
        parentNode.insertBefore(purifyScript, container);
        purifyScript.addEventListener('load', () => resolve(this));
      });
    }
    else
    {
      return new Promise((resolve) => { resolve(this); });
    };
  };

  #initEditor() {
    Promise.all([this.#loadEasyMDE(), this.#loadDOMPurify()]).then(() => {
      this.#options['toolbar'] = this.#toolbarGroup[this.#toolbar];
      this.#options['element'] = this.container.querySelector('textarea.mde');
      this.easyMDE = new EasyMDE(this.#options);
      if (this.#value != null)
      {
        this.easyMDE.value(this.#value);
      };
      this.dispatchEvent(new CustomEvent('inited', {bubbles: true}));
      this.#initEvents();
    }).catch(() => {
      throw new Error('Unexpected error');
    });
  };

  #initEvents() {
    let container = this.container;
    this.easyMDE.codemirror.on('focus', () => {
      container.classList.add('on');
      this.dispatchEvent(new CustomEvent('focused', {bubbles: true}));
    });
    this.easyMDE.codemirror.on('blur', () => {
      container.classList.remove('on');
      this.dispatchEvent(new CustomEvent('blurred', {bubbles: true}));
    });
    this.easyMDE.codemirror.on('change', () => {
      this.dispatchEvent(new CustomEvent('changed', {bubbles: true}));
    });
  };

  #setOptions(key, value) {
    this.#options[key] = value;
    return this;
  };

  #toggleFullScreen(full) {
    let container = this.container;
    if (full === true)
    {
      container.classList.add('fullscreen');
      document.body.classList.add('tox-fullscreen');
    }
    else
    {
      container.classList.remove('fullscreen');
      document.body.classList.remove('tox-fullscreen');
    };
  };

  insertContent(content) {
    if (this.easyMDE != null)
    {
      this.easyMDE.codemirror.replaceSelection(content);
      this.easyMDE.codemirror.focus();
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
          this.#setOptions('minHeight', newVal + 'px').#setOptions('maxHeight', newVal + 'px');
        }
        else
        {
          throw new Error('Unexpected value');
        };
        break;
      };
      case 'placeholder':
      {
        this.#setOptions('placeholder', newVal);
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
    let basePath = import.meta.url.substring(0, import.meta.url.lastIndexOf('/') + 1);
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let easyMDEPath = basePath + '../../../vendor/easymde/';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <link rel="stylesheet" href="${easyMDEPath}easymde.min.css" />
      <link rel="stylesheet" href="${easyMDEPath}fontawesome/adapter.css" />
      <container style="display:none">
        <div class="main"><textarea class="mde"></textarea></div>
        <div class="mask"></div>
      </container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.easyMDEPath = easyMDEPath;
    this.container = shadowRoot.querySelector('container');
  };
};