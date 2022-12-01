export default class jtbcFieldLocationPicker extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'value', 'placeholder', 'disabled', 'width', 'constant_api_key'];
  };

  #allowedTypes = ['tianditu', 'baidu', 'amap', 'qq'];

  get name() {
    return this.getAttribute('name');
  };

  get type() {
    return this.currentType;
  };

  get value() {
    let result = '';
    let container = this.container;
    if (this.currentValue != null)
    {
      result = this.currentValue;
    }
    else
    {
      let locationEl = container.querySelector('div.location');
      if (locationEl != null)
      {
        let spanItemEl = locationEl.querySelector('span');
        result = spanItemEl == null? '': spanItemEl.getAttribute('value');
      };
    };
    return result;
  };

  get disabled() {
    return this.currentDisabled;
  };

  set type(value) {
    this.currentType = value;
  };

  set value(value) {
    let container = this.container;
    let locationEl = container.querySelector('div.location');
    if (locationEl != null)
    {
      if (value == '')
      {
        locationEl.innerHTML = '';
        this.zoom = this.defaultZoom;
        this.longitude = this.defaultLongitude;
        this.latitude = this.defaultLatitude;
      }
      else
      {
        let valueObj = JSON.parse(value);
        if (valueObj.hasOwnProperty('longitude') && valueObj.hasOwnProperty('latitude'))
        {
          let spanItemEl = locationEl.querySelector('span');
          if (spanItemEl != null)
          {
            spanItemEl.setAttribute('value', value);
            spanItemEl.querySelector('em').innerText = valueObj.longitude + ',' + valueObj.latitude;
          }
          else
          {
            let newItemElement = document.createElement('span');
            let newItemElementEm = document.createElement('em');
            let newItemElementClose = document.createElement('jtbc-svg');
            newItemElementEm.innerText = valueObj.longitude + ',' + valueObj.latitude;
            newItemElementClose.setAttribute('name', 'close');
            newItemElement.setAttribute('value', value);
            newItemElement.append(newItemElementEm, newItemElementClose);
            locationEl.innerHTML = newItemElement.outerHTML;
          };
          if (valueObj.hasOwnProperty('zoom'))
          {
            this.zoom = valueObj.zoom;
          };
          this.longitude = valueObj.longitude;
          this.latitude = valueObj.latitude;
        };
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

  #getMapContainerHTML() {
    return `
      <div class="jtbcMapContainer">
        <div class="mapbox"><iframe></iframe></div>
        <div class="currentPoint">${this.longitude},${this.latitude}</div>
      </div>
    `;
  };

  #popupTiandituMap() {
    let that = this;
    that.dialog.popup(that.#getMapContainerHTML()).then(() => {
      let mapContainerEl = that.dialog.querySelector('div.jtbcMapContainer');
      let mapIFrameEl = mapContainerEl.querySelector('iframe');
      let currentPointEl = mapContainerEl.querySelector('div.currentPoint');
      let mapContainerCssEl = document.createElement('link');
      mapContainerCssEl.setAttribute('type', 'text/css');
      mapContainerCssEl.setAttribute('rel', 'stylesheet');
      mapContainerCssEl.setAttribute('href', that.mapContainerCssUrl);
      mapContainerCssEl.addEventListener('load', () => {
        mapIFrameEl.addEventListener('load', () => {
          let jsApi = document.createElement('script');
          jsApi.setAttribute('src', '//api.tianditu.gov.cn/api?v=4.0&tk=' + encodeURIComponent(this.constantApiKey));
          jsApi.addEventListener('load', () => {
            let mapInitScript = document.createElement('script');
            mapInitScript.setAttribute('src', that.componentBasePath + 'map/tianditu.js');
            mapIFrameEl.contentDocument.body.appendChild(mapInitScript);
          });
          mapIFrameEl.contentDocument.body.appendChild(jsApi);
          mapIFrameEl.contentWindow.parentComponent = that;
        });
        mapIFrameEl.setAttribute('src', that.componentBasePath + 'map.html');
        currentPointEl.addEventListener('click', function(){
          that.dialog.close().then(() => {
            let currentValue = {
              'type': 'tianditu',
              'zoom': Math.ceil(that.zoom),
              'longitude': that.longitude,
              'latitude': that.latitude,
            };
            that.value = JSON.stringify(currentValue);
          });
        });
      });
      mapContainerEl.parentNode.insertBefore(mapContainerCssEl, mapContainerEl);
    });
  };

  #popupBaiduMap() {
    let that = this;
    that.dialog.popup(that.#getMapContainerHTML()).then(() => {
      let mapContainerEl = that.dialog.querySelector('div.jtbcMapContainer');
      let mapIFrameEl = mapContainerEl.querySelector('iframe');
      let currentPointEl = mapContainerEl.querySelector('div.currentPoint');
      let mapContainerCssEl = document.createElement('link');
      mapContainerCssEl.setAttribute('type', 'text/css');
      mapContainerCssEl.setAttribute('rel', 'stylesheet');
      mapContainerCssEl.setAttribute('href', that.mapContainerCssUrl);
      mapContainerCssEl.addEventListener('load', () => {
        mapIFrameEl.addEventListener('load', () => {
          let baiduMapCssEl = document.createElement('link');
          baiduMapCssEl.setAttribute('type', 'text/css');
          baiduMapCssEl.setAttribute('rel', 'stylesheet');
          baiduMapCssEl.setAttribute('href', '//api.map.baidu.com/res/webgl/10/bmap.css');
          mapIFrameEl.contentDocument.querySelector('head').appendChild(baiduMapCssEl);
          let jsApi = document.createElement('script');
          jsApi.setAttribute('src', '//api.map.baidu.com/getscript?v=1.0&type=webgl&ak=' + encodeURIComponent(this.constantApiKey));
          jsApi.addEventListener('load', () => {
            let mapInitScript = document.createElement('script');
            mapInitScript.setAttribute('src', that.componentBasePath + 'map/baidu.js');
            mapIFrameEl.contentDocument.body.appendChild(mapInitScript);
          });
          mapIFrameEl.contentDocument.body.appendChild(jsApi);
          mapIFrameEl.contentWindow.parentComponent = that;
        });
        mapIFrameEl.setAttribute('src', that.componentBasePath + 'map.html');
        currentPointEl.addEventListener('click', function(){
          that.dialog.close().then(() => {
            let currentValue = {
              'type': 'baidu',
              'zoom': Math.ceil(that.zoom),
              'longitude': that.longitude,
              'latitude': that.latitude,
            };
            that.value = JSON.stringify(currentValue);
          });
        });
      });
      mapContainerEl.parentNode.insertBefore(mapContainerCssEl, mapContainerEl);
    });
  };

  #popupAmapMap() {
    let that = this;
    that.dialog.popup(that.#getMapContainerHTML()).then(() => {
      let mapContainerEl = that.dialog.querySelector('div.jtbcMapContainer');
      let mapIFrameEl = mapContainerEl.querySelector('iframe');
      let currentPointEl = mapContainerEl.querySelector('div.currentPoint');
      let mapContainerCssEl = document.createElement('link');
      mapContainerCssEl.setAttribute('type', 'text/css');
      mapContainerCssEl.setAttribute('rel', 'stylesheet');
      mapContainerCssEl.setAttribute('href', that.mapContainerCssUrl);
      mapContainerCssEl.addEventListener('load', () => {
        mapIFrameEl.addEventListener('load', () => {
          let jsApi = document.createElement('script');
          jsApi.setAttribute('src', '//webapi.amap.com/maps?v=2.0&plugin=AMap.Scale,AMap.ToolBar&key=' + encodeURIComponent(this.constantApiKey));
          jsApi.addEventListener('load', () => {
            let mapInitScript = document.createElement('script');
            mapInitScript.setAttribute('src', that.componentBasePath + 'map/amap.js');
            mapIFrameEl.contentDocument.body.appendChild(mapInitScript);
          });
          mapIFrameEl.contentDocument.body.appendChild(jsApi);
          mapIFrameEl.contentWindow.parentComponent = that;
        });
        mapIFrameEl.setAttribute('src', that.componentBasePath + 'map.html');
        currentPointEl.addEventListener('click', function(){
          that.dialog.close().then(() => {
            let currentValue = {
              'type': 'amap',
              'zoom': Math.ceil(that.zoom),
              'longitude': that.longitude,
              'latitude': that.latitude,
            };
            that.value = JSON.stringify(currentValue);
          });
        });
      });
      mapContainerEl.parentNode.insertBefore(mapContainerCssEl, mapContainerEl);
    });
  };

  #popupQQMap() {
    let that = this;
    that.dialog.popup(that.#getMapContainerHTML()).then(() => {
      let mapContainerEl = that.dialog.querySelector('div.jtbcMapContainer');
      let mapIFrameEl = mapContainerEl.querySelector('iframe');
      let currentPointEl = mapContainerEl.querySelector('div.currentPoint');
      let mapContainerCssEl = document.createElement('link');
      mapContainerCssEl.setAttribute('type', 'text/css');
      mapContainerCssEl.setAttribute('rel', 'stylesheet');
      mapContainerCssEl.setAttribute('href', that.mapContainerCssUrl);
      mapContainerCssEl.addEventListener('load', () => {
        mapIFrameEl.addEventListener('load', () => {
          let jsApi = document.createElement('script');
          jsApi.setAttribute('src', '//map.qq.com/api/gljs?v=1.exp&key=' + encodeURIComponent(this.constantApiKey));
          jsApi.addEventListener('load', () => {
            let mapInitScript = document.createElement('script');
            mapInitScript.setAttribute('src', that.componentBasePath + 'map/qq.js');
            mapIFrameEl.contentDocument.body.appendChild(mapInitScript);
          });
          mapIFrameEl.contentDocument.body.appendChild(jsApi);
          mapIFrameEl.contentWindow.parentComponent = that;
        });
        mapIFrameEl.setAttribute('src', that.componentBasePath + 'map.html');
        currentPointEl.addEventListener('click', function(){
          that.dialog.close().then(() => {
            let currentValue = {
              'type': 'qq',
              'zoom': Math.ceil(that.zoom),
              'longitude': that.longitude,
              'latitude': that.latitude,
            };
            that.value = JSON.stringify(currentValue);
          });
        });
      });
      mapContainerEl.parentNode.insertBefore(mapContainerCssEl, mapContainerEl);
    });
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    let selectorEl = container.querySelector('a.selector');
    container.addEventListener('click', (e) => {
      let self = e.target;
      if (that.disabled != true && that.value.length == 0)
      {
        if (container.contains(self) && !selectorEl.contains(self))
        {
          selectorEl.click();
        };
      };
    });
    container.delegateEventListener('div.location span', 'click', function(){ this.remove(); });
    container.delegateEventListener('a.selector', 'click', () => { that.popupMap(); });
    that.syncPlaceholder();
    that.syncValue();
  };

  popupMap() {
    if (this.dialog != null)
    {
      switch(this.type) {
        case 'tianditu':
        {
          this.#popupTiandituMap();
          break;
        };
        case 'baidu':
        {
          this.#popupBaiduMap();
          break;
        };
        case 'amap':
        {
          this.#popupAmapMap();
          break;
        };
        case 'qq':
        {
          this.#popupQQMap();
          break;
        };
      };
    };
  };

  syncPlaceholder() {
    if (this.currentPlaceholder != null)
    {
      let placeholderEl = this.container.querySelector('span.placeholder');
      if (placeholderEl != null) placeholderEl.innerText = this.currentPlaceholder;
    };
  };

  syncValue() {
    if (this.currentValue != null)
    {
      let locationEl = this.container.querySelector('div.location');
      if (locationEl != null)
      {
        this.value = this.currentValue;
        this.currentValue = null;
      };
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'type':
      {
        this.type = newVal;
        break;
      };
      case 'value':
      {
        this.currentValue = newVal;
        this.syncValue();
        break;
      };
      case 'placeholder':
      {
        this.currentPlaceholder = newVal;
        this.syncPlaceholder();
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
      case 'constant_api_key':
      {
        this.constantApiKey = newVal;
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
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let componentBasePath = import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"></div>
    `;
    let containerHTML = `<div class="location"></div><span class="placeholder"></span><a class="selector"><jtbc-svg name="location"></jtbc-svg></a><div class="mask"></div>`;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.currentDisabled = false;
    this.currentType = this.#allowedTypes[0];
    this.currentValue = null;
    this.currentPlaceholder = null;
    this.currentMap = null;
    this.constantApiKey = null;
    this.componentBasePath = componentBasePath;
    this.mapContainerCssUrl = componentBasePath + 'mapContainer.css';
    this.mapContainerIframeCssUrl = componentBasePath + 'mapContainerIFrame.css';
    this.zoom = this.defaultZoom = 8;
    this.longitude = this.defaultLongitude = 121.480226;
    this.latitude = this.defaultLatitude = 31.236381;
    this.dialog = document.getElementById('dialog');
    this.container = shadowRoot.querySelector('div.container');
    this.container.html(containerHTML).then(() => { this.#initEvents(); });
  };
};