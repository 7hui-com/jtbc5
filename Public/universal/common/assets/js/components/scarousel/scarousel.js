export default class scarousel extends HTMLElement {
  static get observedAttributes() {
    return ['breakpoints', 'gap', 'theme'];
  };

  #breakpoints = {
    640: { perView : 1 },
    960: { perView : 2 },
    1280: { perView : 3 },
  };
  #gap = 20;
  #slidesCount = 0;
  #theme = 'default';

  get autoplay() {
    let result = false;
    if (this.hasAttribute('autoplay') && this.getAttribute('autoplay') != 'false')
    {
      result = true;
    };
    return result;
  };

  get breakpoints() {
    return this.#breakpoints;
  };

  get gap() {
    return this.#gap;
  };

  get theme() {
    return this.#theme;
  };

  set breakpoints(breakpoints) {
    try
    {
      this.#breakpoints = JSON.parse(breakpoints);
    }
    catch(e)
    {
      throw new Error('Unexpected value');
    };
  };

  set gap(gap) {
    this.#gap = isFinite(gap)? Number.parseInt(gap): 20;
  };

  set theme(theme) {
    this.#theme = theme;
    this.container.setAttribute('theme', theme);
  };

  #getParam() {
    let result = {
      type: 'carousel',
      perView: 4,
      gap: this.gap,
      breakpoints: this.breakpoints,
    };
    if (this.autoplay === true)
    {
      result.autoplay = 5000;
    };
    return result;
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
    let el = container.querySelector('div.box').empty();
    let xCarousel = this.querySelector('carousel');
    if (xCarousel != null)
    {
      this.#slidesCount = 0;
      let glide = document.createElement('jtbc-glide');
      let div = document.createElement('div');
      let track = document.createElement('div');
      let slides = document.createElement('div');
      let controls = document.createElement('div');
      let jButtonPrev = document.createElement('div');
      let tButtonPrevSvg = document.createElement('jtbc-svg');
      let bButtonNext = document.createElement('div');
      let cButtonNextSvg = document.createElement('jtbc-svg');
      div.classList.add('glide');
      track.classList.add('glide__track');
      track.setAttribute('part', 'track');
      track.setAttribute('data-glide-el', 'track');
      slides.classList.add('glide__slides');
      controls.setAttribute('data-glide-el', 'controls');
      jButtonPrev.classList.add('button');
      jButtonPrev.classList.add('button-prev');
      jButtonPrev.setAttribute('data-glide-dir', '<');
      jButtonPrev.setAttribute('part', 'button-prev');
      tButtonPrevSvg.setAttribute('name', 'arrow_left');
      tButtonPrevSvg.setAttribute('part', 'button-prev-svg');
      jButtonPrev.append(tButtonPrevSvg);
      bButtonNext.classList.add('button');
      bButtonNext.classList.add('button-next');
      bButtonNext.setAttribute('data-glide-dir', '>');
      bButtonNext.setAttribute('part', 'button-next');
      cButtonNextSvg.setAttribute('name', 'arrow_right');
      cButtonNextSvg.setAttribute('part', 'button-next-svg');
      bButtonNext.append(cButtonNextSvg);
      controls.append(jButtonPrev, bButtonNext);
      xCarousel.getDirectChildrenByTagName('item').forEach(item => {
        this.#slidesCount ++;
        let contentItems = [];
        let slide = document.createElement('div');
        let content = document.createElement('div');
        slide.classList.add('glide__slide');
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
        slides.append(slide);
      });
      track.append(slides);
      div.append(track, controls);
      glide.append(div);
      glide.setAttribute('param', JSON.stringify(this.#getParam()));
      el.append(glide);
      el.loadComponents();
    };
    this.dispatchEvent(new CustomEvent('renderend'));
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'breakpoints':
      {
        this.breakpoints = newVal;
        break;
      };
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
    checkComputedStyle(this.container, 'display', 'block').then(() => {
      this.render();
      this.ready = true;
      this.#initObserver();
    });
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
      <div part="container" class="container" theme="default" style="display:none">
        <div part="container-box" class="box"></div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
  };
};