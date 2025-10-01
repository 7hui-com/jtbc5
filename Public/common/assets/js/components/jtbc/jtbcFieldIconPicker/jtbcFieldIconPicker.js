export default class jtbcFieldIconPicker extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'icons', 'placeholder', 'disabled', 'width'];
  };

  #value = '';
  #disabled = false;
  #icons = null;
  #defaultIcons = 'aboutus,addressbook,administration,aidkit,airplane,airpods,alarm,alien,android,announcement,ant,aperture,api,app,apple,aquarium,archives,avatar,baby,badge,baseball,battery,bell_fill,bin,binoculars,book,books,boom,brain,brightness,brush,bug,bulb,bus,business,button,calculator,calendar,camera,car_battery,casette,cashbook,cat,chip,click,clothing,cloud_download,cloud_fill,cloud_ok,cloud_upload,clover,clubs,cny,code,compass,component,cone,container,control_power,copyright,coupon,coupons,crab,crown,cube,cup_fill,dartboard,dashboard,db_fill,desktop,device,diagram,diamond,disallow,disc,dish,doctoral_cap,dog,done,donuts,doubt,dove,drawer,droplet,earth,egg,electronics,emergency,environmental_protection,facial_mask,fan,fence,file,filebag,filebox,fingerprint,fire,floppy_disk,flower,folder,folder_upload,football,friends,frog,furniture,gas_station,ghost,gift,git,grid,group,hamburger,hardhat,headphones,heart_fill,heart_signal,hexagram,home,hops,horn,hospital,hotel,hotpot,icecream,image,jail,kettle,key,kit,lab,lifebuoy,list,location,log,lotus,love_fill,luckymoney,mail,maintenance,manager,map,mario,material,material_box,medal,message,mike,mobile,module,moneybag,monkey,mountain,mouse,mug,network,new,news,notebook,operator,orange,overview,package,pacman,paint_bucket,palette,partnership,paw,person_fill,pet,petbell,phone,phonebook,photographic_film,pie,planet,plug,policeman,poo,postagestamp,power,power_cord,power_switch,printer,prize_wheel,protect_money,public_welfare,puzzle,pyramid,query,receipt,red_envelope,ribbon,robot,rocket,rostrum,rudder,safe,sale,salesroom,sdcard,server,setting,shampoo,shield,ship,shopbag,shopcart,shop_fill,skull,soccer_ball,spades,square,stack,stamp,star_circle,star_fill,starburst,stroopwafel,sun,sync,tag,target,task,taxi,teeth,template,tent,terminal,thumbsup,tomato,trafficlight,train,tree,trophy,truck,trunk,typhoon,ufo,union,unlock,usb,userfind,users,virus,wall,wallet,warning,washroom,wechat,wheel,wxapp,yinyang';
  #closeSelectorTimeout;

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    return this.#value;
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

  get disabled() {
    return this.#disabled;
  };

  set value(value) {
    this.#value = value;
    this.syncInputValue();
  };

  set icons(icons) {
    this.#icons = icons.split(',');
    this.loadIconList();
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
    selectorEl.delegateEventListener('span.icon', 'click', function(){
      that.closeSelector(0);
      that.value = this.getAttribute('icon');
      that.dispatchEvent(new CustomEvent('selected', {bubbles: true}));
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

  loadIconList() {
    let container = this.container;
    let selectorEl = container.querySelector('div.selector').empty();
    let icons = document.createElement('div');
    icons.classList.add('icons');
    this.icons.forEach(icon => {
      let span = document.createElement('span');
      let jtbcSvg = document.createElement('jtbc-svg');
      span.classList.add('icon');
      span.setAttribute('icon', icon);
      jtbcSvg.setAttribute('name', icon);
      span.append(jtbcSvg);
      icons.append(span);
    });
    selectorEl.append(icons);
    selectorEl.loadComponents();
    this.syncInputValue();
  };

  syncInputValue() {
    let container = this.container;
    let svgEl = container.querySelector('span.svg').empty();
    let inputTextEl = container.querySelector('input.text');
    let selectorEl = container.querySelector('div.selector');
    let currentValue = this.value;
    if (currentValue != '')
    {
      selectorEl.querySelectorAll('span.icon').forEach(icon => {
        if (icon.getAttribute('icon') == currentValue)
        {
          let jtbcSvg = document.createElement('jtbc-svg');
          jtbcSvg.setAttribute('name', currentValue);
          icon.classList.add('on');
          inputTextEl.value = currentValue;
          svgEl.append(jtbcSvg);
        }
        else
        {
          icon.classList.remove('on');
        };
      });
    }
    else
    {
      inputTextEl.value = '';
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'value':
      {
        this.value = newVal;
        break;
      };
      case 'icons':
      {
        this.icons = newVal;
        break;
      };
      case 'placeholder':
      {
        this.container.querySelector('input.text').setAttribute('placeholder', newVal);
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
    this.#initEvents();
    this.loadIconList();
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><span class="svg"></span><input type="text" name="text" class="text" readonly="readonly" /><span class="box"></span><span class="empty"></span><div class="selector"></div><div class="mask"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
  };
};