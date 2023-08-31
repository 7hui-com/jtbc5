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
    this.render();
  };

  set src(src) {
    this.#src = src;
    this.render();
  };

  render() {
    let name = this.#name;
    let src = this.src ?? this.baseURL + 'svg/' + name + '.svg';
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
  };

  constructor() {
    super();
    this.ready = false;
    this.tinyDB = new tinyDB('jtbc-svg');
    this.baseURL = import.meta.url.substring(0, import.meta.url.lastIndexOf('/') + 1);
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `<style>@import url('${importCssUrl}');</style><container style="display:none"></container>`;
    shadowRoot.innerHTML = shadowRootHTML;
    this.container = shadowRoot.querySelector('container');
  };
};