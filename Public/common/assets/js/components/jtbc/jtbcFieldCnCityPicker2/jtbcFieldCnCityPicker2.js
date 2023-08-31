export default class jtbcFieldCityPicker2 extends HTMLElement {
  static get observedAttributes() {
    return ['separator', 'src', 'value', 'disabled'];
  };

  #data = null;
  #value = '';
  #separator = '';
  #disabled = false;

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = '';
    let data = this.#data;
    if (data == null)
    {
      result = this.#value;
    }
    else
    {
      let container = this.container;
      let provinceEl = container.querySelector('select.province');
      let cityEl = container.querySelector('select.city');
      if (provinceEl != null && cityEl != null)
      {
        if (provinceEl.value != '' && cityEl.value != '')
        {
          result = provinceEl.value + this.#separator + cityEl.value;
        };
      };
    };
    return result;
  };

  get disabled() {
    return this.#disabled;
  };

  get province() {
    let result = null;
    let data = this.#data;
    let value = this.#value;
    if (value.length != 0)
    {
      if (this.#separator != '')
      {
        result = value.substring(0, value.indexOf(this.#separator));
      }
      else
      {
        if (data != null)
        {
          Object.keys(data).forEach(item => {
            if (value.indexOf(item) == 0)
            {
              result = item;
            };
          });
        };
      };
    };
    return result;
  };

  get city() {
    let result = null;
    let province = this.province;
    let value = this.#value;
    if (province != null)
    {
      if (this.#separator != '')
      {
        result = value.substring(value.indexOf(this.#separator) + this.#separator.length);
      }
      else
      {
        result = value.substring(province.length);
      };
    };
    return result;
  };

  set value(value) {
    this.#value = value;
    this.resetOptions();
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    container.delegateEventListener('select.province', 'change', function(){
      that.resetCityOptions(this.value);
    });
  };

  async getData() {
    let result = this.#data;
    if (result == null)
    {
      let res = await fetch(this.src);
      if (res.ok)
      {
        result = this.#data = await res.json();
      };
    };
    return result;
  };

  resetOptions() {
    let container = this.container;
    if (this.ready == true)
    {
      let provinceEl = container.querySelector('select.province');
      let province = document.createElement('select');
      province.classList.add('province');
      province.options.add(new Option(this.textProvince, ''));
      this.getData().then(data => {
        if (data != null)
        {
          Object.keys(data).forEach(item => {
            if (this.province != item)
            {
              province.options.add(new Option(item, item));
            }
            else
            {
              province.options.add(new Option(item, item, false, true));
            };
          });
          if (provinceEl != null)
          {
            provinceEl.replaceWith(province);
          }
          else
          {
            container.insertBefore(province, container.querySelector('span.box'));
          };
          this.resetCityOptions(this.province);
        };
      });
    };
  };

  resetCityOptions(province) {
    let container = this.container;
    let cityEl = container.querySelector('select.city');
    let city = document.createElement('select');
    city.classList.add('city');
    city.options.add(new Option(this.textCity, ''));
    this.getData().then(data => {
      if (Object.keys(data).includes(province))
      {
        data[province].forEach(item => {
          if (this.province == province && this.city == item)
          {
            city.options.add(new Option(item, item, false, true));
          }
          else
          {
            city.options.add(new Option(item, item));
          };
        });
      };
      if (cityEl != null)
      {
        cityEl.replaceWith(city);
      }
      else
      {
        container.insertBefore(city, container.querySelector('span.box'));
      };
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'separator':
      {
        this.#separator = newVal;
        this.resetOptions();
        break;
      }
      case 'src':
      {
        this.src = newVal;
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
    };
  };

  connectedCallback() {
    this.ready = true;
    this.resetOptions();
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let basePath = import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><span class="box"></span><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.textProvince = '=省=';
    this.textCity = '=市/区=';
    this.src = basePath + 'data/mainland.json';
    this.#initEvents();
  };
};