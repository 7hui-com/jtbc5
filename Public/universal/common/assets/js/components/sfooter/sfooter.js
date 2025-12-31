export default class sfooter extends HTMLElement {
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
    let bottom = container.querySelector('div.bottom');
    let copyright = container.querySelector('div.copyright');
    let xBottom = this.querySelector('bottom');
    let xCopyright = this.querySelector('copyright');
    const imgAllowedAttrs = ['alt', 'part', 'width', 'height', 'sizes', 'srcset'];
    const appendContent = (source, target) => {
      source.querySelectorAll('text,href,picture').forEach(el => {
        let tagName = el.tagName.toLowerCase();
        let span = document.createElement('span');
        if (el.hasAttribute('part'))
        {
          span.setAttribute('part', el.getAttribute('part'));
        };
        if (tagName == 'text')
        {
          span.classList.add('text');
          span.innerText = el.innerText;
          if (el.hasAttribute('size'))
          {
            span.setAttribute('size', el.getAttribute('size'));
          };
        }
        else if (tagName == 'href')
        {
          span.classList.add('href');
          let anchor = document.createElement('a');
          if (el.hasAttribute('image'))
          {
            let image = document.createElement('img');
            image.setAttribute('part', 'image');
            image.setAttribute('src', el.getAttribute('image'));
            if (el.hasAttribute('title'))
            {
              image.setAttribute('title', el.getAttribute('title'));
            };
            Object.keys(el.dataset).forEach(key => {
              if (imgAllowedAttrs.includes(key))
              {
                image.setAttribute(key, el.dataset[key]);
              };
            });
            anchor.append(image);
          }
          else
          {
            anchor.innerText = el.getAttribute('title') ?? '';
          };
          if (el.hasAttribute('url'))
          {
            anchor.setAttribute('href', el.getAttribute('url'));
          };
          if (el.hasAttribute('target'))
          {
            anchor.setAttribute('target', el.getAttribute('target'));
          };
          span.append(anchor);
        }
        else if (tagName == 'picture')
        {
          span.classList.add('picture');
          let image = document.createElement('img');
          image.setAttribute('part', 'picture');
          image.setAttribute('src', el.getAttribute('src'));
          if (el.hasAttribute('title'))
          {
            image.setAttribute('title', el.getAttribute('title'));
          };
          Object.keys(el.dataset).forEach(key => {
            if (imgAllowedAttrs.includes(key))
            {
              image.setAttribute(key, el.dataset[key]);
            };
          });
          span.append(image);
        };
        target.append(span);
      });
    };
    if (xBottom != null)
    {
      xBottom.querySelectorAll('section').forEach(section => {
        let index = section.index();
        let el = bottom.querySelector('div.section-' + index);
        if (el != null)
        {
          el.querySelector('h3').innerText = section.getAttribute('title') ?? '';
          appendContent(section, el.querySelector('slot.content').empty());
        };
      });
    };
    if (xCopyright != null)
    {
      xCopyright.querySelectorAll('section').forEach(section => {
        let index = section.index();
        let el = copyright.querySelector('div.section-' + index);
        if (el != null)
        {
          appendContent(section, el.querySelector('slot.content').empty());
        };
      });
    };
    this.dispatchEvent(new CustomEvent('renderend'));
    this.parentElement.setAttribute('footer', 'renderend');
  };

  connectedCallback() {
    this.render();
    this.#initEvents();
    this.#initObserver();
    this.ready = true;
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
        <div part="bottom" class="bottom">
          <div part="bottom-box" class="box">
            <div class="section section-1" index="1"><h3 part="h3"></h3><div class="content"><slot class="content" name="content-1"></slot></div></div>
            <div class="section section-2" index="2"><h3 part="h3"></h3><div class="content"><slot class="content" name="content-2"></slot></div></div>
            <div class="section section-3" index="3"><h3 part="h3"></h3><div class="content"><slot class="content" name="content-3"></slot></div></div>
            <div class="section section-4" index="4"><h3 part="h3"></h3><div class="content"><slot class="content" name="content-4"></slot></div></div>
          </div>
        </div>
        <div part="copyright" class="copyright">
          <div part="copyright-box" class="box">
            <div class="section section-1" index="1"><div class="content"><slot class="content" name="copyright-left"></slot></div></div>
            <div class="section section-2" index="2"><div class="content"><slot class="content" name="copyright-right"></slot></div></div>
          </div>
        </div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
  };
};