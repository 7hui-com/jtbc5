export default class jtbcFieldIconSelector extends HTMLElement {
  static get observedAttributes() {
    return ['mode', 'limit', 'value', 'icons', 'disabled', 'width'];
  };

  #icons = null;

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = '';
    let container = this.container;
    if (this.currentMode == 'single')
    {
      let selectedIcon = container.querySelector('span.icon.on');
      if (selectedIcon != null)
      {
        result = selectedIcon.getAttribute('name');
      };
    }
    else if (this.currentMode == 'multiple')
    {
      let selected = [];
      let selectedIcons = container.querySelectorAll('span.icon.on');
      selectedIcons.forEach(icon => {
        selected.push(icon.getAttribute('name'));
      });
      if (selected.length != 0)
      {
        result = JSON.stringify(selected);
      };
    };
    return result;
  };

  get disabled() {
    return this.currentDisabled;
  };

  get icons() {
    let result = [];
    if (Array.isArray(this.#icons))
    {
      result = this.#icons;
    }
    else
    {
      result = [
        'aboutus',
        'addressbook',
        'administration',
        'aidkit',
        'airplane',
        'alarm',
        'alien',
        'android',
        'announcement',
        'ant',
        'aperture',
        'app',
        'apple',
        'aquarium',
        'archives',
        'avatar',
        'baby',
        'badge',
        'baseball',
        'battery',
        'bell_fill',
        'bin',
        'binoculars',
        'book',
        'books',
        'boom',
        'brain',
        'brightness',
        'brush',
        'bug',
        'bulb',
        'bus',
        'business',
        'calculator',
        'calendar',
        'camera',
        'car_battery',
        'cashbook',
        'cat',
        'chip',
        'click',
        'clothing',
        'cloud_download',
        'cloud_fill',
        'cloud_ok',
        'cloud_upload',
        'clover',
        'clubs',
        'compass',
        'cone',
        'container',
        'control_power',
        'copyright',
        'coupon',
        'coupons',
        'crown',
        'cube',
        'cup_fill',
        'dartboard',
        'dashboard',
        'db_fill',
        'desktop',
        'device',
        'diagram',
        'diamond',
        'disallow',
        'disc',
        'dish',
        'doctoral_cap',
        'dog',
        'done',
        'donuts',
        'doubt',
        'dove',
        'drawer',
        'droplet',
        'earth',
        'electronics',
        'emergency',
        'environmental_protection',
        'facial_mask',
        'fan',
        'fence',
        'file',
        'filebag',
        'filebox',
        'fire',
        'floppy_disk',
        'flower',
        'folder',
        'folder_upload',
        'football',
        'friends',
        'ghost',
        'gift',
        'git',
        'grid',
        'hamburger',
        'hardhat',
        'headphones',
        'heart_fill',
        'heart_signal',
        'hexagram',
        'home',
        'hops',
        'horn',
        'hospital',
        'hotel',
        'hotpot',
        'icecream',
        'image',
        'jail',
        'kettle',
        'key',
        'kit',
        'lab',
        'lifebuoy',
        'list',
        'location',
        'log',
        'love_fill',
        'luckymoney',
        'mail',
        'maintenance',
        'manager',
        'map',
        'mario',
        'material',
        'material_box',
        'medal',
        'message',
        'mike',
        'mobile',
        'module',
        'moneybag',
        'monkey',
        'mountain',
        'mouse',
        'mug',
        'network',
        'new',
        'news',
        'notebook',
        'operator',
        'overview',
        'package',
        'pacman',
        'palette',
        'partnership',
        'paw',
        'person_fill',
        'pet',
        'petbell',
        'phone',
        'phonebook',
        'photographic_film',
        'pie',
        'planet',
        'plug',
        'policeman',
        'poo',
        'power',
        'power_cord',
        'power_switch',
        'printer',
        'prize_wheel',
        'protect_money',
        'public_welfare',
        'puzzle',
        'pyramid',
        'query',
        'receipt',
        'red_envelope',
        'ribbon',
        'robot',
        'rocket',
        'rostrum',
        'rudder',
        'safe',
        'sale',
        'salesroom',
        'sdcard',
        'server',
        'setting',
        'shampoo',
        'shield',
        'shopbag',
        'shopcart',
        'shop_fill',
        'skull',
        'slack',
        'soccer_ball',
        'spades',
        'square',
        'stack',
        'stamp',
        'star_circle',
        'star_fill',
        'starburst',
        'stroopwafel',
        'sun',
        'sync',
        'tag',
        'target',
        'task',
        'taxi',
        'template',
        'terminal',
        'thumbsup',
        'tomato',
        'trafficlight',
        'train',
        'tree',
        'trophy',
        'truck',
        'trunk',
        'typhoon',
        'union',
        'usb',
        'userfind',
        'users',
        'virus',
        'wall',
        'wallet',
        'warning',
        'washroom',
        'wechat',
        'yinyang',
      ];
    };
    return result;
  };

  set value(value) {
    if (this.ready)
    {
      let container = this.container;
      container.querySelectorAll('span.icon.on').forEach(icon => {
        icon.classList.remove('on');
      });
      if (value.trim() != '')
      {
        let selected = [];
        if (this.currentMode == 'single')
        {
          selected.push(value);
        }
        else if (this.currentMode == 'multiple')
        {
          selected = JSON.parse(value);
        };
        if (Array.isArray(selected) && selected.length != 0)
        {
          container.querySelectorAll('span.icon').forEach(icon => {
            if (selected.includes(icon.getAttribute('name')))
            {
              icon.classList.add('on');
            };
          });
        };
      };
    }
    else
    {
      this.currentValue = value;
    };
  };

  set icons(icons) {
    this.#icons = icons.split(',');
    if (this.ready === true)
    {
      this.loadIocnList();
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

  getValidIcons() {
    let result = this.icons;
    if (Array.isArray(this.currentLimit))
    {
      result = [];
      this.currentLimit.forEach(icon => {
        if (this.icons.includes(icon))
        {
          result.push(icon);
        };
      });
    };
    return result;
  };

  loadIocnList() {
    let container = this.container;
    let iconList = container.querySelector('.iconList');
    if (iconList != null)
    {
      iconList.innerHTML = '';
      let index = 0;
      let validIcons = this.getValidIcons();
      validIcons.forEach(icon => {
        let newIcon = document.createElement('span');
        newIcon.classList.add('icon');
        newIcon.setAttribute('name', icon);
        newIcon.html('<jtbc-svg name="' + icon + '"></jtbc>').then(() => {
          index += 1;
          iconList.append(newIcon);
          if (validIcons.length == index)
          {
            if (this.currentValue != null)
            {
              this.value = this.currentValue;
            };
          };
        });
      });
    };
  };

  initEvents() {
    let that = this;
    let container = this.container;
    container.delegateEventListener('span.icon', 'click', function(){
      if (that.currentMode == 'single')
      {
        container.querySelectorAll('span.icon').forEach(el => {
          el.classList.remove('on');
        });
        this.classList.toggle('on');
      };
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'mode':
      {
        if (['single', 'multiple'].includes(newVal))
        {
          this.currentMode = newVal;
        };
      }
      case 'limit':
      {
        this.currentLimit = JSON.parse(newVal);
        if (this.ready === true)
        {
          this.loadIocnList();
        };
      }
      case 'value':
      {
        this.value = this.currentValue = newVal;
        break;
      };
      case 'icons':
      {
        this.icons = newVal;
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
    this.loadIocnList();
    this.initEvents();
    this.ready = true;
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('.')) + '.css';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><div class="iconList"></div><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.currentValue = null;
    this.currentLimit = null;
    this.currentDisabled = false;
    this.currentMode = 'single';
  };
};