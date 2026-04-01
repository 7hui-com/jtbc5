import tinyDB from '../../../library/db/tinyDB.js';

export default class jtbcSvg extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'src'];
  };

  #name = '';
  #src = null;

  get name() {
    return this.#name;
  };

  get src() {
    return this.#src;
  };

  set name(name) {
    this.#name = name;
    if (this.ready)
    {
      this.render();
    };
  };

  set src(src) {
    this.#src = src;
    if (this.ready)
    {
      this.render();
    };
  };

  render() {
    let name = this.#name;
    let src = this.src ?? this.baseURL + 'svg/' + name + '.svg';
    if (name.length != 0)
    {
      this.tinyDB.getItem(name).then(value => {
        if (value != null)
        {
          this.container.innerHTML = value;
        }
        else
        {
          fetch(src).then(res => res.ok? res.text(): null).then(data => {
            if (data != null)
            {
              this.container.innerHTML = data;
              this.tinyDB.setItem(name, data);
            };
          });
        };
      }).catch(e => {
        fetch(src).then(res => res.ok? res.text(): null).then(data => {
          if (data != null)
          {
            this.container.innerHTML = data;
          };
        });
      });
    }
    else
    {
      if (this.src != null)
      {
        fetch(this.src).then(res => res.ok? res.text(): null).then(data => {
          if (data != null)
          {
            this.container.innerHTML = data;
          };
        });
      };
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'name':
      {
        this.name = newVal;
        break;
      };
      case 'src':
      {
        this.src = newVal;
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
    this.ready = false;
    this.tinyDB = new tinyDB('jtbc-svg');
    this.baseURL = import.meta.url.substring(0, import.meta.url.lastIndexOf('/') + 1);
    let shadowRoot = this.attachShadow({mode: 'open'});
    let shadowRootHTML = `<style>:host{width:20px;height:20px;display:inline-block;--fore-color:#000000;--second-color:#666666;--third-color:#cccccc}container{width:100%;height:100%;display:block}container svg{display:block}container svg g.fore{fill:var(--fore-color)}container svg g.second{fill:var(--second-color)}container svg g.third{fill:var(--third-color)}</style><container></container>`;
    shadowRoot.innerHTML = shadowRootHTML;
    this.container = shadowRoot.querySelector('container');
  };
};