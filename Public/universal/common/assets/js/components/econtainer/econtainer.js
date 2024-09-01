export default class econtainer extends HTMLElement {
  static get observedAttributes() {
    return ['bgcolor'];
  };

  #initEvents() {
    let container = this.container;
    container.delegateEventListener('slot', 'slotchange', function(){
      this.assignedElements().forEach(el => el.classList.add('slotted'));
    });
    container.querySelectorAll('div.container slot[name=sidebar]').forEach(slot => {
      slot.addEventListener('slotchange', function(){
        let assignedElements = this.assignedElements();
        let elementCount = assignedElements.length;
        if (elementCount === 0)
        {
          this.parentElement.classList.add('hide');
        }
        else
        {
          this.parentElement.classList.remove('hide');
        };
      });
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'bgcolor':
      {
        this.style.setProperty('--container-background', newVal);
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <container style="display:none">
        <div part="cushion" class="cushion"><slot name="cushion"></slot></div>
        <div part="container" class="container"><div part="container-box" class="box"><div part="sidebar" class="sidebar hide"><slot name="sidebar"></slot></div><div part="main" class="main"><slot name="main"></slot></div></div></div>
      </container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('container');
    this.#initEvents();
  };
};