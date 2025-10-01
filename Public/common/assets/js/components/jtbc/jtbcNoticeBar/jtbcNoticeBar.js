export default class jtbcNoticeBar extends HTMLElement {
  static get observedAttributes() {
    return ['data', 'icon', 'interval'];
  };

  #current = null;
  #data = [];
  #icon = 'horn';
  #interval = 5000;

  get data() {
    return this.#data;
  };

  get icon() {
    return this.#icon;
  };

  get interval() {
    return this.#interval;
  };

  set data(data) {
    try
    {
      this.#data = JSON.parse(data);
      if (!Array.isArray(this.#data))
      {
        this.#data = [];
      };
    }
    catch(e) {};
    this.render();
  };

  set icon(icon) {
    let el = this.container.querySelector('jtbc-svg.icon-svg');
    if (el != null)
    {
      this.#icon = icon;
      el.setAttribute('name', icon);
    };
  };

  set interval(interval) {
    let minInterval = 1000;
    if (isFinite(interval))
    {
      this.#interval = Math.max(minInterval, Number.parseInt(interval));
    };
  };

  #initEvents() {
    this.container.addEventListener('mouseenter', function(){
      this.classList.add('on');
    });
    this.container.addEventListener('mouseleave', function(){
      this.classList.remove('on');
    });
  };

  #startInterval() {
    let container = this.container;
    setTimeout(() => {
      if (!container.classList.contains('on'))
      {
        let content = container.querySelector('div.content');
        let firstItem = container.querySelector('div.items').firstElementChild;
        let currentItem = this.#current ?? firstItem;
        if (currentItem != null)
        {
          if (currentItem.classList.contains('clone'))
          {
            currentItem = this.#current = firstItem;
            content.scrollTo({'top': 0, 'behavior': 'instant'});
          };
          let nextItem = currentItem.nextElementSibling;
          if (nextItem != null)
          {
            this.#current = nextItem;
            content.scrollTo({'top': (container.offsetHeight * (nextItem.index() - 1)), 'behavior': 'smooth'});
          };
        };
      };
      this.#startInterval();
    }, this.#interval);
  };

  render() {
    let index = 0;
    let firstItem = null;
    let el = this.container.querySelector('div.items').empty();
    this.data.forEach(item => {
      if (item.hasOwnProperty('title'))
      {
        let div = document.createElement('div');
        div.classList.add('item');
        div.setAttribute('part', 'item');
        div.setAttribute('index', index);
        if (item.hasOwnProperty('linkurl') && item.linkurl != null && item.linkurl.length != 0)
        {
          let anchor = document.createElement('a');
          anchor.setAttribute('part', 'anchor');
          anchor.classList.add('anchor');
          anchor.setAttribute('href', item.linkurl);
          anchor.setAttribute('target', item.hasOwnProperty('target')? item.target: '_self');
          anchor.innerText = item.title;
          div.append(anchor);
        }
        else
        {
          let title = document.createElement('span');
          title.setAttribute('part', 'title');
          title.innerText = item.title;
          div.append(title);
        };
        if (item.hasOwnProperty('subtitle'))
        {
          let subtitle = document.createElement('span');
          subtitle.setAttribute('part', 'subtitle');
          subtitle.classList.add('subtitle');
          subtitle.innerText = item.subtitle;
          div.append(subtitle);
        };
        el.append(div);
        index += 1;
        if (index === 1)
        {
          firstItem = div.cloneNode(true);
        };
      };
    });
    if (firstItem != null)
    {
      firstItem.classList.add('clone');
      el.append(firstItem);
    };
    this.#startInterval();
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'data':
      {
        this.data = newVal;
        break;
      };
      case 'icon':
      {
        this.icon = newVal;
        break;
      };
      case 'interval':
      {
        this.interval = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#initEvents();
  };

  constructor() {
    super();
    this.ready = false;
    this.baseURL = import.meta.url.substring(0, import.meta.url.lastIndexOf('/') + 1);
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <container part="container" style="display:none">
        <div part="notice" class="notice">
          <div part="icon" class="icon"><jtbc-svg part="icon-svg" class="icon-svg" name="horn"></jtbc-svg></div>
          <div part="content" class="content"><div class="items"></div></div>
        </div>
      </container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.container = shadowRoot.querySelector('container');
    this.container.loadComponents();
  };
};