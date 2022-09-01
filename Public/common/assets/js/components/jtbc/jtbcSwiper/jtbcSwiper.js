export default class jtbcSwiper extends HTMLElement {
  static get observedAttributes() {
    return ['param'];
  };

  #param = null;

  get param() {
    try
    {
      let param = JSON.parse(this.#param);
      return param instanceof Object? param: {};
    }
    catch(e) { console.log(e.message); };
  };

  loadSwiper() {
    let rootNode = this.getRootNode();
    let swiperJs = rootNode.querySelector('script.swiper');
    let swiperCss = rootNode.querySelector('link.swiper');
    if (swiperJs != null && swiperCss != null)
    {
      return new Promise((resolve) => { resolve({'js': swiperJs, 'css': swiperCss}); });
    }
    else
    {
      return new Promise((resolve) => {
        swiperCss = document.createElement('link');
        swiperCss.setAttribute('type', 'text/css');
        swiperCss.setAttribute('rel', 'stylesheet');
        swiperCss.setAttribute('href', this.swiperPath.pathname + 'swiper-bundle.min.css');
        rootNode.head.appendChild(swiperCss);
        swiperJs = document.createElement('script');
        swiperJs.classList.add('swiper');
        swiperJs.setAttribute('src', this.swiperPath.pathname + 'swiper-bundle.min.js');
        swiperJs.addEventListener('load', function(){ resolve({'js': swiperJs, 'css': swiperCss}); });
        rootNode.head.appendChild(swiperJs);
      });
    };
  };

  init() {
    this.loadSwiper().then(() => {
      this.instance = null;
      let swipers = this.querySelectorAll('div.swiper');
      if (swipers.length == 1)
      {
        this.instance = new Swiper(swipers[0], this.param);
      }
      else
      {
        this.instance = [];
        swipers.forEach(item => {
          this.instance.push(new Swiper(item, this.param));
        });
      };
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'param':
      {
        this.#param = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.init();
  };

  constructor() {
    super();
    this.ready = false;
    this.basePath = import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/';
    this.swiperPath = new URL(this.basePath + '../../../vendor/swiper/');
  };
};