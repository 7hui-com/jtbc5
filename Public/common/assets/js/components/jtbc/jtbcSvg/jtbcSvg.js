import tinyDB from '../../../library/db/tinyDB.js';

export default class jtbcSvg extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'src'];
  };

  set name(value) {
    this.currentName = value;
    this.render();
  };

  get name() {
    return this.currentName;
  };

  set src(value) {
    this.currentSrc = value;
    this.render();
  };

  get src() {
    return this.currentSrc;
  };

  render() {
    let currentName = this.currentName;
    let currentSrc = this.currentSrc || this.baseURL + 'svg/' + currentName + '.svg';
    this.tinyDB.getItem(currentName).then(value => {
      if (value != null)
      {
        this.container.innerHTML = value;
      }
      else
      {
        fetch(currentSrc).then(res => res.ok? res.text(): null).then(data => {
          if (data != null)
          {
            this.container.innerHTML = data;
            this.tinyDB.setItem(currentName, data);
          };
        });
      };
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
    this.currentSrc = '';
    this.currentName = '';
    this.tinyDB = new tinyDB('jtbc-svg');
    this.baseURL = import.meta.url.substring(0, import.meta.url.lastIndexOf('/') + 1);
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('.')) + '.css';
    let shadowRootHTML = `<style>@import url('${importCssUrl}');</style><container style="display:none"></container>`;
    shadowRoot.innerHTML = shadowRootHTML;
    this.container = shadowRoot.querySelector('container');
  };
};