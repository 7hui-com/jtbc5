export default class jtbcCodeDiff extends HTMLElement {
  static get observedAttributes() {
    return ['mime', 'mode', 'leftvalue', 'rightvalue'];
  };

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    return this.codeMirror == null? this.leftValue: this.codeMirror.editor().getValue();
  };

  getOptions() {
    let options = {
      value: this.leftValue,
      orig: this.rightValue,
      lineNumbers: true,
      mode: this.mime,
      highlightDifferences: true,
      connect: null,
      collapseIdentical: false,
      readOnly: false,
      revertButtons: true,
      theme: this.getAttribute('theme') ?? 'default',
    };
    if (this.hasAttribute('readonly'))
    {
      options.readOnly = true;
      options.revertButtons = false;
    };
    return options;
  };

  setHeight(height) {
    if (this.codeMirror != null)
    {
      this.codeMirror.wrap.style.height = height;
      this.codeMirror.editor()?.setSize(null, height);
      this.codeMirror.leftOriginal()?.setSize(null, height);
      this.codeMirror.rightOriginal()?.setSize(null, height);
      window.dispatchEvent(new Event('resize'));
    };
  };

  update() {
    if (this.inited == true && this.mime != null && this.leftValue != null && this.rightValue != null)
    {
      this.container.html('').then(() => {
        this.codeMirror = CodeMirror.MergeView(this.container, this.getOptions());
      });
    };
  };

  init() {
    if (this.inited == false)
    {
      this.inited = true;
      let mode = this.modeList.includes(this.mode)? this.mode: 'css';
      let modeMap = {
        'clike': {
          'mime': ['ext/x-csrc', 'text/x-c++src', 'text/x-java', 'text/x-csharp', 'text/x-objectivec'],
          'files': ['clike'],
        },
        'css': {
          'mime': ['text/css'],
          'files': ['css'],
        },
        'go': {
          'mime': ['text/x-go'],
          'files': ['go'],
        },
        'htmlmixed': {
          'mime': ['text/html'],
          'files': ['htmlmixed', 'xml', 'javascript', 'css'],
        },
        'javascript': {
          'mime': ['text/javascript', 'application/json'],
          'files': ['javascript'],
        },
        'php': {
          'mime': ['text/x-php'],
          'files': ['php', 'clike'],
        },
        'python': {
          'mime': ['text/x-python', 'text/x-cython'],
          'files': ['python'],
        },
        'shell': {
          'mime': ['text/x-sh', 'application/x-sh'],
          'files': ['shell'],
        },
        'sql': {
          'mime': ['text/x-mysql', 'text/x-sql', 'text/x-mssql'],
          'files': ['sql'],
        },
        'xml': {
          'mime': ['application/xml', 'text/html'],
          'files': ['xml'],
        },
      };
      let map = modeMap[mode];
      let filesLoaded = 0;
      let filesCount = map.files.length;
      map.files.forEach(file => {
        let script = document.createElement('script');
        script.addEventListener('load', e => {
          filesLoaded += 1;
          if (filesLoaded == filesCount)
          {
            this.mime = map.mime.includes(this.mime)? this.mime: map.mime[0];
            this.update();
          };
        });
        script.src = this.codemirrorDir + '/mode/' + file + '/' + file + '.js';
        this.container.parentNode.insertBefore(script, this.container);
      });
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'mime':
      {
        this.mime = newVal;
        break;
      };
      case 'mode':
      {
        this.mode = newVal;
        break;
      };
      case 'leftvalue':
      {
        this.leftValue = newVal;
        this.update();
        break;
      };
      case 'rightvalue':
      {
        this.rightValue = newVal;
        this.update();
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let codemirrorDir = import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/../../../vendor/codemirror';
    let shadowRootHTML = `
      <style>@import url('${codemirrorDir}/lib/codemirror.css');</style>
      <style>@import url('${codemirrorDir}/theme/eclipse.css');</style>
      <style>@import url('${codemirrorDir}/theme/monokai.css');</style>
      <style>@import url('${codemirrorDir}/addon/merge/merge.css');</style>
      <script type="text/javascript" src="${codemirrorDir}/"></script>
      <container></container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.mime = null;
    this.mode = 'htmlmixed';
    this.inited = false;
    this.leftValue = null;
    this.rightValue = null;
    this.modeList = ['clike', 'css', 'go', 'htmlmixed', 'javascript', 'php', 'python', 'shell', 'sql', 'xml'];
    this.codeMirror = null;
    this.codemirrorDir = codemirrorDir;
    this.container = shadowRoot.querySelector('container');
    let codemirrorJs = codemirrorDir + '/lib/codemirror.js';
    let codemirrorScript = document.createElement('script');
    codemirrorScript.src = codemirrorJs;
    shadowRoot.insertBefore(codemirrorScript, this.container);
    codemirrorScript.addEventListener('load', () => {
      let others = [
        '/addon/merge/merge.js',
        '/../diff-match-patch/diff_match_patch.js',
      ];
      let othersLoaded = 0;
      let othersCount = others.length;
      others.forEach(item => {
        let script = document.createElement('script');
        script.src = this.codemirrorDir + item;
        this.container.parentNode.insertBefore(script, this.container);
        script.addEventListener('load', () => {
          othersLoaded += 1;
          if (othersLoaded == othersCount)
          {
            this.init();
          };
        });
      });
    });
  };
};