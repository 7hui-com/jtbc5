export default class jtbcAnchor extends HTMLAnchorElement {
  static get observedAttributes() {
    return ['href'];
  };

  gotoLink(e) {
    e.preventDefault();
    let target = this.getTarget();
    if (this.currentHref != null)
    {
      if (this.currentHref.length != 0)
      {
        target.href = this.currentHref;
      };
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'href':
      {
        this.currentHref = newVal;
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
    this.currentHref = null;
    this.addEventListener('click', (e) => { this.gotoLink(e); });
  };
};