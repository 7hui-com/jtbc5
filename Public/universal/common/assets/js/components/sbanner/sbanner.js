export default class sbanner extends HTMLElement {
  static get observedAttributes() {
    return ['autoplay', 'loop', 'theme'];
  };

  #autoplay = false;
  #loop = false;
  #theme = 'default';
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

  #getSwiperParam() {
    let result = {};
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
    let pagination = container.querySelector('div.pagination');
    if (buttonPrev != null && buttonNext != null && pagination != null)
    {
      pagination.empty();
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
        const buttonStatusReset = (index, total) => {
          buttonPrev.classList.remove('disabled');
          buttonNext.classList.remove('disabled');
          if (this.loop != true)
          {
            if (index == 0)
            {
              buttonPrev.classList.add('disabled');
            }
            else if (index >= (total - 1))
            {
              buttonNext.classList.add('disabled');
            };
          };
          pagination.querySelectorAll('span.dot').forEach(dot => {
            dot.classList.toggle('active', dot.dataset.i == index);
          });
        };
        for (let i = 0; i < slidesCount; i ++)
        {
          let dot = document.createElement('span');
          dot.classList.add('dot');
          dot.setAttribute('part', 'dot');
          dot.dataset.i = i;
          pagination.append(dot);
        };
        buttonStatusReset(instance.realIndex, slidesCount);
        instance.on('slideChangeTransitionEnd', swiper => buttonStatusReset(swiper.realIndex, slidesCount));
        buttonPrev.addEventListener('click', e => instance.slidePrev());
        buttonNext.addEventListener('click', e => instance.slideNext());
        pagination.delegateEventListener('span.dot', 'click', e => {
          if (this.loop == false)
          {
            instance.slideTo(e.target.dataset.i);
          }
          else
          {
            instance.slideToLoop(e.target.dataset.i);
          };
        });
      };
    };
  };

  #initEvents() {
    let container = this.container;
    container.delegateEventListener('slot', 'slotchange', function(){
      this.assignedElements().forEach(el => el.classList.add('slotted'));
    });
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
    let xBanner = this.querySelector('banner');
    if (xBanner != null)
    {
      this.#slidesCount = 0;
      let swiper = document.createElement('jtbc-swiper');
      let div = document.createElement('div');
      let wrapper = document.createElement('div');
      let jButtonPrev = document.createElement('div');
      let tButtonPrevSvg = document.createElement('jtbc-svg');
      let bButtonNext = document.createElement('div');
      let cButtonNextSvg = document.createElement('jtbc-svg');
      let pagination = document.createElement('div');
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
      pagination.classList.add('pagination');
      pagination.setAttribute('part', 'pagination');
      xBanner.getDirectChildrenByTagName('picture').forEach(picture => {
        this.#slidesCount ++;
        let contentItems = [];
        let slide = document.createElement('div');
        let mask = document.createElement('div');
        let frontstage = document.createElement('div');
        let frontstageSlot = document.createElement('slot');
        let content = document.createElement('div');
        slide.classList.add('swiper-slide');
        slide.style.backgroundImage = 'url(' + picture.getAttribute('src') + ')';
        mask.classList.add('mask');
        mask.setAttribute('part', 'mask');
        frontstage.classList.add('frontstage');
        frontstage.setAttribute('part', 'frontstage');
        frontstageSlot.setAttribute('part', 'frontstage-slot')
        frontstageSlot.setAttribute('name', 'frontstage-' + this.#slidesCount);
        frontstage.append(frontstageSlot);
        content.classList.add('content');
        content.setAttribute('part', 'content');
        if (picture.hasAttribute('title'))
        {
          let contentTitle = document.createElement('span');
          contentTitle.classList.add('title');
          contentTitle.setAttribute('part', 'title');
          contentTitle.innerText = picture.getAttribute('title');
          contentItems.push(contentTitle);
        };
        if (picture.hasAttribute('subtitle'))
        {
          let contentSubtitle = document.createElement('span');
          contentSubtitle.classList.add('subtitle');
          contentSubtitle.setAttribute('part', 'subtitle');
          contentSubtitle.innerText = picture.getAttribute('subtitle');
          contentItems.push(contentSubtitle);
        };
        if (picture.hasAttribute('link-href'))
        {
          let contentLink = document.createElement('a');
          contentLink.classList.add('link');
          contentLink.setAttribute('part', 'link');
          contentLink.innerText = picture.getAttribute('link-text') ?? '';
          contentLink.setAttribute('href', picture.getAttribute('link-href'));
          contentLink.setAttribute('target', picture.getAttribute('link-target') ?? '_self');
          contentItems.push(contentLink);
        };
        if (contentItems.length != 0)
        {
          let contentWrap = document.createElement('div');
          contentWrap.classList.add('wrap');
          contentWrap.setAttribute('part', 'wrap');
          contentItems.forEach(item => contentWrap.append(item));
          content.append(contentWrap);
        };
        slide.append(mask, frontstage, content);
        wrapper.append(slide);
      });
      div.append(wrapper, jButtonPrev, bButtonNext, pagination);
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
    };
  };

  connectedCallback() {
    this.ready = true;
    this.render();
    this.#initEvents();
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