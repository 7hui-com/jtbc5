export default class jtbcFieldCascader extends HTMLElement {
  static get observedAttributes() {
    return ['data', 'value', 'disabled', 'width', 'placeholder', 'expand_mode', 'separator', 'selector-min-height', 'selector-max-height'];
  };

  #data = [];
  #value = '';
  #disabled = false;
  #expandMode = 'click';
  #separator = ' / ';
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

  get separator() {
    return this.#separator;
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

  set separator(separator) {
    this.#separator = separator;
    this.syncInputValue();
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #setZIndex() {
    this.style.setProperty('--z-index', window.getActiveZIndex());
  };

  #unsetZIndex() {
    this.style.removeProperty('--z-index');
  };

  #initEvents() {
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
        that.#unsetZIndex();
        container.classList.remove('pickable');
      };
    });
    selectorEl.delegateEventListener('li', this.#expandMode, function(e){
      let targetTagName = e.target.tagName.toLowerCase();
      let currentLi = targetTagName == 'li'? e.target: e.target.parentElement;
      if (!currentLi.classList.contains('disabled'))
      {
        currentLi.parentElement.querySelectorAll('li').forEach(li => {
          li.querySelectorAll('div.ul').forEach(ul => ul.classList.remove('on'));
        });
        currentLi.querySelector('div.ul')?.classList.add('on');
      };
    });
    selectorEl.delegateEventListener('li span', 'click', function(){
      let parentEl = this.parentElement;
      let currentValue = parentEl.dataset.value;
      if (!parentEl.classList.contains('disabled') && !parentEl.classList.contains('father'))
      {
        that.#value = currentValue;
        that.syncInputValue();
        that.dispatchEvent(new CustomEvent('selected', {bubbles: true}));
        that.closeSelector(0);
      };
    });
    container.addEventListener('mouseenter', function(){
      let emptyEl = this.querySelector('span.empty');
      if (that.value == '')
      {
        emptyEl.classList.remove('on');
      }
      else
      {
        emptyEl.classList.add('on');
      };
    });
    container.addEventListener('mouseleave', function(){
      this.querySelector('span.empty')?.classList.remove('on');
    });
    container.querySelector('span.box').addEventListener('click', function(){
      if (!container.classList.contains('pickable'))
      {
        that.#setZIndex();
        container.classList.add('pickable');
        clearTimeout(that.#closeSelectorTimeout);
        if (that.getBoundingClientRect().bottom + selectorEl.offsetHeight + 20 > document.documentElement.clientHeight)
        {
          if (that.getBoundingClientRect().top > selectorEl.offsetHeight)
          {
            selectorEl.classList.add('upper');
          };
        }
        else
        {
          selectorEl.classList.remove('upper');
        };
        selectorEl.classList.add('on');
      }
      else
      {
        selectorEl.classList.remove('on');
      };
    });
    container.querySelector('span.empty').addEventListener('click', function(){
      that.value = '';
      this.classList.remove('on');
    });
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
        let div = document.createElement('div');
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
          let iconEl = document.createElement('jtbc-svg');
          textEl.innerText = item.text;
          iconEl.setAttribute('name', 'arrow_right');
          li.append(textEl, iconEl);
          if (Array.isArray(item.children) && item.children.length != 0)
          {
            li.classList.add('father');
            bindDataItem(item.children, li);
          };
          ul.append(li);
          div.classList.add('ul');
          div.append(ul);
          parentEl.appendChild(div);
        });
      };
    };
    bindDataItem(that.data, selectorEl);
    selectorEl.loadComponents();
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
        currentSelectedEl.parentElement.parentElement.classList.add('on');
        textValue.unshift(currentSelectedEl.dataset.text);
        let parentTextElement = currentSelectedEl.parentElement.parentElement.parentElement;
        while (parentTextElement.hasAttribute('data-text'))
        {
          parentTextElement.classList.add('selected');
          parentTextElement.parentElement.parentElement.classList.add('on');
          textValue.unshift(parentTextElement.dataset.text);
          parentTextElement = parentTextElement.parentElement.parentElement.parentElement;
        };
      };
      inputTextEl.value = textValue.join(that.separator);
    }
    else
    {
      inputTextEl.value = '';
    };
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
        break;
      };
      case 'expand_mode':
      {
        if (['click', 'mouseover'].includes(newVal))
        {
          this.#expandMode = newVal;
        };
        break;
      };
      case 'separator':
      {
        this.separator = newVal;
        break;
      };
      default:
      {
        this.style.setProperty('--' + attr, newVal);
      };
    };
  };

  connectedCallback() {
    this.#initEvents();
    this.ready = true;
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><input type="text" name="text" class="text" readonly="readonly" /><span class="box"></span><span class="empty"></span><div class="selector"></div><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
  };
};