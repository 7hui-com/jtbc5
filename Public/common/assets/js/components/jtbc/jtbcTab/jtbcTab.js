export default class jtbcTab extends HTMLDivElement {
  static get observedAttributes() {
    return ['value'];
  };

  set value(value) {
    this.selectTabByIndex(Number.parseInt(value));
  };

  get value() {
    return this.currentValue;
  };

  selectTab(node) {
    let index = -1;
    if (!node.classList.contains('disabled'))
    {
      this.querySelectorAll('tabtitle').forEach(el => {
        index += 1;
        if (el == node)
        {
          this.selectTabByIndex(index);
        };
      });
    };
  };

  selectTabByIndex(index) {
    let indexTitle = -1;
    let indexContent = -1;
    this.querySelectorAll('tabtitle').forEach(el => {
      indexTitle += 1;
      el.classList.remove('on');
      if (indexTitle == index)
      {
        el.classList.add('on');
        this.currentValue = index;
        let customEvent = new CustomEvent('tabchange', {
          bubbles: true,
          detail: {value: index},
        });
        this.dispatchEvent(customEvent);
      };
    });
    this.querySelectorAll('tabcontent').forEach(el => {
      indexContent += 1;
      el.classList.remove('on');
      if (indexContent == index)
      {
        el.classList.add('on');
      };
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'value':
      {
        this.value = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
  };

  constructor() {
    super();
    let that = this;
    this.ready = false;
    this.currentValue = 0;
    this.delegateEventListener('tabtitle', 'click', function(){ that.selectTab(this); });
  };
};