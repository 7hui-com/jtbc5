export default class jtbcParallaxWallpaper extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'ratio'];
  };

  #src = null;
  #ratio = 200;
  #handler = null;
  #currentScrollTop = 0;
  isIntersecting = false;

  get src() {
    return this.#src;
  };

  get ratio() {
    return this.#ratio;
  };

  set src(src) {
    this.#src = src;
    this.container.querySelector('div.bg').style.backgroundImage = (src == null? 'none': 'url(' + src + ')');
  };

  set ratio(ratio) {
    if (isFinite(ratio))
    {
      this.#ratio = Math.max(100, Number.parseInt(ratio));
      this.setBgHeight();
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  #resize(entry) {
    entry.target.setBgHeight();
  };

  #intersect(entry) {
    entry.target.isIntersecting = entry.isIntersecting;
  };

  #startMonitor() {
    if (this.isIntersecting === true)
    {
      let minPercent = 0 - (this.ratio - 100);
      let scrollTop = document.documentElement.scrollTop;
      if (this.#currentScrollTop != scrollTop)
      {
        this.#currentScrollTop = scrollTop;
        let targetPercent = 0;
        let clientRect = this.getBoundingClientRect();
        let clientHeight = document.documentElement.clientHeight;
        if (clientRect.bottom < 0)
        {
          targetPercent = minPercent;
        }
        else if (clientRect.top < clientHeight)
        {
          targetPercent = minPercent * ((clientHeight - clientRect.top) / (clientHeight + clientRect.height));
        };
        this.container.querySelector('div.bg').style.top = targetPercent + '%';
      };
    };
    this.#handler = requestAnimationFrame(() => this.#startMonitor());
  };

  #initEvents() {
    this.resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => this.#resize(entry));
    });
    this.intersectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => this.#intersect(entry));
    });
    this.resizeObserver.observe(this);
    this.intersectionObserver.observe(this);
  };

  setBgHeight() {
    this.container.querySelector('div.bg').style.height = this.ratio + '%';
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'src':
      {
        this.src = newVal;
        break;
      };
      case 'ratio':
      {
        this.ratio = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#initEvents();
    this.#startMonitor();
  };

  disconnectedCallback() {
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    cancelAnimationFrame(this.#handler);
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container">
        <div class="bg"></div>
        <div class="content"><slot></slot></div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
  };
};