export default class scarousel extends HTMLElement {
  static get observedAttributes() {
    return ['autoplay', 'loop', 'theme', 'gap'];
  };

  #autoplay = false;
  #loop = false;
  #theme = 'default';
  #gap = 20;
  #slidesCount = 0;

  get autoplay() {
    return this.#autoplay;
  };

  get loop() {
    return this.#loop;
  };

  get theme() {
    return this.#theme;
  };

  get gap() {
    return this.#gap;
  };

  set autoplay(autoplay) {
    this.#autoplay = autoplay == null? false: true;
  };

  set loop(loop) {
    this.#loop = loop == null? false: true;
  };

  set theme(theme) {
    this.#theme = theme;
    this.container.querySelector('div.box')?.setAttribute('theme', theme);
  };

  set gap(gap) {
    this.#gap = isFinite(gap)? Number.parseInt(gap): 20;
  };

  #getSwiperParam() {
    let result = {
      slidesPerView: 1,
      spaceBetween: this.#gap,
      breakpointsBase: 'container',
      breakpoints: {
        640: {
          slidesPerView : 2,
        },
        960: {
          slidesPerView : 3,
        },
        1280: {
          slidesPerView : 4,
        },
        1600: {
          slidesPerView : 5,
        },
        1920: {
          slidesPerView : 6,
        },
        2240: {
          slidesPerView : 7,
        },
        2560: {
          slidesPerView : 8,
        },
        2880: {
          slidesPerView : 9,
        },
        3200: {
          slidesPerView : 10,
        },
      },
    };
    if (this.autoplay === true)
    {
      result.autoplay = {'delay': 5000};
    };
    if (this.loop === true)
    {
      result.loop = true;
    };
    return result;
  };

  #initButtons(instance) {
    let container = this.container;
    let buttonPrev = container.querySelector('div.button-prev');
    let buttonNext = container.querySelector('div.button-next');
    if (buttonPrev != null && buttonNext != null)
    {
      container.classList.add('on');
      let slidesCount = this.#slidesCount;
      if (slidesCount <= 1)
      {
        buttonPrev.classList.add('hide');
        buttonNext.classList.add('hide');
      }
      else
      {
        buttonPrev.classList.remove('hide');
        buttonNext.classList.remove('hide');
        const buttonStatusReset = (isBeginning, isEnd) => {
          buttonPrev.classList.remove('disabled');
          buttonNext.classList.remove('disabled');
          if (this.loop != true)
          {
            buttonPrev.classList.toggle('disabled', isBeginning);
            buttonNext.classList.toggle('disabled', isEnd);
          };
        };
        buttonStatusReset(true, false);
        instance.on('slideChangeTransitionEnd', swiper => buttonStatusReset(swiper.isBeginning, swiper.isEnd));
        buttonPrev.addEventListener('click', e => instance.slidePrev());
        buttonNext.addEventListener('click', e => instance.slideNext());
      };
    };
  };

  #initObserver() {
    let target = this.getDirectChildrenByTagName('var');
    if (target.length === 1)
    {
      let el = target.shift();
      this.observer = new MutationObserver(mutations => this.render());
      this.observer.observe(el, {'childList': true, 'subtree': true});
    };
  };

  render() {
    let container = this.container;
    let box = container.querySelector('div.box').empty();
    let xCarousel = this.querySelector('carousel');
    if (xCarousel != null)
    {
      this.#slidesCount = 0;
      let swiper = document.createElement('jtbc-swiper');
      let div = document.createElement('div');
      let wrapper = document.createElement('div');
      let jButtonPrev = document.createElement('div');
      let tButtonPrevSvg = document.createElement('jtbc-svg');
      let bButtonNext = document.createElement('div');
      let cButtonNextSvg = document.createElement('jtbc-svg');
      div.classList.add('swiper');
      wrapper.classList.add('swiper-wrapper');
      jButtonPrev.classList.add('button');
      jButtonPrev.classList.add('button-prev');
      jButtonPrev.setAttribute('part', 'button-prev');
      tButtonPrevSvg.setAttribute('name', 'arrow_left');
      tButtonPrevSvg.setAttribute('part', 'button-prev-svg');
      jButtonPrev.append(tButtonPrevSvg);
      bButtonNext.classList.add('button');
      bButtonNext.classList.add('button-next');
      bButtonNext.setAttribute('part', 'button-next');
      cButtonNextSvg.setAttribute('name', 'arrow_right');
      cButtonNextSvg.setAttribute('part', 'button-next-svg');
      bButtonNext.append(cButtonNextSvg);
      xCarousel.getDirectChildrenByTagName('item').forEach(item => {
        this.#slidesCount ++;
        let contentItems = [];
        let slide = document.createElement('div');
        let content = document.createElement('div');
        slide.classList.add('swiper-slide');
        content.classList.add('content');
        content.setAttribute('part', 'content');
        if (item.hasAttribute('image'))
        {
          let contentImage = document.createElement('div');
          let contentImageSrc = document.createElement('img');
          contentImage.classList.add('image');
          contentImage.setAttribute('part', 'image');
          contentImageSrc.setAttribute('part', 'image-src')
          contentImageSrc.setAttribute('src', item.getAttribute('image'));
          if (item.hasAttribute('link-href'))
          {
            let contentLink = document.createElement('a');
            contentLink.setAttribute('part', 'link-image');
            contentLink.setAttribute('href', item.getAttribute('link-href'));
            contentLink.setAttribute('target', item.getAttribute('link-target') ?? '_self');
            contentLink.append(contentImageSrc);
            contentImage.append(contentLink);
          }
          else
          {
            contentImage.append(contentImageSrc);
          };
          contentItems.push(contentImage);
        };
        if (item.hasAttribute('title') || item.hasAttribute('subtitle'))
        {
          let contentText = document.createElement('div');
          contentText.classList.add('text');
          contentText.setAttribute('part', 'text');
          if (item.hasAttribute('title'))
          {
            let contentTitle = document.createElement('div');
            contentTitle.classList.add('title');
            contentTitle.setAttribute('part', 'title');
            if (item.hasAttribute('link-href'))
            {
              let contentLink = document.createElement('a');
              contentLink.setAttribute('part', 'link-title');
              contentLink.setAttribute('href', item.getAttribute('link-href'));
              contentLink.setAttribute('target', item.getAttribute('link-target') ?? '_self');
              contentLink.innerText = item.getAttribute('title');
              contentTitle.append(contentLink);
            }
            else
            {
              contentTitle.innerText = item.getAttribute('title');
            };
            contentText.append(contentTitle);
          };
          if (item.hasAttribute('subtitle'))
          {
            let contentSubtitle = document.createElement('div');
            contentSubtitle.classList.add('subtitle');
            contentSubtitle.setAttribute('part', 'subtitle');
            contentSubtitle.innerText = item.getAttribute('subtitle');
            contentText.append(contentSubtitle);
          };
          contentItems.push(contentText);
        };
        if (contentItems.length != 0)
        {
          let contentWrap = document.createElement('div');
          contentWrap.classList.add('wrap');
          contentWrap.setAttribute('part', 'wrap');
          contentItems.forEach(item => contentWrap.append(item));
          content.append(contentWrap);
        };
        slide.append(content);
        wrapper.append(slide);
      });
      div.append(wrapper, jButtonPrev, bButtonNext);
      swiper.append(div);
      swiper.setAttribute('param', JSON.stringify(this.#getSwiperParam()));
      swiper.addEventListener('inited', e => this.#initButtons(e.detail.instance));
      box.append(swiper);
      box.loadComponents();
    };
    this.dispatchEvent(new CustomEvent('renderend'));
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'autoplay':
      {
        this.autoplay = newVal
        break;
      };
      case 'loop':
      {
        this.loop = newVal
        break;
      };
      case 'theme':
      {
        this.theme = newVal;
        break;
      };
      case 'gap':
      {
        this.gap = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.render();
    this.#initObserver();
  };

  disconnectedCallback() {
    this.observer?.disconnect();
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div part="container" class="container" style="display:none">
        <div class="box" theme="default"></div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
  };
};