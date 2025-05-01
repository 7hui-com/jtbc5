export default class lheader extends HTMLElement {
  static get observedAttributes() {
    return ['alignment', 'arrow', 'pitchon'];
  };

  #alignment = 'auto';
  #arrow = 'arrow_down';
  #pitchon = null;

  get alignment() {
    return this.#alignment;
  };

  get arrow() {
    return this.#arrow;
  };

  get pitchon() {
    return this.#pitchon;
  };

  set alignment(alignment) {
    this.#alignment = alignment;
    this.container.setAttribute('alignment', alignment);
  };

  set pitchon(pitchon) {
    this.#pitchon = pitchon;
    this.#selectAnchor();
  };

  set arrow(arrow) {
    this.#arrow = arrow;
    this.container.querySelectorAll('dt').forEach(dt => dt.querySelector('span.icon jtbc-svg')?.setAttribute('name', arrow));
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
        container.querySelector('div.mainmenu')?.classList.add('on');
      }
      else
      {
        this.classList.remove('on');
        container.querySelector('div.mainmenu')?.classList.remove('on');
      };
    });
    container.delegateEventListener('span.icon', 'click', function() {
      this.parentElement.parentElement.parentElement.classList.toggle('opened');
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
      let container = this.container;
      container.querySelectorAll('.menu li').forEach(li => {
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
    let leftMenuItems = [];
    let rightMenuItems = [];
    let container = this.container;
    let logo = container.querySelector('logo').empty();
    let leftmenu = container.querySelector('leftmenu').empty();
    let mainmenu = container.querySelector('mainmenu').empty();
    let rightmenu = container.querySelector('rightmenu').empty();
    let xLogo = this.querySelector('logo');
    let xLeftMenu = this.querySelector('leftmenu');
    let xRightMenu = this.querySelector('rightmenu');
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
    if (xLeftMenu != null)
    {
      xLeftMenu.getDirectChildrenByTagName('href').forEach(el => {
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
          let icon = document.createElement('span');
          let jtbcSvg = document.createElement('jtbc-svg');
          icon.classList.add('icon');
          jtbcSvg.setAttribute('name', this.arrow);
          icon.append(jtbcSvg);
          dt.append(icon);
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
        leftMenuItems.push(menuItem);
      });
      if (leftMenuItems.length != 0)
      {
        let ul = document.createElement('ul');
        leftMenuItems.forEach(item => {
          let li = document.createElement('li');
          if (item.hasAttribute('name'))
          {
            li.setAttribute('name', item.getAttribute('name'));
          };
          li.append(item);
          ul.append(li);
        });
        leftmenu.append(ul);
      };
    };
    if (xRightMenu != null)
    {
      xRightMenu.getDirectChildrenByTagName('href').forEach(el => {
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
          let icon = document.createElement('span');
          let jtbcSvg = document.createElement('jtbc-svg');
          icon.classList.add('icon');
          jtbcSvg.setAttribute('name', this.arrow);
          icon.append(jtbcSvg);
          dt.append(icon);
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
        rightMenuItems.push(menuItem);
      });
      if (rightMenuItems.length != 0)
      {
        let ul = document.createElement('ul');
        rightMenuItems.forEach(item => {
          let li = document.createElement('li');
          if (item.hasAttribute('name'))
          {
            li.setAttribute('name', item.getAttribute('name'));
          };
          li.append(item);
          ul.append(li);
        });
        rightmenu.append(ul);
      };
    };
    if (leftMenuItems.length != 0 || rightMenuItems.length != 0)
    {
      let ul = document.createElement('ul');
      leftMenuItems.concat(rightMenuItems).forEach(item => {
        let li = document.createElement('li');
        if (item.hasAttribute('name'))
        {
          li.setAttribute('name', item.getAttribute('name'));
        };
        li.append(item.cloneNode(true));
        ul.append(li);
      });
      mainmenu.append(ul);
    };
    this.container.loadComponents().then(() => {
      this.dispatchEvent(new CustomEvent('renderend'));
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'alignment':
      {
        this.alignment = newVal;
        break;
      };
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
      <div part="container" class="container" style="display:none">
        <div part="container-box" class="box">
          <div class="sides" position="left"><slot name="left"></slot><leftmenu part="leftmenu" class="menu"></leftmenu></div>
          <logo part="logo"></logo>
          <div class="sides" position="right"><rightmenu part="rightmenu" class="menu"></rightmenu><slot name="right"></slot></div>
          <div class="mainmenu"><mainmenu class="mainmenu menu"></mainmenu></div>
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