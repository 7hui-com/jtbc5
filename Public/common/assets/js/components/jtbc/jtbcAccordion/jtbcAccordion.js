export default class jtbcAccordion extends HTMLElement {
  static get observedAttributes() {
    return ['multipliable'];
  };

  #multipliable = false;

  get multipliable() {
    return this.#multipliable;
  };

  set multipliable(multipliable) {
    this.#multipliable = multipliable;
  };

  #initEvents() {
    let that = this;
    this.delegateEventListener('[accordion=title]', 'click', function(){
      that.getAllItems().forEach(item => {
        if (item.contains(this))
        {
          if (item.dataset.accordion == 'opened')
          {
            delete item.dataset.accordion;
          }
          else
          {
            item.dataset.accordion = 'opened';
          };
        }
        else
        {
          if (that.multipliable === false)
          {
            delete item.dataset.accordion;
          };
        };
      });
    });
  };

  getAllItems() {
    return this.querySelectorAll('[accordion=item]');
  };

  closeAll() {
    this.getAllItems().forEach(item => delete item.dataset.accordion);
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'multipliable':
      {
        this.multipliable = this.hasAttribute('multipliable')? true: false;
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
  };
};