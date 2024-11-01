export default class jtbcFieldCodeEditor extends HTMLElement {
  static get observedAttributes() {
    return ['mode', 'mime', 'value', 'disabled', 'width', 'height'];
  };

  #width = null;
  #currentWidth = null;
  #disabled = false;

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    return this.codeMirror == null? this.textarea.value: this.codeMirror.getValue();
  };

  get disabled() {
    return this.#disabled;
  };

  get hintBase() {
    let result = [];
    if ('hintBase' in this.dataset)
    {
      try
      {
        result = JSON.parse(this.dataset.hintBase);
      }
      catch(e) {};
    };
    return result;
  };

  set value(value) {
    if (this.codeMirror == null)
    {
      this.textarea.value = value;
    }
    else
    {
      this.codeMirror.setValue(value);
    };
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #bindEvents(cm) {
    cm.on('change', instance => {
      this.dispatchEvent(new CustomEvent('changed', {detail: {'instance': instance}, bubbles: true}));
    });
    cm.on('keypress', instance => instance.showHint());
  };

  #resize(entries) {
    if (this.#width == null)
    {
      this.resetMaxWidth();
    };
  };

  init() {
    if (this.inited == false)
    {
      this.inited = true;
      let that = this;
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
        script.src = this.codemirrorDir + '/mode/' + file + '/' + file + '.js';
        this.container.parentNode.insertBefore(script, this.container);
        script.addEventListener('load', () => {
          filesLoaded += 1;
          if (filesLoaded == filesCount)
          {
            let theme = this.getAttribute('theme') ?? 'default';
            let mime = map.mime.includes(this.mime)? this.mime: map.mime[0];
            this.codeMirror = CodeMirror.fromTextArea(this.textarea, {
              lineNumbers: true,
              lineWrapping: true,
              styleActiveLine: true,
              theme: theme,
              mode: mime,
              extraKeys: {
                'F11': function(cm) {
                  if (!that.hasAttribute('fixed'))
                  {
                    let currentStatus = cm.getOption('fullScreen');
                    if (currentStatus == true)
                    {
                      cm.setOption('fullScreen', false);
                      document.body.classList.remove('f11');
                      that.container.classList.remove('fullscreen');
                    }
                    else
                    {
                      cm.setOption('fullScreen', true);
                      document.body.classList.add('f11');
                      that.container.classList.add('fullscreen');
                    };
                    that.dispatchEvent(new CustomEvent('fullscreenchanged', {detail: {'instance': cm}, bubbles: true}));
                  };
                 },
                'Esc': function(cm) {
                  if (cm.getOption('fullScreen'))
                  {
                    cm.setOption('fullScreen', false);
                    document.body.classList.remove('f11');
                    that.container.classList.remove('fullscreen');
                    that.dispatchEvent(new CustomEvent('fullscreenchanged', {detail: {'instance': cm}, bubbles: true}));
                  };
                },
                'Ctrl-S': function(cm) {
                  that.dispatchEvent(new CustomEvent('save', {detail: {'instance': cm}, bubbles: true}));
                },
              },
              hintOptions: {
                container: this.container,
                hint: function(cm) {
                  return new Promise(function(resolve) {
                    let hintBase = that.hintBase;
                    if (Array.isArray(hintBase) && hintBase.length != 0)
                    {
                      let cursor = cm.getCursor(), line = cm.getLine(cursor.line);
                      let start = cursor.ch, end = cursor.ch;
                      while (start && /\$|\^|\#|\w/.test(line.charAt(start - 1))) -- start;
                      while (end < line.length && /\w/.test(line.charAt(end))) ++ end;
                      let word = line.slice(start, end);
                      if (word.length != 0)
                      {
                        let showlist = [];
                        showlist.push(word);
                        for (let i = 0; i < hintBase.length; i++)
                        {
                          if (hintBase[i].indexOf(word) == 0 && hintBase[i] != word) showlist.push(hintBase[i]);
                        };
                        if (showlist.length >= 2)
                        {
                          return resolve({list: showlist, from: CodeMirror.Pos(cursor.line, start), to: CodeMirror.Pos(cursor.line, end)});
                        }
                        else return resolve(null);
                      };
                    };
                    return resolve(null);
                  });
                },
              },
            });
            this.#bindEvents(this.codeMirror);
            this.dispatchEvent(new CustomEvent('loaded', {detail: {'cm': this.codeMirror}, bubbles: true}));
          };
        });
      });
    };
  };

  isFullScreen() {
    return this.container.classList.contains('fullscreen')? true: false;
  };

  resetMaxWidth() {
    let widthChanged = false;
    let container = this.container;
    let mainEl = container.querySelector('div.main');
    mainEl.style.display = 'none';
    let currentWidth = container.offsetWidth;
    if (this.#currentWidth != currentWidth)
    {
      widthChanged = true;
      this.#currentWidth = currentWidth;
      mainEl.style.maxWidth = currentWidth + 'px';
    };
    mainEl.style.display = 'block';
    if (widthChanged == true)
    {
      this.codeMirror?.refresh();
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
        if (!isFinite(newVal))
        {
          this.style.width = newVal;
        }
        else
        {
          this.#width = Number.parseInt(newVal);
          this.style.width = this.#width + 'px';
        };
        break;
      };
      case 'height':
      {
        this.style.height = isFinite(newVal)? newVal + 'px': newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  disconnectedCallback() {
    this.resizeObserver.disconnect();
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let codemirrorDir = import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/../../../vendor/codemirror';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <style>@import url('${codemirrorDir}/lib/codemirror.css');</style>
      <style>@import url('${codemirrorDir}/theme/eclipse.css');</style>
      <style>@import url('${codemirrorDir}/theme/monokai.css');</style>
      <style>@import url('${codemirrorDir}/addon/display/fullscreen.css');</style>
      <style>@import url('${codemirrorDir}/addon/hint/show-hint.css');</style>
      <container style="display:none">
        <div class="main"><textarea name="code"></textarea></div>
        <div class="mask"></div>
      </container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.mime = null;
    this.mode = 'htmlmixed';
    this.inited = false;
    this.codemirrorDir = codemirrorDir;
    this.container = shadowRoot.querySelector('container');
    this.textarea = this.container.querySelector('textarea[name=code]');
    if (this.hasAttribute('placeholder'))
    {
      this.textarea.setAttribute('placeholder', this.getAttribute('placeholder'));
    };
    this.modeList = ['clike', 'css', 'go', 'htmlmixed', 'javascript', 'php', 'python', 'shell', 'sql', 'xml'];
    this.codeMirror = null;
    this.resizeObserver = new ResizeObserver(entries => this.#resize(entries));
    this.resizeObserver.observe(this);
    this.resizeObserver.observe(document.body);
    let codemirrorJs = codemirrorDir + '/lib/codemirror.js';
    let codemirrorScript = document.createElement('script');
    codemirrorScript.src = codemirrorJs;
    shadowRoot.insertBefore(codemirrorScript, this.container);
    codemirrorScript.addEventListener('load', () => {
      let addon = [
        'selection/active-line.js',
        'display/fullscreen.js',
        'display/placeholder.js',
        'hint/show-hint.js',
      ];
      let addonLoaded = 0;
      let addonCount = addon.length;
      addon.forEach(item => {
        let script = document.createElement('script');
        script.src = this.codemirrorDir + '/addon/' + item;
        this.container.parentNode.insertBefore(script, this.container);
        script.addEventListener('load', () => {
          addonLoaded += 1;
          if (addonLoaded == addonCount)
          {
            this.init();
          };
        });
      });
    });
  };
};