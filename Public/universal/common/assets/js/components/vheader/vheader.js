export default class vheader extends HTMLElement {
  static get observedAttributes() {
    return ['arrow', 'pitchon', 'slotmode'];
  };

  #arrow = 'arrow_down';
  #pitchon = null;
  #slotmode = 'all';

  get arrow() {
    return this.#arrow;
  };

  get pitchon() {
    return this.#pitchon;
  };

  get slotmode() {
    return this.#slotmode;
  };

  set pitchon(pitchon) {
    this.#pitchon = pitchon;
    this.#selectAnchor();
  };

  set arrow(arrow) {
    this.#arrow = arrow;
    this.container.querySelectorAll('dt').forEach(dt => dt.querySelector('span.icon jtbc-svg')?.setAttribute('name', arrow));
  };

  set slotmode(slotmode) {
    this.#slotmode = slotmode;
    this.container.setAttribute('slotmode', slotmode);
  };

  #initEvents() {
    let container = this.container;
    window.addEventListener('scroll', e => {
      container.classList.toggle('sticky', (window.scrollY > 0));
    });
    container.delegateEventListener('navicon', 'click', function(){
      if (!this.classList.contains('on'))
      {
        this.classList.add('on');
        container.querySelector('mainmenu')?.classList.add('on');
      }
      else
      {
        this.classList.remove('on');
        container.querySelector('mainmenu')?.classList.remove('on');
      };
    });
    container.delegateEventListener('span.icon', 'click', function() {
      this.parentElement.parentElement.parentElement.classList.toggle('opened');
    });
    container.delegateEventListener('slot', 'slotchange', function(){
      this.assignedElements().forEach(el => {
        el.classList.add('slotted');
        if (el.getAttribute('slot') == 'right')
        {
          container.classList.add('centre');
        };
      });
      if (this.parentElement.classList.contains('submenu'))
      {
        this.parentElement.classList.add('slotted');
      };
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

  #selectAnchor() {
    if (this.ready == true)
    {
      let container = this.container;
      container.querySelectorAll('mainmenu li').forEach(li => {
        if (this.pitchon != null && li.getAttribute('name') == this.pitchon)
        {
          li.classList.add('on');
        }
        else
        {
          li.classList.remove('on');
        };
      });
    };
  };

  render() {
    let menuItems = [];
    let container = this.container;
    let logo = container.querySelector('logo').empty();
    let mainmenu = container.querySelector('mainmenu').empty();
    let xLogo = this.querySelector('logo');
    let xMenu = this.querySelector('menu');
    if (xLogo != null)
    {
      let logoImg = document.createElement('img');
      logoImg.setAttribute('src', xLogo.getAttribute('src'));
      if (xLogo.hasAttribute('title'))
      {
        logoImg.setAttribute('title', xLogo.getAttribute('title'));
      };
      if (!xLogo.hasAttribute('url'))
      {
        logo.append(logoImg);
      }
      else
      {
        let logoAnchor = document.createElement('a');
        logoAnchor.setAttribute('href', xLogo.getAttribute('url'));
        logoAnchor.append(logoImg);
        logo.append(logoAnchor);
      };
    };
    if (xMenu != null)
    {
      const createHref = source => {
        let anchor = document.createElement('a');
        anchor.innerText = source.getAttribute('title');
        anchor.setAttribute('part', 'anchor');
        anchor.setAttribute('href', source.getAttribute('url'));
        ['name', 'target'].forEach(attr => {
          if (source.hasAttribute(attr))
          {
            anchor.setAttribute(attr, source.getAttribute(attr));
          };
        });
        return anchor;
      };
      xMenu.getDirectChildrenByTagName('href').forEach(el => {
        let menuItem = null;
        let subhref = el.querySelectorAll('href');
        if (subhref.length == 0)
        {
          menuItem = createHref(el);
        }
        else
        {
          menuItem = document.createElement('div');
          menuItem.classList.add('premier');
          menuItem.setAttribute('part', 'premier');
          if (el.hasAttribute('name'))
          {
            menuItem.setAttribute('name', el.getAttribute('name'));
          };
          let span = document.createElement('span');
          let icon = document.createElement('span');
          let jtbcSvg = document.createElement('jtbc-svg');
          span.classList.add('text');
          icon.classList.add('icon');
          icon.setAttribute('part', 'icon');
          jtbcSvg.setAttribute('name', this.arrow);
          icon.html(jtbcSvg.outerHTML).then(() => span.append(icon));
          if (el.hasAttribute('url'))
          {
            span.append(createHref(el));
          }
          else
          {
            let em = document.createElement('em');
            em.innerText = el.getAttribute('title');
            if (el.hasAttribute('name'))
            {
              em.setAttribute('name', el.getAttribute('name'));
            };
            span.append(em);
          };
          let submenu = document.createElement('div');
          submenu.classList.add('submenu');
          if (el.hasAttribute('name'))
          {
            let subslot = document.createElement('slot');
            subslot.setAttribute('name', 'submenu-' + el.getAttribute('name'));
            submenu.setAttribute('part', 'submenu-' + el.getAttribute('name'));
            submenu.append(subslot);
          };
          let ol = document.createElement('ol');
          subhref.forEach(href => {
            let li = document.createElement('li');
            li.append(createHref(href));
            ol.append(li);
          });
          submenu.append(ol);
          menuItem.append(span, submenu);
        };
        menuItems.push(menuItem);
      });
    };
    if (menuItems.length != 0)
    {
      let ul = document.createElement('ul');
      menuItems.forEach(item => {
        let li = document.createElement('li');
        if (item.hasAttribute('name'))
        {
          li.setAttribute('name', item.getAttribute('name'));
        };
        li.append(item);
        ul.append(li);
      });
      mainmenu.append(ul);
    };
    this.dispatchEvent(new CustomEvent('renderend'));
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'arrow':
      {
        this.arrow = newVal;
        break;
      };
      case 'pitchon':
      {
        this.pitchon = newVal;
        break;
      };
      case 'slotmode':
      {
        this.slotmode = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.render();
    this.#selectAnchor();
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
      <div part="container" class="container" slotmode="all" style="display:none">
        <div class="box">
          <logo part="logo"></logo>
          <mainmenu part="mainmenu"></mainmenu>
          <div class="right"><slot name="right"></slot></div>
          <div class="navicon">
            <slot name="navicon-right"></slot>
            <navicon><span class="line"></span></navicon>
          </div>
        </div>
      </div>
      <div part="placeholder" class="placeholder"></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.#initEvents();
  };
};