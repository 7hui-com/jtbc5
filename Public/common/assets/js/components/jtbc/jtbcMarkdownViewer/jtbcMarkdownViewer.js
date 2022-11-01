export default class jtbcMarkdownViewer extends HTMLElement {
  static get observedAttributes() {
    return ['options', 'value'];
  };

  #options = {
    'breaks': true,
  };

  #value = null;

  get options() {
    return this.#options;
  };

  get value() {
    return this.#value ?? '';
  };

  set value(value) {
    this.#value = value;
    this.render();
  };

  #loadMarked() {
    let container = this.container;
    if (typeof marked == 'undefined')
    {
      return new Promise((resolve) => {
        let parentNode = container.parentNode;
        let markedScript = document.createElement('script');
        markedScript.src = this.markedPath + 'marked.min.js';
        parentNode.insertBefore(markedScript, container);
        markedScript.addEventListener('load', () => resolve(this));
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
        purifyScript.src = this.markedPath + '../DOMPurify/purify.min.js';
        parentNode.insertBefore(purifyScript, container);
        purifyScript.addEventListener('load', () => resolve(this));
      });
    }
    else
    {
      return new Promise((resolve) => { resolve(this); });
    };
  };

  render() {
    let container = this.container;
    Promise.all([this.#loadMarked(), this.#loadDOMPurify()]).then(() => {
      marked.setOptions(this.options);
      container.empty().html(DOMPurify.sanitize(marked.parse(this.value))).then(my => {
        let isReplaced = false;
        my.querySelectorAll('code').forEach(el => {
          if (el.hasAttribute('class'))
          {
            let className = el.getAttribute('class');
            if (!className.includes(String.fromCharCode(32)) && className.startsWith('language-'))
            {
              if (el.parentNode.tagName == 'PRE')
              {
                isReplaced = true;
                let currentLanguage = className.substring(className.lastIndexOf('-') + 1);
                let highlighter = document.createElement('jtbc-syntax-highlighter');
                highlighter.setAttribute('language', currentLanguage);
                highlighter.setAttribute('value', el.innerText);
                el.parentNode.replaceWith(highlighter);
              };
            };
          };
        });
        if (isReplaced === true)
        {
          container.loadComponents();
        };
      });
    }).catch(() => {
      throw new Error('Unexpected error');
    });
  };

  setOptions(options) {
    let items = JSON.parse(options);
    Object.keys(items).forEach(key => {
      this.#options[key] = items[key];
    });
    return this.#options;
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'options':
      {
        this.setOptions(newVal);
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

  constructor() {
    super();
    this.ready = false;
    let shadowRoot = this.attachShadow({mode: 'open'});
    let pluginCss = this.getAttribute('plugin_css');
    let basePath = import.meta.url.substring(0, import.meta.url.lastIndexOf('/') + 1);
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `<style>@import url('${importCssUrl}');</style><container style="display:none"></container>`;
    shadowRoot.innerHTML = shadowRootHTML;
    if (pluginCss != null)
    {
      let pluginStyle = document.createElement('link');
      pluginStyle.setAttribute('type', 'text/css');
      pluginStyle.setAttribute('rel', 'stylesheet');
      pluginStyle.setAttribute('href', pluginCss);
      shadowRoot.insertBefore(pluginStyle, this.container);
    };
    this.container = shadowRoot.querySelector('container');
    this.markedPath = basePath + '../../../vendor/marked/';
    this.container.addEventListener('click', e => {
      this.dispatchEvent(new CustomEvent('clicked', {bubbles: true, detail: {target: e.target}}));
    });
  };
};