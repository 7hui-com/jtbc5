export default class lfooter extends HTMLElement {
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
          anchor.innerText = el.getAttribute('title') ?? '';
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
          span.append(image);
        };
        target.append(span);
      });
    };
    if (xBottom != null)
    {
      let xLogo = xBottom.querySelector('logo');
      let logo = bottom.querySelector('div.logo');
      let sections = bottom.querySelector('div.sections');
      if (logo != null && xLogo != null)
      {
        let logoImg = document.createElement('img');
        xLogo.getAttributeNames().forEach(name => logoImg.setAttribute(name, xLogo.getAttribute(name)));
        logo.append(logoImg);
        if (xLogo.childElementCount != 0)
        {
          appendContent(xLogo, logo.parentElement.querySelector('slot.content').empty());
        };
      };
      xBottom.querySelectorAll('section').forEach(section => {
        let index = section.index();
        let newSection = document.createElement('div');
        let newSectionH3 = document.createElement('h3');
        let newSectionContent = document.createElement('div');
        let newSectionSlotContent = document.createElement('slot');
        newSection.classList.add('section');
        newSectionH3.setAttribute('part', 'h3');
        newSectionH3.innerText = section.getAttribute('title') ?? '';
        newSectionContent.classList.add('content');
        newSectionSlotContent.classList.add('content');
        newSectionSlotContent.setAttribute('name', 'content-' + index);
        newSectionContent.append(newSectionSlotContent);
        newSection.append(newSectionH3, newSectionContent);
        sections.append(newSection);
        appendContent(section, newSectionSlotContent);
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
            <div part="card" class="card">
              <div part="logo" class="logo"></div>
              <div class="content"><slot class="content" name="content-card"></slot></div>
            </div>
            <div part="sections" class="sections"></div>
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
    this.#initEvents();
  };
};