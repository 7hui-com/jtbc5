export default class jtbcFieldIconSelector extends HTMLElement {
  static get observedAttributes() {
    return ['mode', 'limit', 'value', 'icons', 'disabled', 'width'];
  };

  #icons = null;
  #iconsLoaded = false;
  #defaultIcons = 'aboutus,addressbook,administration,aidkit,airplane,airpods,alarm,alien,android,announcement,ant,aperture,api,app,apple,aquarium,archives,avatar,baby,badge,baseball,battery,bell_fill,bin,binoculars,book,books,boom,brain,brightness,brush,bug,bulb,bus,business,button,calculator,calendar,camera,car_battery,casette,cashbook,cat,chip,click,clothing,cloud_download,cloud_fill,cloud_ok,cloud_upload,clover,clubs,cny,code,compass,component,cone,container,control_power,copyright,coupon,coupons,crab,crown,cube,cup_fill,dartboard,dashboard,db_fill,desktop,device,diagram,diamond,disallow,disc,dish,doctoral_cap,dog,done,donuts,doubt,dove,drawer,droplet,earth,egg,electronics,emergency,environmental_protection,facial_mask,fan,fence,file,filebag,filebox,fingerprint,fire,floppy_disk,flower,folder,folder_upload,football,friends,frog,furniture,gas_station,ghost,gift,git,grid,group,hamburger,hardhat,headphones,heart_fill,heart_signal,hexagram,home,hops,horn,hospital,hotel,hotpot,icecream,image,jail,kettle,key,kit,lab,lifebuoy,list,location,log,lotus,love_fill,luckymoney,mail,maintenance,manager,map,mario,material,material_box,medal,message,mike,mobile,module,moneybag,monkey,mountain,mouse,mug,network,new,news,notebook,operator,orange,overview,package,pacman,paint_bucket,palette,partnership,paw,person_fill,pet,petbell,phone,phonebook,photographic_film,pie,planet,plug,policeman,poo,postagestamp,power,power_cord,power_switch,printer,prize_wheel,protect_money,public_welfare,puzzle,pyramid,query,receipt,red_envelope,ribbon,robot,rocket,rostrum,rudder,safe,sale,salesroom,sdcard,server,setting,shampoo,shield,ship,shopbag,shopcart,shop_fill,skull,soccer_ball,spades,square,stack,stamp,star_circle,star_fill,starburst,stroopwafel,sun,sync,tag,target,task,taxi,teeth,template,tent,terminal,thumbsup,tomato,trafficlight,train,tree,trophy,truck,trunk,typhoon,ufo,union,unlock,usb,userfind,users,virus,wall,wallet,warning,washroom,wechat,wheel,wxapp,yinyang';
  #disabled = false;
  #value = null;

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = '';
    let container = this.container;
    if (this.ready == true && this.#iconsLoaded == true)
    {
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
    }
    else
    {
      result = this.#value ?? '';
    };
    return result;
  };

  get disabled() {
    return this.#disabled;
  };

  get icons() {
    let result = [];
    if (Array.isArray(this.#icons))
    {
      result = this.#icons;
    }
    else
    {
      result = this.#defaultIcons.split(',');
    };
    return result;
  };

  set value(value) {
    if (this.ready == true)
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
      this.#value = value;
    };
  };

  set icons(icons) {
    this.#icons = icons.split(',');
    if (this.ready === true)
    {
      this.loadIconList();
    };
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #initEvents() {
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

  loadIconList() {
    let index = 0;
    let iconList = this.container.querySelector('div.iconList').empty();
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
          this.#iconsLoaded = true;
          if (this.#value != null)
          {
            this.value = this.#value;
          };
        };
      });
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
          this.loadIconList();
        };
      }
      case 'value':
      {
        this.value = this.#value = newVal;
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
    this.ready = true;
    this.loadIconList();
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><div class="iconList"></div><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.currentLimit = null;
    this.currentMode = 'single';
    this.#initEvents();
  };
};