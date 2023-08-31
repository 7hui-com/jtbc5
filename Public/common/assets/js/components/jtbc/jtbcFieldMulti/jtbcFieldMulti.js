import mixedFieldCreator from '../../../library/field/mixedFieldCreator.js';

export default class jtbcFieldMulti extends HTMLElement {
  static get observedAttributes() {
    return ['text', 'columns', 'value', 'disabled', 'width'];
  };

  #disabled = false;
  #value = null;

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = '';
    if (this.inited == false)
    {
      result = this.#value ?? '';
    }
    else
    {
      let value = [];
      this.content.querySelectorAll('li').forEach(el => {
        let item = {};
        el.querySelectorAll('[role=field]').forEach(f => {
          item[f.name] = f.value;
        });
        value.push(item);
      });
      if (value.length != 0)
      {
        result = JSON.stringify(value);
      };
    };
    return result;
  };

  get disabled() {
    return this.#disabled;
  };

  set value(value) {
    if (value != null)
    {
      let items = value? JSON.parse(value): [];
      if (this.inited == true && Array.isArray(items))
      {
        this.content.querySelectorAll('li').forEach(el => { el.remove(); });
        items.forEach(item => {
          let newLi = this.liElement.cloneNode(true);
          Object.keys(item).forEach(key => {
            let field = newLi.querySelector("[name='" + key + "']");
            if (field != null && field.getAttribute('role') == 'field')
            {
              field.setAttribute('value', item[key]);
            };
          });
          this.content.append(newLi);
          this.numReset();
        });
      };
    };
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    container.delegateEventListener('button.add', 'click', () => {
      if (this.inited === true)
      {
        let newLi = this.liElement.cloneNode(true);
        newLi.querySelector('input[name=id]').value = this.getTempId();
        this.content.append(newLi);
        this.numReset();
        newLi.scrollIntoView({'behavior': 'smooth'});
      };
    });
    container.delegateEventListener('.order.up', 'click', function(){
      let li = this.parentNode.parentNode.parentNode;
      let prevLi = li.previousElementSibling;
      if (prevLi != null)
      {
        li.parentNode.insertBefore(li, prevLi);
        that.numReset();
      };
    });
    container.delegateEventListener('.order.down', 'click', function(){
      let li = this.parentNode.parentNode.parentNode;
      let nextLi = li.nextElementSibling;
      if (nextLi != null)
      {
        li.parentNode.insertBefore(nextLi, li);
        that.numReset();
      };
    });
    container.delegateEventListener('.textRemove', 'click', function(){
      if (that.dialog != null)
      {
        that.dialog.confirm(that.text.removeTips, () => {
          this.dispatchEvent(new CustomEvent('remove', {bubbles: true}));
        });
      }
      else
      {
        if (window.confirm(that.text.removeTips))
        {
          this.dispatchEvent(new CustomEvent('remove', {bubbles: true}));
        };
      };
    });
    container.delegateEventListener('.textRemove', 'remove', function(){
      that.content.querySelectorAll('li').forEach(el => {
        if (el.contains(this))
        {
          el.remove();
          that.numReset();
        };
      });
    });
  };

  getTempId() {
    this.currentTempId -= 1;
    return this.currentTempId;
  };

  createLiElement(columns) {
    let divFirst = document.createElement('div');
    let mixedField = new mixedFieldCreator(columns);
    divFirst.classList.add('bar');
    divFirst.insertAdjacentHTML('beforeend', '<span class="num">#<em></em><input type="hidden" name="id" role="field" /></span>');
    divFirst.insertAdjacentHTML('beforeend', '<icons><jtbc-svg name="direction_up" class="order up"></jtbc-svg><jtbc-svg name="direction_down" class="order down"></jtbc-svg><jtbc-svg name="close" class="textRemove"></jtbc-svg></icons>');
    divFirst.querySelector('.textRemove').setAttribute('title', this.text.remove);
    this.liElement = document.createElement('li');
    this.liElement.append(divFirst);
    this.liElement.append(mixedField.getFragment());
  };

  numReset() {
    let num = 0;
    this.content.querySelectorAll('li').forEach(el => {
      num += 1;
      el.querySelector('span.num em').innerText = num;
    });
  };

  textReset() {
    let text = this.text;
    let container = this.container;
    if (this.inited == true)
    {
      container.querySelectorAll('.textAdd').forEach(el => { el.innerText = text.add; });
      container.querySelectorAll('.textRemove').forEach(el => { el.setAttribute('title', text.remove); });
    };
  };

  init() {
    if (this.inited == false)
    {
      let currentColumns = this.currentColumns;
      if (currentColumns != null)
      {
        let columns = JSON.parse(currentColumns);
        this.createLiElement(columns);
        this.liElement.loadComponents().then(() => {
          this.inited = true;
          this.value = this.#value;
          this.textReset();
        });
      };
      this.container.classList.add('on');
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'text':
      {
        this.text = JSON.parse(newVal);
        this.textReset();
        break;
      };
      case 'columns':
      {
        this.currentColumns = newVal;
        this.init();
        break;
      };
      case 'value':
      {
        this.value = this.#value = newVal;
        break;
      };
      case 'disabled':
      {
        this.disabled = this.hasAttribute('disabled')? true: false;
        break;
      };
      case 'width':
      {
        this.style.width = isFinite(newVal)? newVal + 'px': newVal;
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
    this.text = {
      'add': 'Add Content',
      'remove': 'Remove',
      'removeTips': 'Are you sure to remove?',
    };
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <container style="display:none">
        <div class="main mixedFieldContainer">
          <div class="button"><button class="textAdd add">${this.text.add}</button></div>
          <div class="list">
            <ul class="content"></ul>
          </div>
        </div>
        <div class="mask"></div>
      </container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.inited = false;
    this.currentColumns = null;
    this.currentTempId = 0;
    this.liElement = null;
    this.container = shadowRoot.querySelector('container');
    this.content = this.container.querySelector('ul.content');
    this.dialog = document.getElementById('dialog');
    this.#initEvents();
  };
};