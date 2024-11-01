import Swiper from '../../../vendor/swiper/swiper-bundle.esm.browser.min.js';

export default class jtbcGallerySlider extends HTMLElement {
  static get observedAttributes() {
    return ['gallery', 'thumb', 'thumb-size', 'zoomable'];
  };

  #gallery = [];
  #swiper = null;
  #slideCount = 0;
  #slideSpeed = 300;
  #thumb = 'show';
  #thumbSize = 'contain';
  #zoomable = true;

  get gallery() {
    return this.#gallery;
  };

  get swiper() {
    return this.#swiper;
  };

  get slideCount() {
    return this.#slideCount;
  };

  get slideSpeed() {
    return this.#slideSpeed;
  };

  get thumb() {
    return this.#thumb;
  };

  get thumbSize() {
    return this.#thumbSize;
  };

  get zoomable() {
    return this.#zoomable;
  };

  set gallery(gallery) {
    let galleryArr = JSON.parse(gallery);
    if (Array.isArray(galleryArr))
    {
      this.#gallery = galleryArr;
      this.#initSwiper();
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  set thumb(thumb) {
    if (['show', 'hide', 'none'].includes(thumb))
    {
      this.#thumb = thumb;
      this.container.setAttribute('thumb', thumb);
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  set thumbSize(thumbSize) {
    this.#thumbSize = ['contain', 'cover'].includes(thumbSize)? thumbSize: 'contain';
    this.container.querySelector('div.thumb').setAttribute('size', this.#thumbSize);
  };

  set zoomable(zoomable) {
    if (zoomable == 'true')
    {
      this.#zoomable = true;
    }
    else
    {
      this.#zoomable = false;
    };
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    container.addEventListener('transitionend', function(){
      if (!this.classList.contains('on'))
      {
        that.classList.remove('on');
        that.dispatchEvent(new CustomEvent('closed', {bubbles: true}));
      }
      else
      {
        that.dispatchEvent(new CustomEvent('opened', {bubbles: true}));
      };
    });
    container.delegateEventListener('div.content div.prev', 'click', function(){
      that.swiper?.slidePrev(that.slideSpeed);
    });
    container.delegateEventListener('div.content div.next', 'click', function(){
      that.swiper?.slideNext(that.slideSpeed);
    });
    container.delegateEventListener('div.thumbnail div.item', 'click', function(){
      let index = Number.parseInt(this.getAttribute('index'));
      that.swiper?.slideToLoop(index, that.slideSpeed);
    });
    container.delegateEventListener('div.thumbnail div.button', 'click', function(){
      this.parentNode.classList.toggle('on');
    });
    container.delegateEventListener('[role=gallery-slider-close]', 'click', e => that.close());
  };

  #initSwiper() {
    let that = this;
    let container = this.container;
    if (this.ready == true)
    {
      let gallery = this.gallery;
      let thumbEl = container.querySelector('div.thumb').empty();
      let contentEl = container.querySelector('div.content').empty();
      let paginationEl = container.querySelector('div.pagination').empty();
      if (Array.isArray(gallery) && gallery.length != 0)
      {
        let index = 0;
        let el = document.createElement('div');
        let wrapper = document.createElement('div');
        let buttonPrev = document.createElement('div');
        let buttonPrevSvg = document.createElement('jtbc-svg');
        let buttonNext = document.createElement('div');
        let buttonNextSvg = document.createElement('jtbc-svg');
        el.classList.add('swiper');
        wrapper.classList.add('swiper-wrapper');
        buttonPrev.classList.add('prev');
        buttonPrevSvg.setAttribute('name', 'arrow_left');
        buttonPrev.append(buttonPrevSvg);
        buttonNext.classList.add('next');
        buttonNextSvg.setAttribute('name', 'arrow_right');
        buttonNext.append(buttonNextSvg);
        el.append(wrapper, buttonPrev, buttonNext);
        gallery.forEach(item => {
          let slide = document.createElement('div');
          let zoomContainer = document.createElement('div');
          let img = document.createElement('img');
          slide.classList.add('swiper-slide');
          zoomContainer.classList.add('swiper-zoom-container');
          img.setAttribute('src', item.image);
          if (item.hasOwnProperty('title'))
          {
            img.setAttribute('title', item.title);
          };
          zoomContainer.append(img);
          slide.append(zoomContainer);
          wrapper.append(slide);
          if (this.thumb != 'none')
          {
            let thumb = document.createElement('div');
            let thumbImage = document.createElement('img');
            thumb.classList.add('item');
            thumb.setAttribute('index', index);
            if (index == 0) thumb.classList.add('on');
            thumbImage.setAttribute('src', item.image);
            if (item.hasOwnProperty('title'))
            {
              thumb.setAttribute('title', item.title);
              thumbImage.setAttribute('title', item.title);
            };
            thumb.append(thumbImage);
            thumbEl.append(thumb);
          };
          index += 1;
        });
        contentEl.append(el);
        if (['show', 'hide'].includes(this.thumb))
        {
          paginationEl.classList.add('hide');
        };
        this.#slideCount = index;
        paginationEl.innerText = '1 / ' + this.slideCount;
        this.#swiper = new Swiper(el, {loop: true, zoom: this.zoomable});
        this.#swiper.on('slideChange', function(){
          let currentIndex = this.realIndex;
          paginationEl.innerText = (currentIndex + 1) + ' / ' + that.slideCount;
          thumbEl.querySelectorAll('div.item').forEach(item => {
            if (Number.parseInt(item.getAttribute('index')) == currentIndex)
            {
              item.classList.add('on');
              item.scrollIntoView({behavior: 'smooth', inline: 'center'});
            }
            else
            {
              item.classList.remove('on');
            };
          });
        });
      };
    };
  };

  open(index = -1, gallery = null) {
    if (gallery != null)
    {
      this.gallery = gallery;
    };
    this.classList.add('on');
    this.container.classList.add('on');
    if (index >= 0) this.swiper?.slideToLoop(index, this.slideSpeed);
  };

  close() {
    this.container.classList.remove('on');
  };

  slideTo(index, speed = null) {
    this.swiper?.slideToLoop(index, speed ?? this.slideSpeed);
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'gallery':
      {
        this.gallery = newVal;
        break;
      };
      case 'thumb':
      {
        this.thumb = newVal;
        break;
      };
      case 'thumb-size':
      {
        this.thumbSize = newVal;
        break;
      };
      case 'zoomable':
      {
        this.zoomable = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#initSwiper();
  };

  constructor() {
    super();
    this.ready = false;
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    shadowRoot.innerHTML = `<style>@import url('${importCssUrl}');</style><container part="container" thumb="show" style="display:none"><div class="close" part="close" role="gallery-slider-close"><jtbc-svg name="close" part="svg-close"></jtbc-svg></div><div class="content" part="content"></div><div class="pagination"></div><div class="thumbnail"><div class="box"><div class="thumb" part="thumb" size="contain"></div></div><div class="button"><jtbc-svg name="arrow_up"></jtbc-svg><jtbc-svg name="arrow_down"></jtbc-svg></div></div></container>`;
    this.container = shadowRoot.querySelector('container');
    this.container.loadComponents().then(() => this.#initEvents());
  };
};