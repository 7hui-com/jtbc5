export default class jtbcDrawer extends HTMLElement {
  static get observedAttributes() {
    return ['closeable', 'direction'];
  };

  #closeable = true;
  #direction = 'rtl';
  #pluginStyleIdentity = null;

  get closeable() {
    return this.#closeable;
  };

  get direction() {
    return this.#direction;
  };

  set closeable(closeable) {
    let container = this.container;
    if (closeable == 'true')
    {
      this.#closeable = true;
      container.setAttribute('closeable', 'true');
    }
    else
    {
      this.#closeable = false;
      container.setAttribute('closeable', 'false');
    };
  };

  set direction(direction) {
    let container = this.container;
    if (['ttb', 'rtl', 'btt', 'ltr'].includes(direction))
    {
      this.#direction = direction;
      container.setAttribute('direction', direction);
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  #lockScrollbar() {
    if (this.#direction == 'rtl')
    {
      let scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      let pluginStyle = document.createElement('style');
      pluginStyle.identity = this.#pluginStyleIdentity = Symbol();
      pluginStyle.setAttribute('type', 'text/css');
      pluginStyle.innerText = 'html, body { width: calc(100% - ' + scrollbarWidth + 'px); overflow-y: hidden }';
      document.head.append(pluginStyle);
    };
  };

  #unlockScrollbar() {
    let identity = this.#pluginStyleIdentity;
    if (identity != null)
    {
      document.head.querySelectorAll('style').forEach(el => {
        if (el.identity == this.#pluginStyleIdentity)
        {
          el.remove();
        };
      });
    };
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    let drawer = this.drawer;
    container.addEventListener('click', e => {
      if (e.target == e.currentTarget)
      {
        if (that.closeable)
        {
          that.close();
        };
      };
    });
    container.addEventListener('transitionend', function(){
      if (this.classList.contains('on'))
      {
        drawer.classList.add('on');
      }
      else
      {
        that.classList.remove('on');
      };
    });
    drawer.addEventListener('transitionend', function(){
      if (container.classList.contains('off'))
      {
        that.#unlockScrollbar();
        container.classList.remove('on');
        container.classList.remove('off');
        that.dispatchEvent(new CustomEvent('closed', {bubbles: true}));
      }
      else if (container.classList.contains('on'))
      {
        that.dispatchEvent(new CustomEvent('opened', {bubbles: true}));
      };
    });
    container.delegateEventListener('[role=drawer-close]', 'click', e => that.close());
  };

  open() {
    this.#lockScrollbar();
    this.classList.add('on');
    this.container.classList.add('on');
  };

  close() {
    this.container.classList.add('off');
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'closeable':
      {
        this.closeable = newVal;
        break;
      };
      case 'direction':
      {
        this.direction = newVal;
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
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    shadowRoot.innerHTML = `<style>@import url('${importCssUrl}');</style><container part="container" closeable="true" direction="rtl" style="display:none"><div class="drawer" part="drawer"><div class="close" role="drawer-close" part="close"><jtbc-svg name="close" part="svg-close"></jtbc-svg></div><div class="content" part="content"><slot></slot></div></div></container>`;
    this.container = shadowRoot.querySelector('container');
    this.drawer = this.container.querySelector('div.drawer');
    this.container.loadComponents().then(() => this.#initEvents());
  };
};