export default class jtbcBreadcrumb extends HTMLElement {
  static get observedAttributes() {
    return ['data', 'separator'];
  };

  #tag = 'a';
  #allowTags = ['a', 'span'];
  #data = [];
  #separator = 'arrow_right';

  get data() {
    return this.#data;
  };

  get separator() {
    return this.#separator;
  };

  set data(data) {
    try
    {
      let currentData = JSON.parse(data);
      if (Array.isArray(currentData))
      {
        this.#data = currentData;
        if (this.ready === true)
        {
          this.render();
        };
      };
    }
    catch(e)
    {
      throw new Error('Unexpected value');
    };
  };

  set separator(separator) {
    this.#separator = separator;
    if (this.ready === true)
    {
      this.render();
    };
  };

  #initEvents() {
    let container = this.container;
    container.delegateEventListener('span', 'click', e => {
      this.dispatchEvent(new CustomEvent('spanclick', {detail: {target: e.target}}));
    });
  };

  render() {
    let data = this.data;
    let container = this.container;
    if (data.length != 0)
    {
      container.empty();
      data.forEach(item => {
        if (item.hasOwnProperty('text'))
        {
          if (!item.hasOwnProperty('href'))
          {
            let newEl = document.createElement('em');
            newEl.innerText = item.text;
            container.append(newEl);
          }
          else
          {
            let currentTag = this.#tag;
            if (item.hasOwnProperty('tag') && this.#allowTags.includes(item.tag))
            {
              currentTag = item.tag;
            };
            let newEl = document.createElement(currentTag);
            newEl.innerText = item.text;
            newEl.setAttribute('href', item.href);
            container.append(newEl);
          };
          let newSeparatorEl = document.createElement('separator');
          let newJtbcSvgEl = document.createElement('jtbc-svg');
          newJtbcSvgEl.setAttribute('name', this.#separator);
          newSeparatorEl.append(newJtbcSvgEl);
          container.append(newSeparatorEl);
        };
      });
      container.loadComponents();
      container.querySelector('separator:last-of-type')?.remove();
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'data':
      {
        this.data = newVal;
        break;
      };
      case 'separator':
      {
        this.separator = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.render();
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <container style="display:none"></container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('container');
    this.#initEvents();
  };
};