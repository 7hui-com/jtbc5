export default class rheader extends HTMLElement {
  static get observedAttributes() {
    return ['pitchon'];
  };

  #pitchon = null;

  get pitchon() {
    return this.#pitchon;
  };

  set pitchon(pitchon) {
    this.#pitchon = pitchon;
    this.#selectAnchor();
  };

  #initEvents() {
    let mainmenu = this.mainmenu;
    let container = this.container;
    window.addEventListener('scroll', e => {
      container.classList.toggle('sticky', (window.scrollY > 0));
    });
    container.delegateEventListener('navicon', 'click', function(){
      if (mainmenu.classList.contains('on'))
      {
        mainmenu.classList.remove('on');
      }
      else
      {
        mainmenu.classList.add('on');
      };
    });
    container.delegateEventListener('span.icon', 'click', function() {
      this.parentElement.parentElement.parentElement.classList.toggle('opened');
    });
    mainmenu.addEventListener('click', e => {
      if (e.target == mainmenu)
      {
        mainmenu.classList.remove('on');
      };
    });
    mainmenu.delegateEventListener('navicon', 'click', function(){
      if (mainmenu.classList.contains('on'))
      {
        mainmenu.classList.remove('on');
      };
    });
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

  #selectAnchor() {
    if (this.ready == true)
    {
      let mainmenu = this.mainmenu;
      mainmenu.querySelectorAll('mainmenu li').forEach(li => {
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
    let mainmenu = this.mainmenu;
    let container = this.container;
    let logo = container.querySelector('logo').empty();
    let mm = mainmenu.querySelector('mainmenu').empty();
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
          menuItem = document.createElement('dl');
          if (el.hasAttribute('name'))
          {
            menuItem.setAttribute('name', el.getAttribute('name'));
          };
          let dt = document.createElement('dt');
          if (el.hasAttribute('url'))
          {
            dt.append(createHref(el));
          }
          else
          {
            let span = document.createElement('span');
            span.innerText = el.getAttribute('title');
            if (el.hasAttribute('name'))
            {
              span.setAttribute('name', el.getAttribute('name'));
            };
            dt.append(span);
          };
          menuItem.append(dt);
          subhref.forEach(href => {
            let dd = document.createElement('dd');
            dd.append(createHref(href));
            menuItem.append(dd);
          });
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
      mm.append(ul);
    };
    this.dispatchEvent(new CustomEvent('renderend'));
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'pitchon':
      {
        this.pitchon = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.render();
    this.#initEvents();
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
      <div part="container" class="container" style="display:none">
        <div part="container-box" class="box">
          <logo part="logo"></logo>
          <navicon><span class="line"></span></navicon>
        </div>
      </div>
      <div class="mainmenu" style="display:none">
        <div class="box">
          <navicon><span class="line"></span></navicon>
          <mainmenu part="mainmenu"></mainmenu>
          <div class="bottom"><slot name="bottom"></slot></div>
        </div>
      </div>
      <div part="placeholder" class="placeholder"></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.mainmenu = shadowRoot.querySelector('div.mainmenu');
  };
};