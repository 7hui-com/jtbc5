import validation from '../../../../../../common/assets/js/library/validation/validation.js';

export default class xlist extends HTMLElement {
  static get observedAttributes() {
    return ['gap', 'max-items', 'theme'];
  };

  #gap = 20;
  #maxItems = 8;
  #theme = 'default';

  get gap() {
    return this.#gap;
  };

  get maxItems() {
    return this.#maxItems;
  };

  get theme() {
    return this.#theme;
  };

  set gap(gap) {
    this.#gap = isFinite(gap)? Number.parseInt(gap): 20;
    this.container.setProperty('--gap', this.#gap + 'px');
  };

  set maxItems(maxItems) {
    this.#maxItems = Math.max(isFinite(maxItems)? Number.parseInt(maxItems): 2, 2);
  };

  set theme(theme) {
    this.#theme = theme;
    this.container.setAttribute('theme', theme);
  };

  render() {
    let container = this.container;
    let xList = this.querySelector('list');
    let el = container.querySelector('div.items').empty();
    if (xList != null)
    {
      let itemsCount = 0;
      let isSelected = false;
      xList.getDirectChildrenByTagName('item').forEach(item => {
        itemsCount += 1;
        if (itemsCount <= this.maxItems)
        {
          let hasImage = false;
          if (item.hasAttribute('image') && item.getAttribute('image') != '')
          {
            hasImage = true;
          };
          let div = document.createElement('div');
          let text = document.createElement('div');
          let title = document.createElement('div');
          let titleAnchor = document.createElement('a');
          let summary = document.createElement('div');
          div.classList.add('item');
          div.setAttribute('part', 'item');
          if (isSelected === false && hasImage === true)
          {
            isSelected = true;
            let image = document.createElement('div');
            let imageSrc = document.createElement('img');
            let imageAnchor = document.createElement('a');
            image.classList.add('image');
            image.setAttribute('part', 'image');
            if (item.hasOwnProperty('tag'))
            {
              image.setAttribute('tag', item.tag);
            };
            imageSrc.setAttribute('part', 'image-src');
            imageSrc.setAttribute('src', item.getAttribute('image'));
            imageSrc.setAttribute('alt', item.getAttribute('title') ?? '');
            imageAnchor.setAttribute('part', 'image-anchor');
            imageAnchor.setAttribute('title', item.getAttribute('title') ?? '');
            imageAnchor.setAttribute('href', item.getAttribute('link-href'));
            imageAnchor.setAttribute('target', item.getAttribute('link-target') ?? '_self');
            imageAnchor.append(imageSrc);
            image.append(imageAnchor);
            div.classList.add('chief');
            div.append(image);
          };
          text.classList.add('text');
          text.setAttribute('part', 'text');
          if (item.hasOwnProperty('tag'))
          {
            text.setAttribute('tag', item.tag);
          };
          title.classList.add('title');
          title.setAttribute('part', 'title');
          titleAnchor.classList.add('anchor');
          titleAnchor.setAttribute('part', 'title-anchor');
          titleAnchor.setAttribute('href', item.getAttribute('link-href'));
          titleAnchor.setAttribute('target', item.getAttribute('link-target') ?? '_self');
          titleAnchor.innerText = item.getAttribute('title') ?? '';
          title.append(titleAnchor);
          if (item.hasAttribute('date') && validation.isDate(item.getAttribute('date')))
          {
            let year = document.createElement('span');
            let month = document.createElement('span');
            let day = document.createElement('span');
            let dateEl = document.createElement('div');
            let dateValue = new Date(item.getAttribute('date'));
            const formatValue = value => Number.parseInt(value) < 10? '0' + value: value;
            dateEl.classList.add('date');
            dateEl.setAttribute('part', 'date');
            year.classList.add('year');
            year.setAttribute('part', 'date-year');
            year.innerText = dateValue.getFullYear();
            month.classList.add('month');
            month.setAttribute('part', 'date-month');
            month.innerText = formatValue(dateValue.getMonth() + 1);
            day.classList.add('day');
            day.setAttribute('part', 'date-day');
            day.innerText = formatValue(dateValue.getDate());
            dateEl.append(year, month, day);
            title.append(dateEl);
          };
          summary.classList.add('summary');
          summary.setAttribute('part', 'summary');
          summary.innerText = item.getAttribute('summary') ?? '';
          text.append(title, summary);
          div.append(text);
          if (div.querySelector('div.image') != null)
          {
            el.prepend(div);
          }
          else
          {
            el.append(div);
          };
        };
      });
    };
    this.dispatchEvent(new CustomEvent('renderend'));
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'gap':
      {
        this.gap = newVal;
        break;
      };
      case 'max-items':
      {
        this.maxItems = newVal;
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
    this.render();
    this.ready = true;
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div part="container" class="container" theme="default" style="display:none">
        <div part="items" class="items"></div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
  };
};