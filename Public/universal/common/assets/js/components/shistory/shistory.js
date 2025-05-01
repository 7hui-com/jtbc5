import Swiper from '../../../../../../common/assets/js/vendor/swiper/swiper-bundle.esm.browser.min.js';

export default class shistory extends HTMLElement {
  static get observedAttributes() {
    return ['autoplay', 'gap', 'theme'];
  };

  #autoplay = false;
  #gap = 20;
  #swiper = null;
  #theme = 'default';

  get autoplay() {
    return this.#autoplay;
  };

  get gap() {
    return this.#gap;
  };

  get swiper() {
    return this.#swiper;
  };

  get theme() {
    return this.#theme;
  };

  set autoplay(autoplay) {
    this.#autoplay = autoplay == null? false: true;
  };

  set gap(gap) {
    this.#gap = isFinite(gap)? Number.parseInt(gap): 20;
    this.container.setProperty('--gap', this.#gap + 'px');
  };

  set theme(theme) {
    this.#theme = theme;
    this.container.setAttribute('theme', theme);
  };

  #initSwiper() {
    let container = this.container;
    let swiperEl = container.querySelector('div.swiper');
    let paginationEl = container.querySelector('div.swiper-pagination');
    let navigationNextEl = container.querySelector('div.swiper-button-next');
    let navigationPrevEl = container.querySelector('div.swiper-button-prev');
    let swiperParam = {
      'slidesPerView': 1.5,
      'pagination': {
        'el': paginationEl,
        'clickable': true,
      },
      'navigation': {
        'nextEl': navigationNextEl,
        'prevEl': navigationPrevEl,
      },
      'breakpoints': {
        640: {
          'slidesPerView': 2,
        },
        960: {
          'slidesPerView': 3,
        },
        1280: {
          'slidesPerView': 4,
        },
        1600: {
          'slidesPerView': 5,
        },
        1920: {
          'slidesPerView': 6,
        },
      },
      'breakpointsBase': 'container',
    };
    if (this.autoplay === true)
    {
      swiperParam.autoplay = {'delay': 5000};
    };
    this.#swiper = new Swiper(swiperEl, swiperParam);
    this.#swiper.slideTo(container.dataset.slideCount, 0);
  };

  render() {
    let container = this.container;
    let xHistory = this.querySelector('history');
    let wrapper = container.querySelector('div.swiper-wrapper').empty();
    if (xHistory != null)
    {
      let slideCount = 0;
      xHistory.getDirectChildrenByTagName('item').forEach(item => {
        let slide = document.createElement('div');
        let text = document.createElement('div');
        let textDot = document.createElement('div');
        let textTitle = document.createElement('div');
        let textContent = document.createElement('div');
        slide.classList.add('swiper-slide');
        slide.setAttribute('part', 'swiper-slide');
        text.classList.add('text');
        text.setAttribute('part', 'text');
        textDot.classList.add('dot');
        textDot.setAttribute('part', 'text-dot');
        textTitle.classList.add('title');
        textTitle.setAttribute('part', 'text-title');
        textTitle.innerText = item.getAttribute('title') ?? '';
        textContent.classList.add('content');
        textContent.setAttribute('part', 'text-content');
        textContent.innerText = item.getAttribute('content') ?? '';
        text.append(textDot, textTitle, textContent);
        slide.append(text);
        wrapper.append(slide);
        slideCount += 1;
      });
      container.dataset.slideCount = slideCount;
    };
    this.dispatchEvent(new CustomEvent('renderend'));
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'gap':
      {
        this.gap = newVal;
        break;
      };
      case 'theme':
      {
        this.theme = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.render();
    this.#initSwiper();
    this.ready = true;
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div part="container" class="container" theme="default" style="display:none">
        <div class="swiper" part="swiper">
          <div class="swiper-wrapper" part="swiper-wrapper"></div>
          <div class="swiper-pagination" part="swiper-pagination"></div>
          <div class="swiper-button-prev" part="swiper-button-prev"><jtbc-svg name="arrow_left" part="swiper-button-prev-svg"></jtbc-svg></div>
          <div class="swiper-button-next" part="swiper-button-next"><jtbc-svg name="arrow_right" part="swiper-button-next-svg"></jtbc-svg></div>
        </div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.container.loadComponents();
  };
};