export default class jtbcImageCarousel extends HTMLElement {
  static get observedAttributes() {
    return ['images', 'transition-seconds', 'width', 'height'];
  };

  #total = 0;
  #loaded = 0;
  #images = [];

  get images() {
    return this.#images;
  };

  set images(images) {
    if (images.length != 0)
    {
      let imagesArr = JSON.parse(images);
      if (Array.isArray(imagesArr))
      {
        this.#images = imagesArr;
        this.start();
      }
      else
      {
        throw new Error('Unexpected value');
      };
    }
    else
    {
      this.#images = [];
      this.start();
    };
  };

  #initEvents() {
    let container = this.container;
    let images = container.querySelector('div.images');
    images.delegateEventListener('div.item', 'transitionend', e => {
      let currentEl = e.target;
      let nextEl = currentEl.nextElementSibling ?? images.firstElementChild;
      if (currentEl.classList.contains('out'))
      {
        currentEl.classList.remove('on', 'out');
      }
      else if (currentEl.classList.contains('on'))
      {
        currentEl.classList.add('out');
        nextEl.classList.add('on');
      };
    });
  };

  reset() {
    this.#loaded = 0;
    this.#total = this.#images.length;
  };

  start() {
    let images = this.#images;
    let container = this.container;
    let el = container.querySelector('div.images').empty();
    this.reset();
    if (images.length != 0)
    {
      images.forEach(image => {
        let img = new Image();
        let item = document.createElement('div');
        item.classList.add('item');
        img.addEventListener('load', e => {
          this.#loaded += 1;
          this.startAnimation();
          item.style.backgroundImage = 'url(' + e.target.src + ')';
        });
        img.src = image;
        el.append(item);
      });
    };
  };

  startAnimation() {
    let total = this.#total;
    let loaded = this.#loaded;
    let container = this.container;
    let el = container.querySelector('div.images');
    if (loaded >= total)
    {
      if (getComputedStyle(el).getPropertyValue('z-index').length == 0)
      {
        this.startAnimation();
      }
      else
      {
        let firstEl = el.firstElementChild;
        if (firstEl != null)
        {
          firstEl.classList.add('on');
        };
        if (total == 1)
        {
          el.append(firstEl.cloneNode(true));
        };
      };
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'images':
      {
        this.images = newVal;
        break;
      };
      case 'transition-seconds':
      {
        this.style.setProperty('--transition-seconds', Math.max(1, Number.parseInt(newVal)) + 's');
        break;
      };
      case 'width':
      {
        this.style.width = isFinite(newVal)? newVal + 'px': newVal;
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
    this.#initEvents();
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><div class="images"></div><div class="content"><slot></slot></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
  };
};