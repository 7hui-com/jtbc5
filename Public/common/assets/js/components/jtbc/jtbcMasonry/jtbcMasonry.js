export default class jtbcMasonry extends HTMLElement {
  static get observedAttributes() {
    return ['column-width', 'column-name', 'gutter', 'param'];
  };

  #columnWidth = null;
  #columnName = 'item';
  #gutter = null;
  #param = null;
  masonry = null;
  #basePath = null;
  #libPath = null;

  get param() {
    let result = this.#param ?? {};
    if (Number.isInteger(this.#columnWidth))
    {
      result.columnWidth = this.#columnWidth;
    };
    if (Number.isInteger(this.#gutter))
    {
      result.gutter = this.#gutter;
    };
    result.itemSelector = '.' + this.#columnName;
    return result;
  };

  set param(param) {
    if (typeof param == 'object')
    {
      this.#param = param;
    }
    else if (typeof param == 'string')
    {
      try
      {
        this.param = JSON.parse(param);
      }
      catch(e)
      {
        throw new Error('Unexpected value');
      };
    };
  };

  bindImgLoadEvents() {
    let that = this;
    this.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('masonry-load-binded'))
      {
        img.setAttribute('masonry-load-binded', 'true');
        img.addEventListener('load', function(){
          that.masonry?.layout();
        });
      };
    });
  };

  #initMasonry() {
    this.bindImgLoadEvents();
    this.masonry = new Masonry(this, this.param);
    this.masonry.on('layoutComplete', () => {
      this.dispatchEvent(new CustomEvent('layoutcomplete', {bubbles: true}));
    });
  };

  #loadMasonry() {
    let container = this.container;
    let observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type == 'childList') {
          this.bindImgLoadEvents();
          mutation.addedNodes.forEach(el => {
            if (el.classList.contains(this.#columnName))
            {
              this.masonry?.addItems(el);
            };
          });
          if (mutation.removedNodes.length != 0)
          {
            this.masonry?.layout();
          };
        }
        else if (mutation.type == 'attributes' && mutation.attributeName == 'style')
        {
          container.setAttribute('style', this.getAttribute('style'));
        };
      });
    });
    observer.observe(this, {childList: true, attributes: true, attributeFilter: ['style']});
    if (typeof Masonry == 'undefined')
    {
      let parentNode = container.parentNode;
      let script = document.createElement('script');
      script.src = this.#libPath + '/masonry.pkgd.min.js';
      parentNode.insertBefore(script, container);
      script.addEventListener('load', () => this.#initMasonry());
    }
    else
    {
      this.#initMasonry();
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'column-width':
      {
        this.#columnWidth = isFinite(newVal)? Number.parseInt(newVal): null;
        break;
      };
      case 'column-name':
      {
        this.#columnName = newVal;
        break;
      };
      case 'gutter':
      {
        this.#gutter = isFinite(newVal)? Number.parseInt(newVal): null;
        break;
      };
      case 'param':
      {
        this.param = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#loadMasonry();
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let basePath = import.meta.url.substring(0, import.meta.url.lastIndexOf('/') + 1);
    shadowRoot.innerHTML = `<style>:host { display: block; width: 100% } div.container { width: 100%; position: relative }</style><div class="container"><slot></slot></div>`;
    this.ready = false;
    this.#basePath = basePath;
    this.#libPath = basePath + '../../../vendor/masonry';
    this.container = shadowRoot.querySelector('div.container');
  };
};