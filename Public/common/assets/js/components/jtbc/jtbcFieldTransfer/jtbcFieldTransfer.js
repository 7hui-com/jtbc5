export default class jtbcFieldTransfer extends HTMLElement {
  static get observedAttributes() {
    return ['text', 'data', 'max', 'value', 'disabled', 'width', 'height', 'nonfilterable'];
  };

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let value = '';
    if (this.selected.length != 0)
    {
      value = JSON.stringify(this.selected);
    };
    return value;
  };

  get disabled() {
    return this.currentDisabled;
  };

  get nonfilterable() {
    return this.currentNonfilterable;
  };

  set value(value) {
    this.selected = [];
    this.currentValue = value? JSON.parse(value): [];
    if (Array.isArray(this.currentValue))
    {
      this.selected = this.currentValue;
      this.container.dispatchEvent(new CustomEvent('update'));
    };
    this.reselect();
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

  set nonfilterable(nonfilterable) {
    if (nonfilterable == true)
    {
      this.container.querySelectorAll('div.filter').forEach(el => {
        el.classList.remove('on');
      });
    }
    else
    {
      this.container.querySelectorAll('div.filter').forEach(el => {
        el.classList.add('on');
      });
    };
    this.currentNonfilterable = nonfilterable;
  };

  getMax() {
    let currentMax = 1000000;
    if (this.currentMax != null)
    {
      currentMax = Number.parseInt(this.currentMax);
      if (currentMax < 1) currentMax = 1;
    };
    return currentMax;
  };

  popupTips1() {
    const getTips = new Function('$count', 'return `' + this.text.errorTips1 + '`;');
    let tips = getTips(this.getMax());
    if (this.miniMessage != null)
    {
      this.miniMessage.push(tips);
    }
    else if (this.dialog != null)
    {
      this.dialog.alert(tips);
    }
    else
    {
      window.alert(tips);
    };
  };

  initEvents() {
    let that = this;
    let container = this.container;
    let leftbox = container.querySelector('leftbox');
    let rightbox = container.querySelector('rightbox');
    let toolbar = container.querySelector('toolbar');
    let rightboxUl = rightbox.querySelector('div.list ul');
    container.addEventListener('update', function(){
      if (that.selected.length == 0)
      {
        leftbox.querySelectorAll('div.list li').forEach(item => {
          if (item.classList.contains('selected'))
          {
            item.classList.remove('on');
            item.classList.remove('selected');
          };
        });
        rightbox.querySelectorAll('div.list li').forEach(item => {
          item.remove();
        });
      }
      else
      {
        that.selected.forEach(value => {
          let matched = false;
          rightbox.querySelectorAll('div.list li').forEach(item => {
            let itemValue = item.getAttribute('value');
            if (itemValue == value)
            {
              matched = true;
            }
            else if (!that.selected.includes(itemValue))
            {
              item.remove();
              leftbox.querySelectorAll('div.list li.selected').forEach(item => {
                if (item.getAttribute('value') == itemValue)
                {
                  item.classList.remove('on');
                  item.classList.remove('selected');
                };
              });
            };
          });
          if (matched == false)
          {
            leftbox.querySelectorAll('div.list li').forEach(item => {
              if (item.getAttribute('value') == value)
              {
                let newLi = item.cloneNode(true);
                newLi.classList.remove('on');
                rightboxUl.appendChild(newLi);
                item.classList.add('selected');
              };
            });
          };
        });
      };
      leftbox.dispatchEvent(new CustomEvent('update'));
      rightbox.dispatchEvent(new CustomEvent('update'));
    });
    leftbox.addEventListener('update', function(){
      let allItemEls = this.querySelectorAll('div.list li:not(li.selected)');
      let checkedItemEls = this.querySelectorAll('div.list li.on:not(li.selected)');
      this.querySelector('count').innerText = checkedItemEls.length + '/' + allItemEls.length;
      if (checkedItemEls.length != 0)
      {
        toolbar.querySelector('span.toright').classList.add('on');
      }
      else
      {
        this.querySelector('h3').classList.remove('on');
        toolbar.querySelector('span.toright').classList.remove('on');
      };
    });
    leftbox.delegateEventListener('h3', 'click', function(){
      if (this.classList.contains('on'))
      {
        this.classList.remove('on');
        leftbox.querySelectorAll('div.list li').forEach(item => {
          if (!item.classList.contains('readonly'))
          {
            item.classList.remove('on');
          };
        });
      }
      else
      {
        this.classList.add('on');
        leftbox.querySelectorAll('div.list li').forEach(item => {
          if (!item.classList.contains('readonly'))
          {
            item.classList.add('on');
          };
        });
      };
      leftbox.dispatchEvent(new CustomEvent('update'));
    });
    leftbox.delegateEventListener('div.filter input.keyword', 'input', function(){
      let keyword = this.value;
      leftbox.querySelectorAll('div.list li').forEach(item => {
        if (item.getAttribute('text').includes(keyword))
        {
          item.classList.remove('filtered');
        }
        else
        {
          item.classList.add('filtered');
        };
      });
    });
    leftbox.delegateEventListener('div.list li', 'click', function(){
      if (!this.classList.contains('readonly'))
      {
        this.classList.toggle('on');
        leftbox.dispatchEvent(new CustomEvent('update'));
      };
    });
    rightbox.addEventListener('update', function(){
      let allItemEls = this.querySelectorAll('div.list li');
      let checkedItemEls = this.querySelectorAll('div.list li.on');
      this.querySelector('count').innerText = checkedItemEls.length + '/' + allItemEls.length;
      if (checkedItemEls.length != 0)
      {
        toolbar.querySelector('span.toleft').classList.add('on');
      }
      else
      {
        this.querySelector('h3').classList.remove('on');
        toolbar.querySelector('span.toleft').classList.remove('on');
      };
    });
    rightbox.delegateEventListener('h3', 'click', function(){
      if (this.classList.contains('on'))
      {
        this.classList.remove('on');
        rightbox.querySelectorAll('div.list li').forEach(item => {
          if (!item.classList.contains('readonly'))
          {
            item.classList.remove('on');
          };
        });
      }
      else
      {
        this.classList.add('on');
        rightbox.querySelectorAll('div.list li').forEach(item => {
          if (!item.classList.contains('readonly'))
          {
            item.classList.add('on');
          };
        });
      };
      rightbox.dispatchEvent(new CustomEvent('update'));
    });
    rightbox.delegateEventListener('div.filter input.keyword', 'input', function(){
      let keyword = this.value;
      rightbox.querySelectorAll('div.list li').forEach(item => {
        if (item.getAttribute('text').includes(keyword))
        {
          item.classList.remove('filtered');
        }
        else
        {
          item.classList.add('filtered');
        };
      });
    });
    rightbox.delegateEventListener('div.list li', 'click', function(){
      if (!this.classList.contains('readonly'))
      {
        this.classList.toggle('on');
        rightbox.dispatchEvent(new CustomEvent('update'));
      };
    });
    toolbar.delegateEventListener('span.toright', 'click', function(){
      if (that.disabled != true && this.classList.contains('on'))
      {
        let hasReachedMax = false;
        leftbox.querySelectorAll('div.list li.on').forEach(item => {
          let itemValue = item.getAttribute('value');
          if (that.selected.length < that.getMax())
          {
            if (!that.selected.includes(itemValue))
            {
              that.selected.push(itemValue);
            };
          }
          else
          {
            hasReachedMax = true;
            item.classList.remove('on');
          };
        });
        if (hasReachedMax == true) that.popupTips1();
        container.dispatchEvent(new CustomEvent('update'));
      };
    });
    toolbar.delegateEventListener('span.toleft', 'click', function(){
      if (that.disabled != true && this.classList.contains('on'))
      {
        rightbox.querySelectorAll('div.list li.on').forEach(item => {
          let itemValue = item.getAttribute('value');
          that.selected = that.selected.filter((value) => value !== itemValue);
        });
        container.dispatchEvent(new CustomEvent('update'));
      };
    });
  };

  render() {
    let container = this.container;
    let currentData = this.currentData;
    let leftbox = container.querySelector('leftbox');
    let leftboxUl = leftbox.querySelector('div.list ul');
    if (currentData != null)
    {
      let data = JSON.parse(currentData);
      if (Array.isArray(data))
      {
        data.forEach(item => {
          let newItem = document.createElement('li');
          let newItemEm = document.createElement('em');
          let newItemText = document.createElement('span');
          newItem.setAttribute('text', item.text);
          newItem.setAttribute('value', item.value);
          newItemText.innerText = item.text;
          newItem.append(newItemEm, newItemText);
          if (item.hasOwnProperty('readonly') && item.readonly == true)
          {
            newItem.classList.add('readonly');
          };
          leftboxUl.appendChild(newItem);
        });
      };
    };
    container.dispatchEvent(new CustomEvent('update'));
    this.reselect();
  };

  reselect() {
    let container = this.container;
    let currentMax = this.getMax();
    if (this.selected.length > currentMax)
    {
      this.selected.length = currentMax;
      container.dispatchEvent(new CustomEvent('update'));
    };
  };

  textReset() {
    let text = this.text;
    let container = this.container;
    if (text.hasOwnProperty('unselected'))
    {
      container.querySelector('.textUnselected').innerText = text.unselected;
    };
    if (text.hasOwnProperty('selected'))
    {
      container.querySelector('.textSelected').innerText = text.selected;
    };
    if (text.hasOwnProperty('filterPlaceholder'))
    {
      container.querySelectorAll('.textFilterPlaceholder').forEach(el => {
        el.setAttribute('placeholder', text.filterPlaceholder);
      });
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
      case 'data':
      {
        this.currentData = newVal;
        break;
      };
      case 'max':
      {
        this.currentMax = isFinite(newVal)? newVal: null;
        break;
      };
      case 'value':
      {
        this.value = newVal;
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
      case 'height':
      {
        this.style.height = isFinite(newVal)? newVal + 'px': newVal;
        break;
      };
      case 'nonfilterable':
      {
        this.nonfilterable = this.hasAttribute('nonfilterable')? true: false;
        break;
      };
    };
    if (this.ready == true)
    {
      if (attr == 'data')
      {
        this.render();
      }
      else if (attr == 'max')
      {
        this.reselect();
      };
    };
  };

  connectedCallback() {
    this.render();
    this.ready = true;
  };

  constructor() {
    super();
    this.ready = false;
    this.text = {
      'unselected': 'Unselected',
      'selected': 'Selected',
      'filterPlaceholder': 'Enter keywords',
      'errorTips1': 'You can only select ${$count} items at most',
    };
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('.')) + '.css';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none">
        <leftbox>
          <h3><em></em><span class="textUnselected">${this.text.unselected}</span><count>0/0</count></h3>
          <div class="filter on"><input type="text" name="keyword" class="keyword textFilterPlaceholder" placeholder="${this.text.filterPlaceholder}" autocomplete="off" /></div>
          <div class="list">
            <ul></ul>
          </div>
        </leftbox>
        <toolbar><span class="toright"><jtbc-svg name="arrow_right"></jtbc-svg></span><span class="toleft"><jtbc-svg name="arrow_left"></jtbc-svg></span></toolbar>
        <rightbox>
          <h3><em></em><span class="textSelected">${this.text.selected}</span><count>0/0</count></h3>
          <div class="filter on"><input type="text" name="keyword" class="keyword textFilterPlaceholder" placeholder="${this.text.filterPlaceholder}" autocomplete="off" /></div>
          <div class="list">
            <ul></ul>
          </div>
        </rightbox>
        <div class="mask leftMask"></div>
        <div class="mask rightMask"></div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.selected = [];
    this.container = shadowRoot.querySelector('div.container');
    this.container.querySelector('toolbar').loadComponents();
    this.currentData = null;
    this.currentMax = null;
    this.currentValue = '';
    this.currentDisabled = false;
    this.currentNonfilterable = false;
    this.dialog = document.getElementById('dialog');
    this.miniMessage = document.getElementById('miniMessage');
    this.initEvents();
  };
};