export default class aheader extends HTMLElement {
  static get observedAttributes() {
    return ['arrow', 'pitchon'];
  };

  #arrow = 'arrow_down';
  #pitchon = null;

  get arrow() {
    return this.#arrow;
  };

  get pitchon() {
    return this.#pitchon;
  };

  set arrow(arrow) {
    this.#arrow = arrow;
    this.topmenu.querySelectorAll('dt').forEach(dt => dt.querySelector('span.icon jtbc-svg')?.setAttribute('name', arrow));
  };

  set pitchon(pitchon) {
    this.#pitchon = pitchon;
    this.#selectAnchor();
  };

  #initEvents() {
    let topmenu = this.topmenu;
    let container = this.container;
    window.addEventListener('scroll', e => {
      if (document.documentElement.scrollTop >= this.offsetHeight)
      {
        this.topmenu.classList.add('fixed');
        this.placeholder.classList.add('on');
      }
      else
      {
        this.topmenu.classList.remove('fixed');
        this.placeholder.classList.remove('on');
      };
    });
    container.delegateEventListener('navicon', 'click', function(){
      if (!this.classList.contains('on'))
      {
        this.classList.add('on');
        topmenu.querySelector('mainmenu')?.classList.add('on');
      }
      else
      {
        this.classList.remove('on');
        topmenu.querySelector('mainmenu')?.classList.remove('on');
      };
    });
    topmenu.delegateEventListener('span.icon', 'click', function() {
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
      let topmenu = this.topmenu;
      topmenu.querySelectorAll('mainmenu li').forEach(li => {
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
    let topmenu = this.topmenu;
    let container = this.container;
    let avatar = container.querySelector('div.avatar').empty();
    let mainmenu = topmenu.querySelector('mainmenu').empty();
    let xAvatar = this.querySelector('avatar');
    let xMenu = this.querySelector('menu');
    if (xAvatar != null)
    {
      let avatarImg = document.createElement('img');
      avatarImg.setAttribute('part', 'avatar-src');
      avatarImg.setAttribute('src', xAvatar.getAttribute('src'));
      if (xAvatar.hasAttribute('title'))
      {
        avatarImg.setAttribute('title', xAvatar.getAttribute('title'));
      };
      if (!xAvatar.hasAttribute('url'))
      {
        avatar.append(avatarImg);
      }
      else
      {
        let avatarAnchor = document.createElement('a');
        avatarAnchor.setAttribute('href', xAvatar.getAttribute('url'));
        avatarAnchor.append(avatarImg);
        avatar.append(avatarAnchor);
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
      ul.setAttribute('part', 'mainmenu-ul');
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
          <div part="left" class="left">
            <div part="avatar" class="avatar"></div>
            <div part="slogan" class="slogan"><slot name="slogan"></slot></div>
          </div>
          <div part="right" class="right"><slot name="right"></slot></div>
          <navicon><span class="line"></span></navicon>
        </div>
      </div>
      <div part="topmenu" class="topmenu" style="display:none"><div class="box"><mainmenu part="mainmenu"></mainmenu></div></div>
      <div part="placeholder" class="placeholder"></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.topmenu = shadowRoot.querySelector('div.topmenu');
    this.container = shadowRoot.querySelector('div.container');
    this.placeholder = shadowRoot.querySelector('div.placeholder');
  };
};