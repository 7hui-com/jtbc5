export default class jtbcImageCaptchaInputter extends HTMLElement {
  static get observedAttributes() {
    return ['api', 'value', 'placeholder', 'disabled', 'width'];
  };

  #api = null;
  #captchaId = null;
  #captchaMd5hash = null;
  #captchaLoading = false;
  #disabled = false;

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = {};
    result.captcha = {
      'id': this.#captchaId,
      'md5hash': this.#captchaMd5hash,
    };
    result.value = this.container.querySelector('input.value').value;
    return JSON.stringify(result);
  };

  get disabled() {
    return this.#disabled;
  };

  set value(value) {
    this.container.querySelector('input.value').value = value;
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

  #initEvents() {
    let that = this;
    let container = this.container;
    container.delegateEventListener('img.captcha', 'click', function(){
      that.loadCaptcha();
    });
    container.querySelectorAll('input.value').forEach(input => {
      input.addEventListener('focus', function(){ container.classList.add('focus'); });
      input.addEventListener('blur', function(){ container.classList.remove('focus'); });
    });
  };

  async loadCaptcha() {
    let result = false;
    let api = this.#api;
    let container = this.container;
    if (this.#captchaLoading === false)
    {
      this.#captchaLoading = true;
      if (api != null)
      {
        let res = await fetch(api);
        if (res.ok)
        {
          let data = await res.json();
          if (data.code == 1)
          {
            this.#captchaId = data.data.id;
            this.#captchaMd5hash = data.data.md5hash;
            let captcha = container.querySelector('img.captcha');
            if (captcha != null)
            {
              captcha.src = data.data.image;
            }
            else
            {
              let img = document.createElement('img');
              img.classList.add('captcha');
              img.src = data.data.image;
              container.querySelector('div.captcha').append(img);
            };
            result = true;
          };
        };
        this.#captchaLoading = false;
      };
    };
    return result;
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    let container = this.container;
    switch(attr) {
      case 'api':
      {
        this.#api = newVal;
        this.loadCaptcha();
        break;
      };
      case 'value':
      {
        this.value = newVal;
        break;
      };
      case 'placeholder':
      {
        this.container.querySelector('input.value').setAttribute('placeholder', newVal);
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
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><div class="input"><input type="text" name="value" class="value" /></div><div class="captcha"></div><div class="box"></div><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.#initEvents();
  };
};