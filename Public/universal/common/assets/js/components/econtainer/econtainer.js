export default class econtainer extends HTMLElement {
  static get observedAttributes() {
    return ['bgcolor', 'section-title', 'section-subtitle', 'section-nickname'];
  };

  #section = {'title': null, 'subtitle': null, 'nickname': 'alan'};

  #initEvents() {
    let container = this.container;
    container.delegateEventListener('slot', 'slotchange', function(){
      this.assignedElements().forEach(el => el.classList.add('slotted'));
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
        };
      });
    });
  };

  #resetSection() {
    let container = this.container;
    let section = container.querySelector('div.section');
    let sectionTitle = this.#section.title ?? '';
    let sectionSubtitle = this.#section.subtitle ?? '';
    let sectionNickname = this.#section.nickname ?? '';
    if (sectionTitle.length === 0 && sectionSubtitle.length === 0)
    {
      section.classList.add('hide');
    }
    else
    {
      section.classList.remove('hide');
      section.setAttribute('nickname', sectionNickname);
      section.querySelector('div.title span.text').innerText = sectionTitle;
      section.querySelector('div.subtitle span.text').innerText = sectionSubtitle;
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'bgcolor':
      {
        this.style.setProperty('--container-background', newVal);
        break;
      };
      case 'section-title':
      {
        this.#section.title = newVal;
        this.#resetSection();
        break;
      };
      case 'section-subtitle':
      {
        this.#section.subtitle = newVal;
        this.#resetSection();
        break;
      };
      case 'section-nickname':
      {
        this.#section.nickname = newVal;
        this.#resetSection();
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
        <div part="cushion" class="cushion"><slot name="cushion"></slot></div>
        <div part="container" class="container"><div part="section" class="section container_section hide" nickname="alan"><div part="section-title" class="title"><span part="section-title-text" class="text"></span></div><div part="section-subtitle" class="subtitle"><span part="section-subtitle-text" class="text"></span></div></div><div part="container-box" class="box"><div part="sidebar" class="sidebar hide"><slot name="sidebar"></slot></div><div part="main" class="main"><slot name="main"></slot></div></div></div>
      </container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('container');
    this.#initEvents();
  };
};