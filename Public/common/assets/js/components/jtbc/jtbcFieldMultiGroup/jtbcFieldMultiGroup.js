import mixedFieldCreator from '../../../library/field/mixedFieldCreator.js';

export default class jtbcFieldMultiGroup extends HTMLElement {
  static get observedAttributes() {
    return ['text', 'group', 'value', 'disabled', 'width'];
  };

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = '';
    if (this.inited == false)
    {
      result = this.currentValue ?? '';
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
    return this.currentDisabled;
  };

  set value(value) {
    if (value != null)
    {
      let items = value? JSON.parse(value): [];
      if (this.inited == true && Array.isArray(items))
      {
        this.content.querySelectorAll('li').forEach(el => { el.remove(); });
        items.forEach(item => {
          if (item.hasOwnProperty('group_name'))
          {
            let groupName = item.group_name;
            if (this.liElement.hasOwnProperty(groupName))
            {
              let newLi = this.liElement[groupName].cloneNode(true);
              Object.keys(item).forEach(key => {
                let field = newLi.querySelector("[name='" + key + "']");
                if (field != null && field.getAttribute('role') == 'field')
                {
                  field.setAttribute('value', item[key]);
                };
              });
              this.content.append(newLi);
              this.numReset();
            };
          };
        });
      };
    };
  };

  set disabled(disabled) {
    if (disabled == true)
    {
      this.container.classList.add('disabled');
    }
    else
    {
      this.container.classList.remove('disabled');
    };
    this.currentDisabled = disabled;
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    container.delegateEventListener('button.add', 'click', function(){
      if (that.inited === true)
      {
        let newLi = that.liElement[this.getAttribute('name')].cloneNode(true);
        newLi.querySelector('input[name=id]').value = that.getTempId();
        that.content.append(newLi);
        that.numReset();
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

  createLiElement(item) {
    let divFirst = document.createElement('div');
    let mixedField = new mixedFieldCreator(item.columns);
    divFirst.classList.add('bar');
    divFirst.insertAdjacentHTML('beforeend', '<span class="num">#<em></em><u></u><input type="hidden" name="id" role="field" /><input type="hidden" name="group_name" role="field" /></span>');
    divFirst.insertAdjacentHTML('beforeend', '<icons><jtbc-svg name="direction_up" class="order up"></jtbc-svg><jtbc-svg name="direction_down" class="order down"></jtbc-svg><jtbc-svg name="close" class="textRemove"></jtbc-svg></icons>');
    divFirst.querySelector('span.num u').innerText = item.text;
    divFirst.querySelector('input[name=group_name]').value = item.name;
    divFirst.querySelector('.textRemove').setAttribute('title', this.text.remove);
    let liElement = document.createElement('li');
    liElement.append(divFirst);
    liElement.append(mixedField.getFragment());
    this.liElement[item.name] = liElement;
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
      container.querySelectorAll('.textAdd').forEach(el => { el.innerText = text.add + el.getAttribute('text'); });
      container.querySelectorAll('.textRemove').forEach(el => { el.setAttribute('title', text.remove); });
    };
  };

  init() {
    if (this.inited == false)
    {
      let currentGroup = this.currentGroup;
      if (currentGroup != null)
      {
        let group = JSON.parse(currentGroup);
        if (Array.isArray(group))
        {
          let liLoaded = 0;
          let groupLength = group.length;
          let btnEl = this.container.querySelector('div.button');
          group.forEach(item => {
            let button = document.createElement('button');
            button.classList.add('textAdd');
            button.classList.add('add');
            button.classList.add('button-add-' + item.name);
            button.setAttribute('name', item.name);
            button.setAttribute('text', item.text);
            button.innerText = this.text.add + item.text;
            btnEl.append(button);
            this.createLiElement(item);
          });
          Object.keys(this.liElement).forEach(key => {
            let li = this.liElement[key];
            li.loadComponents().then(() => {
              liLoaded += 1;
              if (liLoaded == groupLength)
              {
                this.inited = true;
                this.value = this.currentValue;
                this.textReset();
              };
            });
          });
        };
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
      case 'group':
      {
        this.currentGroup = newVal;
        this.init();
        break;
      };
      case 'value':
      {
        this.value = this.currentValue = newVal;
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
      'add': 'Add',
      'remove': 'Remove',
      'removeTips': 'Are you sure to remove?',
    };
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <container style="display:none">
        <div class="main mixedFieldContainer">
          <div class="button"></div>
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
    this.currentGroup = null;
    this.currentDisabled = false;
    this.currentTempId = 0;
    this.currentValue = null;
    this.liElement = {};
    this.container = shadowRoot.querySelector('container');
    this.content = this.container.querySelector('ul.content');
    this.dialog = document.getElementById('dialog');
    this.#initEvents();
  };
};