export default class jtbcEditor extends HTMLTextAreaElement {
  static get observedAttributes() {
    return ['value'];
  };

  set value(value) {
    this.currentValue = value;
    if (this.editor) this.editor.resetContent(value);
  };

  get editor() {
    return this.ready? tinymce.get(this.id): null;
  };

  get value() {
    return this.editor? this.editor.getContent(): this.currentValue;
  };

  insertContent(content) {
    if (this.editor != null)
    {
      this.editor.insertContent(content);
    };
  };

  init() {
    if (typeof(tinymce) == 'object')
    {
      tinymce.remove();
      tinymce.init({
        autosave_ask_before_unload: false,
        statusbar: false,
        min_height: 300,
        selector: 'textarea[is=jtbc-editor]',
        plugins: ['advlist link image lists charmap preview hr searchreplace wordcount code codesample fullscreen insertdatetime media table visualblocks'],
        toolbar1: 'formatselect | fontselect | bold italic underline strikethrough removeformat forecolor backcolor | alignleft aligncenter alignright alignjustify code',
        toolbar2: 'table bullist numlist outdent indent | link unlink image media hr subscript superscript insertdatetime | charmap codesample visualblocks searchreplace preview fullscreen',
        menubar: false,
        language:'zh_CN'
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
    if (document.querySelector('script.tinymce'))
    {
      setTimeout(() => { this.init(); }, 100);
    }
    else
    {
      let scriptTinymce = document.createElement('script');
      scriptTinymce.className = 'tinymce';
      scriptTinymce.src = import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/../../../vendor/tinymce/tinymce.min.js';
      scriptTinymce.addEventListener('load', () => { this.init(); });
      document.querySelector('head').appendChild(scriptTinymce);
    };
  };

  constructor() {
    super();
    this.ready = false;
    this.currentValue = super.value;
  };
};