export default class jtbcFieldCascader extends HTMLElement {
  static get observedAttributes() {
    return ['data', 'value', 'disabled', 'width', 'placeholder', 'expand_mode'];
  };

  #data = [];
  #value = '';
  #disabled = false;
  #expandMode = 'click';
  #closeSelectorTimeout = null;

  get data() {
    return this.#data;
  };

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    return this.#value;
  };

  get disabled() {
    return this.#disabled;
  };

  set data(data) {
    let dataValue = [];
    try
    {
      dataValue = JSON.parse(data);
    }
    catch (e) {};
    this.#data = dataValue;
    this.dataReset();
  };

  set value(value) {
    this.#value = value;
    this.syncInputValue();
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
    this.#disabled = disabled;
  };

  closeSelector(timeout = 0) {
    let container = this.container;
    let selectorEl = container.querySelector('div.selector');
    this.#closeSelectorTimeout = setTimeout(() => {
      selectorEl.classList.remove('on');
    }, timeout);
  };

  dataReset() {
    let that = this;
    let container = this.container;
    let selectorEl = container.querySelector('div.selector');
    const bindDataItem = (data, parentEl) => {
      if (data.length != 0)
      {
        let ul = document.createElement('ul');
        data.forEach(item => {
          let li = document.createElement('li');
          li.dataset.text = item.text;
          li.dataset.value = item.value;
          if (item.disabled === true)
          {
            li.classList.add('disabled');
          };
          let textEl = document.createElement('span');
          textEl.innerText = item.text;
          li.appendChild(textEl);
          if (Array.isArray(item.children) && item.children.length != 0)
          {
            li.classList.add('father');
            bindDataItem(item.children, li);
          };
          ul.appendChild(li);
        });
        parentEl.appendChild(ul);
      };
    };
    bindDataItem(that.data, selectorEl);
    that.syncInputValue();
  };

  syncInputValue() {
    let that = this;
    let container = this.container;
    let selectorEl = container.querySelector('div.selector');
    let inputTextEl = container.querySelector('input.text');
    if (this.data.length != 0 && this.value != '')
    {
      const getSelectedEl = () => {
        let selectedEl = null;
        selectorEl.querySelectorAll('li').forEach(li => {
          li.classList.remove('selected');
          if (li.dataset.value == that.#value)
          {
            selectedEl = li;
          };
        });
        return selectedEl;
      };
      let textValue = [];
      let currentSelectedEl = getSelectedEl();
      if (currentSelectedEl != null)
      {
        currentSelectedEl.classList.add('selected');
        currentSelectedEl.parentElement.classList.add('on');
        textValue.unshift(currentSelectedEl.dataset.text);
        let parentTextElement = currentSelectedEl.parentElement.parentElement;
        while (parentTextElement.hasAttribute('data-text'))
        {
          parentTextElement.classList.add('selected');
          parentTextElement.parentElement.classList.add('on');
          textValue.unshift(parentTextElement.dataset.text);
          parentTextElement = parentTextElement.parentElement.parentElement;
        };
      };
      inputTextEl.value = textValue.join(' / ');
    }
    else
    {
      inputTextEl.value = '';
    };
  };

  initEvents() {
    let that = this;
    let container = this.container;
    let selectorEl = container.querySelector('div.selector');
    selectorEl.addEventListener('mouseenter', function(){
      clearTimeout(that.#closeSelectorTimeout);
    });
    selectorEl.addEventListener('mouseleave', function(){
      if (this.classList.contains('on'))
      {
        that.closeSelector(1000);
      };
    });
    selectorEl.addEventListener('transitionend', function(){
      if (!this.classList.contains('on'))
      {
        container.classList.remove('pickable');
      };
    });
    selectorEl.delegateEventListener('li', this.#expandMode, function(){
      if (!this.classList.contains('disabled'))
      {
        this.parentElement.querySelectorAll('li').forEach(li => {
          li.querySelectorAll('ul').forEach(ul => ul.classList.remove('on'));
        });
        this.querySelector('ul')?.classList.add('on');
      };
    });
    selectorEl.delegateEventListener('li span', 'click', function(){
      let parentEl = this.parentElement;
      let currentValue = parentEl.dataset.value;
      if (!parentEl.classList.contains('disabled') && !parentEl.classList.contains('father'))
      {
        that.#value = currentValue;
        that.syncInputValue();
        that.closeSelector(0);
      };
    });
    container.addEventListener('mouseenter', function(){
      let closeEl = this.querySelector('span.close');
      if (that.value == '')
      {
        closeEl.classList.remove('on');
      }
      else
      {
        closeEl.classList.add('on');
      };
    });
    container.addEventListener('mouseleave', function(){
      this.querySelector('span.close')?.classList.remove('on');
    });
    container.querySelector('span.box').addEventListener('click', function(){
      if (!container.classList.contains('pickable'))
      {
        container.classList.add('pickable');
        clearTimeout(that.#closeSelectorTimeout);
        if (that.offsetTop + selectorEl.offsetHeight > that.offsetParent.offsetHeight)
        {
          if (that.offsetTop > selectorEl.offsetHeight)
          {
            selectorEl.classList.add('upper');
          };
        };
        selectorEl.classList.add('on');
      }
      else
      {
        selectorEl.classList.remove('on');
      };
    });
    container.querySelector('span.close').addEventListener('click', function(){
      that.value = '';
      this.classList.remove('on');
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    let container = this.container;
    switch(attr) {
      case 'data':
      {
        this.data = newVal;
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
      case 'placeholder':
      {
        container.querySelector('input.text').setAttribute('placeholder', newVal);
      };
      case 'expand_mode':
      {
        if (['click', 'mouseover'].includes(newVal))
        {
          this.#expandMode = newVal;
        };
      };
    };
  };

  connectedCallback() {
    this.initEvents();
    this.ready = true;
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('.')) + '.css';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><input type="text" name="text" class="text" readonly="readonly" /><span class="box"></span><span class="close"></span><div class="selector"></div><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
  };
};