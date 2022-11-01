export default class jtbcLocationMapViewer extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'constant_api_key', 'location', 'information', 'height', 'zoom'];
  };

  #map = null;
  #mapContainer = null;
  #mapInstance = null;
  #type = null;
  #location = null;
  #icon = null;
  #information = null;
  #height = null;
  #constantApiKey = null;
  #points = {};
  #pointIndex = 0;
  #defaultHeight = 300;
  #defaultLongitude = 121.480226;
  #defaultLatitude = 31.236381;
  #allowedTypes = ['tianditu', 'baidu', 'amap', 'qq'];

  get name() {
    return this.getAttribute('name');
  };

  get type() {
    return this.#type;
  };

  get location() {
    return this.#location;
  };

  get information() {
    return this.#information;
  };

  get height() {
    return this.#height ?? Math.max(this.offsetHeight, this.#defaultHeight);
  };

  get constantApiKey() {
    return this.#constantApiKey;
  };

  set type(value) {
    if (this.#allowedTypes.includes(value))
    {
      this.#type = value;
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  set location(value) {
    this.#location = value;
  };

  set information(value) {
    this.#information = value;
  };

  addPoint(longitude, latitude, information = null, pointIndex = null) {
    let result = null;
    let map = this.#map;
    let mapInstance = this.#mapInstance;
    let mapContainer = this.#mapContainer;
    if (this.type == 'tianditu')
    {
      let currentPointIndex = result = pointIndex ?? this.getNextPointIndex();
      let currentPoint = this.#points['point-' + currentPointIndex] = new map.LngLat(longitude, latitude);
      let currentIcon = this.#points['icon-' + currentPointIndex] = new map.Icon({'iconUrl': this.#icon, 'iconSize': new map.Point(30, 30), 'iconAnchor': new map.Point(15, 30)});
      let currentMarker = this.#points['marker-' + currentPointIndex] = new map.Marker(currentPoint, {'icon': currentIcon});
      if (information != null)
      {
        let currentInfoWindow = this.#points['infoWindow-' + currentPointIndex] = new map.InfoWindow(information, {'offset': new map.Point(0, -40)});
        currentInfoWindow.setLngLat(currentPoint);
        currentMarker.addEventListener('click', function(){ mapInstance.openInfoWindow(currentInfoWindow); });
      };
      mapInstance.addOverLay(currentMarker);
    }
    else if (this.type == 'baidu')
    {
      let currentPointIndex = result = pointIndex ?? this.getNextPointIndex();
      let currentPoint = this.#points['point-' + currentPointIndex] = new map.Point(longitude, latitude);
      let currentIcon = this.#points['icon-' + currentPointIndex] = new map.Icon(this.#icon, new map.Size(30, 30));
      let currentMarker = this.#points['marker-' + currentPointIndex] = new map.Marker(currentPoint, {'icon': currentIcon});
      if (information != null)
      {
        let currentInfoWindow = this.#points['infoWindow-' + currentPointIndex] = new map.InfoWindow(information);
        currentMarker.addEventListener('click', function(){ mapInstance.openInfoWindow(currentInfoWindow, currentPoint); });
      };
      mapInstance.addOverlay(currentMarker);
    }
    else if (this.type == 'amap')
    {
      let currentPointIndex = result = pointIndex ?? this.getNextPointIndex();
      let currentPoint = this.#points['point-' + currentPointIndex] = new map.LngLat(longitude, latitude);
      let currentIcon = this.#points['icon-' + currentPointIndex] = new map.Icon({'image': this.#icon, 'size': new map.Size(206, 206), 'imageSize': new map.Size(30, 30)});
      let currentMarker = this.#points['marker-' + currentPointIndex] = new map.Marker({'map': mapInstance, 'position': currentPoint, 'icon': currentIcon, 'offset': new map.Pixel(-15, -30)});
      if (information != null)
      {
        let currentInfoWindow = this.#points['infoWindow-' + currentPointIndex] = new map.InfoWindow({'content': information, 'offset': new map.Pixel(0, -40)});
        currentMarker.on('click', function(){ currentInfoWindow.open(mapInstance, currentMarker.getPosition()); });
      };
      mapInstance.add(currentMarker);
    }
    else if (this.type == 'qq')
    {
      let currentPointIndex = result = pointIndex ?? this.getNextPointIndex();
      let currentPoint = this.#points['point-' + currentPointIndex] = new map.LatLng(latitude, longitude);
      let currentCustomEvent = new CustomEvent('addMarker', {detail: {'mapInstance': mapInstance, 'icon': this.#icon, 'point': currentPoint}});
      mapContainer.dispatchEvent(currentCustomEvent);
      let currentMarker = this.#points['marker-' + currentPointIndex] = currentCustomEvent.detail.result;
      if (information != null)
      {
        let currentInfoWindow = this.#points['infoWindow-' + currentPointIndex] = new map.InfoWindow({'map': mapInstance, 'position': currentPoint, 'content': information, 'offset': { x: 0, y: -40 }}).close();
        currentMarker.on('click', function(){ currentInfoWindow.open(); });
      };
    };
    return result;
  };

  focusPoint(pointIndex) {
    let points = this.#points;
    let mapInstance = this.#mapInstance;
    if (points.hasOwnProperty('point-' + pointIndex))
    {
      let point = points['point-' + pointIndex];
      if (this.type == 'tianditu')
      {
        mapInstance.panTo(point);
      }
      else
      {
        mapInstance.setCenter(point);
      };
    };
  };

  getNextPointIndex() {
    this.#pointIndex += 1;
    return this.#pointIndex;
  };

  #builded() {
    if (this.location != null)
    {
      let longitude = null;
      let latitude = null;
      try
      {
        let location = JSON.parse(this.location);
        if (typeof location == 'object')
        {
          if (location.hasOwnProperty('longitude') && location.hasOwnProperty('latitude'))
          {
            longitude = location.longitude;
            latitude = location.latitude;
          };
        };
      }
      catch(e)
      {
      };
      if (longitude != null && latitude != null)
      {
        let pointIndex = 0;
        this.addPoint(longitude, latitude, this.information, pointIndex);
        this.focusPoint(pointIndex);
      };
    };
    this.builded = true;
    this.dispatchEvent(new CustomEvent('builded', {bubbles: true}));
  };

  #buildTiandituMap() {
    let mapIFrameEl = document.createElement('iframe');
    mapIFrameEl.setAttribute('width', '100%');
    mapIFrameEl.setAttribute('height', this.height);
    mapIFrameEl.setAttribute('frameborder', '0');
    mapIFrameEl.style.display = 'block';
    mapIFrameEl.addEventListener('load', () => {
      let mapIFrameDocument = mapIFrameEl.contentDocument;
      let jsApi = document.createElement('script');
      jsApi.setAttribute('src', '//api.tianditu.gov.cn/api?v=4.0&tk=' + encodeURIComponent(this.constantApiKey));
      jsApi.addEventListener('load', () => {
        let T = this.#map = mapIFrameEl.contentWindow.T;
        this.#mapContainer = mapIFrameDocument.querySelector('div.mapContainer');
        this.#mapInstance = new T.Map(this.#mapContainer);
        this.#mapInstance.centerAndZoom(new T.LngLat(this.#defaultLongitude, this.#defaultLatitude), this.zoom);
        this.#builded();
      });
      mapIFrameDocument.body.appendChild(jsApi);
    });
    mapIFrameEl.setAttribute('src', this.componentBasePath + 'map.html');
    this.container.append(mapIFrameEl);
  };

  #buildBaiduMap() {
    let mapIFrameEl = document.createElement('iframe');
    mapIFrameEl.setAttribute('width', '100%');
    mapIFrameEl.setAttribute('height', this.height);
    mapIFrameEl.setAttribute('frameborder', '0');
    mapIFrameEl.style.display = 'block';
    mapIFrameEl.addEventListener('load', () => {
      let mapIFrameDocument = mapIFrameEl.contentDocument;
      let baiduMapCssEl = document.createElement('link');
      baiduMapCssEl.setAttribute('type', 'text/css');
      baiduMapCssEl.setAttribute('rel', 'stylesheet');
      baiduMapCssEl.setAttribute('href', '//api.map.baidu.com/res/webgl/10/bmap.css');
      mapIFrameDocument.querySelector('head').appendChild(baiduMapCssEl);
      let jsApi = document.createElement('script');
      jsApi.setAttribute('src', '//api.map.baidu.com/getscript?v=1.0&type=webgl&ak=' + encodeURIComponent(this.constantApiKey));
      jsApi.addEventListener('load', () => {
        let BMapGL = this.#map = mapIFrameEl.contentWindow.BMapGL;
        this.#mapContainer = mapIFrameDocument.querySelector('div.mapContainer');
        this.#mapInstance = new BMapGL.Map(this.#mapContainer);
        this.#mapInstance.centerAndZoom(new BMapGL.Point(this.#defaultLongitude, this.#defaultLatitude), this.zoom);
        this.#mapInstance.addControl(new BMapGL.ScaleControl());
        this.#mapInstance.addControl(new BMapGL.ZoomControl());
        this.#mapInstance.enableScrollWheelZoom(true);
        this.#builded();
      });
      mapIFrameDocument.body.appendChild(jsApi);
    });
    mapIFrameEl.setAttribute('src', this.componentBasePath + 'map.html');
    this.container.append(mapIFrameEl);
  };

  #buildAmapMap() {
    let mapIFrameEl = document.createElement('iframe');
    mapIFrameEl.setAttribute('width', '100%');
    mapIFrameEl.setAttribute('height', this.height);
    mapIFrameEl.setAttribute('frameborder', '0');
    mapIFrameEl.style.display = 'block';
    mapIFrameEl.addEventListener('load', () => {
      let mapIFrameDocument = mapIFrameEl.contentDocument;
      let jsApi = document.createElement('script');
      jsApi.setAttribute('src', '//webapi.amap.com/maps?v=2.0&plugin=AMap.Scale,AMap.ToolBar&key=' + encodeURIComponent(this.constantApiKey));
      jsApi.addEventListener('load', () => {
        let AMap = this.#map = mapIFrameEl.contentWindow.AMap;
        this.#mapContainer = mapIFrameDocument.querySelector('div.mapContainer');
        this.#mapInstance = new AMap.Map(this.#mapContainer, {zoom: this.zoom, center: [this.#defaultLongitude, this.#defaultLatitude]});
        this.#mapInstance.addControl(new AMap.Scale());
        this.#mapInstance.addControl(new AMap.ToolBar());
        this.#builded();
      });
      mapIFrameDocument.body.appendChild(jsApi);
    });
    mapIFrameEl.setAttribute('src', this.componentBasePath + 'map.html');
    this.container.append(mapIFrameEl);
  };

  #buildQQMap() {
    let mapIFrameEl = document.createElement('iframe');
    mapIFrameEl.setAttribute('width', '100%');
    mapIFrameEl.setAttribute('height', this.height);
    mapIFrameEl.setAttribute('frameborder', '0');
    mapIFrameEl.style.display = 'block';
    mapIFrameEl.addEventListener('load', () => {
      let mapIFrameDocument = mapIFrameEl.contentDocument;
      let jsApi = document.createElement('script');
      jsApi.setAttribute('src', '//map.qq.com/api/gljs?v=1.exp&key=' + encodeURIComponent(this.constantApiKey));
      jsApi.addEventListener('load', () => {
        let TMap = this.#map = mapIFrameEl.contentWindow.TMap;
        let customEventApi = document.createElement('script');
        this.#mapContainer = mapIFrameDocument.querySelector('div.mapContainer');
        this.#mapInstance = new TMap.Map(this.#mapContainer, {zoom: this.zoom, center: new TMap.LatLng(this.#defaultLatitude, this.#defaultLongitude)});
        customEventApi.setAttribute('src', this.componentBasePath + 'map/qq.js');
        customEventApi.addEventListener('load', () => { this.#builded(); });
        mapIFrameDocument.body.appendChild(customEventApi);
      });
      mapIFrameDocument.body.appendChild(jsApi);
    });
    mapIFrameEl.setAttribute('src', this.componentBasePath + 'map.html');
    this.container.append(mapIFrameEl);
  };

  #buildMap() {
    switch(this.type) {
      case 'tianditu':
      {
        this.#buildTiandituMap();
        break;
      };
      case 'baidu':
      {
        this.#buildBaiduMap();
        break;
      };
      case 'amap':
      {
        this.#buildAmapMap();
        break;
      };
      case 'qq':
      {
        this.#buildQQMap();
        break;
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
      case 'constant_api_key':
      {
        this.#constantApiKey = newVal;
        break;
      };
      case 'location':
      {
        this.location = newVal;
        break;
      };
      case 'information':
      {
        this.information = newVal;
        break;
      };
      case 'height':
      {
        if (isFinite(newVal))
        {
          this.#height = Number.parseInt(newVal);
          this.container.querySelector('iframe')?.setAttribute('height', this.#height);
        };
        break;
      };
      case 'zoom':
      {
        if (isFinite(newVal))
        {
          this.zoom = Math.max(Math.min(Number.parseInt(newVal), 18), 1);
        };
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#buildMap();
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let componentBasePath = import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/';
    let shadowRootHTML = `<style>:host { display: block; }</style><div class="container"></div>`;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.builded = false;
    this.type = this.#allowedTypes[0];
    this.componentBasePath = componentBasePath;
    this.zoom = this.defaultZoom = 10;
    this.container = shadowRoot.querySelector('div.container');
    this.#icon = componentBasePath + 'location.png';
  };
};