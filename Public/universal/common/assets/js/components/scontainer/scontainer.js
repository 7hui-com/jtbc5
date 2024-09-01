export default class scontainer extends HTMLElement {
  static get observedAttributes() {
    return ['breadcrumb', 'headline-bg', 'headline-title', 'headline-subtitle'];
  };

  #breadcrumb;
  #headline = {};

  get breadcrumb() {
    return this.#breadcrumb;
  };

  set breadcrumb(breadcrumb) {
    let container = this.container;
    let navigation = container.querySelector('div.navigation');
    if (breadcrumb.length === 0)
    {
      this.#breadcrumb = null;
      navigation.classList.add('hide');
      navigation.querySelector('div.box').empty();
    }
    else
    {
      this.#breadcrumb = breadcrumb;
      let jtbcBreadcrumb = document.createElement('jtbc-breadcrumb');
      jtbcBreadcrumb.setAttribute('data', breadcrumb);
      jtbcBreadcrumb.setAttribute('part', 'breadcrumb');
      navigation.classList.remove('hide');
      navigation.querySelector('div.box').html(jtbcBreadcrumb.outerHTML);
    };
  };

  #initEvents() {
    let container = this.container;
    container.querySelectorAll('div.headline slot[name=headline]').forEach(slot => {
      slot.addEventListener('slotchange', function(){
        this.assignedElements().forEach(el => el.classList.add('slotted'));
      });
    });
    container.querySelectorAll('div.container slot[name=main]').forEach(slot => {
      slot.addEventListener('slotchange', function(){
        this.assignedElements().forEach(el => el.classList.add('slotted'));
      });
    });
    container.querySelectorAll('div.container slot[name=sidebar]').forEach(slot => {
      slot.addEventListener('slotchange', function(){
        let assignedElements = this.assignedElements();
        let elementCount = assignedElements.length;
        if (elementCount === 0)
        {
          this.parentElement.classList.add('hide');
        }
        else
        {
          this.parentElement.classList.remove('hide');
          assignedElements.forEach(el => el.classList.add('slotted'));
        };
      });
    });
  };

  #resetHeadline() {
    let container = this.container;
    let headline = container.querySelector('div.headline');
    let headlineBg = this.#headline.bg ?? '';
    let headlineTitle = this.#headline.title ?? '';
    let headlineSubtitle = this.#headline.subtitle ?? '';
    if (headlineBg.length === 0)
    {
      headline.classList.add('hide');
    }
    else
    {
      headline.classList.remove('hide');
      headline.style.backgroundImage = 'url(' + headlineBg + ')';
      headline.querySelector('span.title').innerText = headlineTitle;
      headline.querySelector('span.subtitle').innerText = headlineSubtitle;
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'breadcrumb':
      {
        this.breadcrumb = newVal;
        break;
      };
      case 'headline-bg':
      {
        this.#headline.bg = newVal;
        this.#resetHeadline();
        break;
      };
      case 'headline-title':
      {
        this.#headline.title = newVal;
        this.#resetHeadline();
        break;
      };
      case 'headline-subtitle':
      {
        this.#headline.subtitle = newVal;
        this.#resetHeadline();
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <container style="display:none">
        <div part="headline" class="headline hide"><div part="headline-box" class="box"><slot name="headline"><div part="headline-text" class="text"><span part="headline-title" class="title"></span><span part="headline-subtitle" class="subtitle"></span></div></slot></div></div>
        <div part="navigation" class="navigation hide"><div part="navigation-box" class="box"></div></div>
        <div part="container" class="container"><div part="container-box" class="box"><div part="sidebar" class="sidebar hide"><slot name="sidebar"></slot></div><div part="main" class="main"><slot name="main"></slot></div></div></div>
      </container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('container');
    this.#initEvents();
  };
};