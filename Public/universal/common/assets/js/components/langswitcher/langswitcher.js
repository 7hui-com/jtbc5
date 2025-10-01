export default class langswitcher extends HTMLElement {
  static get observedAttributes() {
    return ['backurl', 'options', 'value'];
  };

  #backurl = null;
  #langs = {'zh-cn': 0, 'en': 1, 'ja': 2, 'ko': 3, 'fr': 4, 'ru': 5, 'es': 6, 'ar': 7};
  #langsText = {'zh-cn': '简体中文', 'en': 'English', 'ja': '日本語', 'ko': '한국어', 'fr': 'Français', 'ru': 'Русский', 'es': 'Español', 'ar': 'اللغة العربية'};
  #options = [];
  #value = null;

  get value() {
    return this.#value;
  };

  set options(options) {
    this.#options = [];
    let el = this.container.querySelector('div.options').empty();
    options.split(',').forEach(option => {
      if (this.#langs.hasOwnProperty(option))
      {
        this.#options.push({'lang': option, 'text': this.#langsText[option], 'value': this.#langs[option]});
      };
    });
    this.#options.forEach(option => {
      let item = document.createElement('div');
      let itemFlag = document.createElement('flag');
      let itemText = document.createElement('span');
      item.classList.add('option');
      item.setAttribute('part', 'option');
      item.setAttribute('lang', option.lang);
      item.setAttribute('value', option.value);
      itemFlag.setAttribute('part', 'option-flag');
      itemFlag.setAttribute('lang', option.lang);
      itemText.setAttribute('part', 'option-text');
      itemText.innerText = option.text;
      item.append(itemFlag, itemText);
      el.append(item);
    });
  };

  set value(value) {
    let selected = null;
    let el = this.container.querySelector('div.label');
    this.#options.forEach(option => {
      if (option.value === Number.parseInt(value))
      {
        selected = option;
      };
    });
    if (selected === null)
    {
      el.querySelector('span').innerText = '';
      el.querySelector('flag').removeAttribute('lang');
    }
    else
    {
      let originalValue = this.#value;
      this.#value = selected.value;
      el.querySelector('span').innerText = selected.text;
      el.querySelector('flag').setAttribute('lang', selected.lang);
      if (originalValue != null && originalValue != selected.value)
      {
        let url = this.baseURL + '../../../../../setting?type=language&language=' + encodeURIComponent(selected.lang);
        if (this.#backurl != null)
        {
          url += '&backurl=' + encodeURIComponent(this.#backurl);
        };
        nap(300).then(() => {
          location.href = url;
        });
      };
    };
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    container.delegateEventListener('div.label', 'click', function(){
      if (this.classList.contains('on'))
      {
        this.classList.remove('on');
        this.parentElement.querySelector('div.options').classList.remove('on');
      }
      else
      {
        this.classList.add('on');
        this.parentElement.querySelector('div.options').classList.add('on');
      };
    });
    container.delegateEventListener('div.option', 'click', function(){
      that.value = this.getAttribute('value');
      this.parentElement.classList.remove('on');
      this.parentElement.parentElement.querySelector('div.label').classList.remove('on');
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'backurl':
      {
        this.#backurl = newVal;
        break;
      };
      case 'options':
      {
        this.options = newVal;
        break;
      };
      case 'value':
      {
        this.value = newVal;
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
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    this.baseURL = import.meta.url.substring(0, import.meta.url.lastIndexOf('/') + 1);
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="langswitcher" style="display:none">
        <div part="label" class="label"><flag part="flag"></flag><span part="label-text"></span><em part="label-em"><jtbc-svg name="arrow_down" part="label-svg"></jtbc-svg></em></div>
        <div part="options" class="options"></div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.langswitcher');
    this.container.loadComponents();
  };
};