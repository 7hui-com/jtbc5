export default class jtbcEditor extends HTMLTextAreaElement {
  static get observedAttributes() {
    return ['value'];
  };

  #value = null;
  #interval = null;

  set value(value) {
    this.#value = value;
    if (this.editor) this.editor.resetContent(value);
  };

  get editor() {
    return this.ready? tinymce.get(this.id): null;
  };

  get contentType() {
    return 'html';
  };

  get value() {
    return this.editor? this.editor.getContent(): this.#value;
  };

  #isLoaded() {
    return typeof(tinymce) == 'object'? true: false;
  };

  insertContent(content) {
    if (this.editor != null)
    {
      this.editor.insertContent(content);
    };
  };

  init() {
    if (this.#isLoaded())
    {
      tinymce.remove();
      tinymce.init({
        autosave_ask_before_unload: false,
        statusbar: false,
        min_height: 300,
        skin: 'tinymce-5',
        selector: 'textarea[is=jtbc-editor]',
        plugins: 'advlist link lists image charmap preview searchreplace code codesample fullscreen insertdatetime media table visualblocks',
        toolbar1: 'blocks | fontfamily | bold italic underline strikethrough removeformat forecolor backcolor | alignleft aligncenter alignright alignjustify code',
        toolbar2: 'table bullist numlist outdent indent | link unlink image media hr subscript superscript insertdatetime | charmap codesample visualblocks searchreplace preview fullscreen',
        menubar: false,
        convert_urls: false,
        language:'zh-Hans',
        setup: function(editor)
        {
          editor.on('focus', e => {
            e.target.editorContainer.classList.add('tox-tinymce-inited');
            e.target.editorContainer.classList.add('tox-tinymce-focused');
          });
          editor.on('blur', e => {
            e.target.editorContainer.classList.remove('tox-tinymce-focused');
          });
        }
      }).then((editors) => { editors.forEach(editor => { document.querySelector('#' + editor.id).ready = true; }); });
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'value':
      {
        this.value = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    let scriptEl = document.querySelector('script.tinymce');
    if (scriptEl == null)
    {
      scriptEl = document.createElement('script');
      scriptEl.className = 'tinymce';
      scriptEl.dataset.count = 1;
      scriptEl.src = this.basePath + '../../../vendor/tinymce/tinymce.min.js';
      scriptEl.addEventListener('load', () => { this.init(); });
      document.querySelector('head').appendChild(scriptEl);
    }
    else
    {
      if (this.#isLoaded())
      {
        this.init();
      }
      else
      {
        let count = Number.parseInt(scriptEl.dataset.count);
        this.#interval = setInterval(() => {
          if (this.#isLoaded())
          {
            this.init();
            clearInterval(this.#interval);
          };
        }, 100 * count);
        scriptEl.dataset.count = count + 1;
      };
    };
  };

  constructor() {
    super();
    this.ready = false;
    this.basePath = import.meta.url.substring(0, import.meta.url.lastIndexOf('/') + 1);
    this.#value = super.value;
  };
};