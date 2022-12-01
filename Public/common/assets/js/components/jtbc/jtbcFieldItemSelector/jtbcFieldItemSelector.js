export default class jtbcFieldItemSelector extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'max', 'multipliable'];
  };

  #value = null;
  #max = 1000000;
  #multipliable = false;

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = this.#value;
    if (this.ready == true)
    {
      result = null;
      if (this.multipliable == false)
      {
        result = this.querySelector('[role=item].on')?.getAttribute('value');
      }
      else
      {
        let values = [];
        this.querySelectorAll('[role=item].on').forEach(item => {
          values.push(item.getAttribute('value'));
        });
        if (values.length != 0)
        {
          result = JSON.stringify(values);
        };
      };
    };
    return result ?? '';
  };

  get multipliable() {
    return this.#multipliable;
  };

  set value(value) {
    this.#value = value;
    if (this.multipliable == false)
    {
      this.querySelectorAll('[role=item]').forEach(item => {
        item.classList.toggle('on', item.getAttribute('value') == value);
      });
    }
    else
    {
      let values = JSON.parse(value);
      if (Array.isArray(values))
      {
        this.querySelectorAll('[role=item]').forEach(item => {
          item.classList.toggle('on', values.includes(item.getAttribute('value')));
        });
      }
      else
      {
        throw new Error('Unexpected value');
      };
    };
  };

  set multipliable(multipliable) {
    this.#multipliable = multipliable;
  };

  #initEvents() {
    let that = this;
    this.delegateEventListener('[role=item]', 'click', function(){
      if (that.multipliable == false)
      {
        that.querySelectorAll('[role=item]').forEach(item => {
          item.classList.toggle('on', this == item);
        });
        that.dispatchEvent(new CustomEvent('changed', {bubbles: true}));
      }
      else
      {
        if (this.classList.contains('on'))
        {
          this.classList.remove('on');
          that.dispatchEvent(new CustomEvent('changed', {bubbles: true}));
        }
        else
        {
          if (that.querySelectorAll('[role=item].on').length < that.#max)
          {
            this.classList.add('on');
            that.dispatchEvent(new CustomEvent('changed', {bubbles: true}));
          }
          else
          {
            this.dispatchEvent(new CustomEvent('exceeded', {bubbles: true}));
          };
        };
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
      case 'max':
      {
        if (isFinite(newVal))
        {
          this.#max = Number.parseInt(newVal);
        };
        break;
      };
      case 'multipliable':
      {
        this.multipliable = this.hasAttribute('multipliable')? true: false;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    this.ready = false;
    this.#initEvents();
  };
};