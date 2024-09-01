export default class jtbcImageSwitcher extends HTMLElement {
  static get observedAttributes() {
    return ['autoplay', 'clickable', 'gallery', 'width', 'height'];
  };

  #autoplay = false;
  #autoplayInterval;
  #clickable = false;
  #gallery = [];
  #totalCount = 0;
  #manuallyOperated = false;

  get autoplay() {
    return this.#autoplay;
  };

  get clickable() {
    return this.#clickable;
  };

  get gallery() {
    return this.#gallery;
  };

  set autoplay(autoplay) {
    this.#autoplay = (autoplay != 'false'? true: false);
  };

  set clickable(clickable) {
    let container = this.container;
    if (clickable != 'false')
    {
      this.#clickable = true;
      container.classList.add('clickable');
    }
    else
    {
      this.#clickable = false;
      container.classList.remove('clickable');
    };
  };

  set gallery(gallery) {
    let galleryArr = JSON.parse(gallery);
    if (Array.isArray(galleryArr))
    {
      this.#gallery = galleryArr;
      this.#totalCount = galleryArr.length;
      this.render();
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  #autoplayStart() {
    let container = this.container;
    this.#autoplayInterval = setInterval(() => {
      if (this.#autoplay == true)
      {
        if (this.#manuallyOperated == false)
        {
          let current = container.querySelector('li.on');
          if (current != null)
          {
            let totalCount = this.#totalCount;
            let nextIndex = current.index();
            if (nextIndex >= totalCount)
            {
              nextIndex = 0;
            };
            this.container.querySelector('li.li-' + nextIndex)?.click();
          };
        }
      }
      else
      {
        clearInterval(this.#autoplayInterval);
      };
    }, 5000);
  };

  #changeImage(index) {
    let container = this.container;
    let totalCount = this.#totalCount;
    container.querySelectorAll('div.image img').forEach(img => {
      if (Number.parseInt(img.getAttribute('index')) == index)
      {
        img.classList.add('on');
      }
      else
      {
        img.classList.remove('on');
      };
    });
    container.querySelector('div.button-left')?.classList.toggle('disabled', index == 0);
    container.querySelector('div.button-right')?.classList.toggle('disabled', index >= (totalCount - 1));
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    container.delegateEventListener('div.image img', 'click', function(){
      if (that.clickable)
      {
        let target = that.getTarget();
        if (target != null)
        {
          target.open(Number.parseInt(this.getAttribute('index')));
        };
      };
    });
    container.delegateEventListener('div.thumb li', 'click', function(e){
      if (e.isTrusted == true)
      {
        that.#manuallyOperated = true;
      };
      let parentWidth = this.parentElement.offsetWidth;
      let thumbWidth = this.parentElement.parentElement.offsetWidth;
      this.parentElement.querySelectorAll('li').forEach(li => {
        if (li == this)
        {
          li.classList.add('on');
          that.#changeImage(Number.parseInt(li.getAttribute('index')));
          li.parentElement.style.left = Math.max(Math.min(0, (0 - li.offsetLeft + thumbWidth / 2 - li.offsetWidth / 2)), Math.min(0, thumbWidth - parentWidth)) + 'px';
        }
        else
        {
          li.classList.remove('on');
        };
      });
    });
    container.delegateEventListener('div.button-left', 'click', function(){
      that.#manuallyOperated = true;
      let current = container.querySelector('li.on');
      if (current != null)
      {
        let prevIndex = Math.max(0, Number.parseInt(current.getAttribute('index')) - 1);
        container.querySelector('li.li-' + prevIndex).click();
      };
    });
    container.delegateEventListener('div.button-right', 'click', function(){
      that.#manuallyOperated = true;
      let current = container.querySelector('li.on');
      if (current != null)
      {
        let nextIndex = Math.min(that.#totalCount - 1, Number.parseInt(current.getAttribute('index')) + 1);
        container.querySelector('li.li-' + nextIndex).click();
      };
    });
  };

  render() {
    let gallery = this.gallery;
    let container = this.container;
    let thumbEl = container.querySelector('div.thumb').empty();
    let imageEl = container.querySelector('div.image').empty();
    if (Array.isArray(gallery) && gallery.length != 0)
    {
      let index = 0;
      let ul = document.createElement('ul');
      ul.setAttribute('part', 'thumb-ul');
      gallery.forEach(item => {
        let li = document.createElement('li');
        let img = document.createElement('img');
        li.dataset.image = item.image;
        li.setAttribute('part', 'thumb-li');
        li.setAttribute('index', index);
        li.classList.add('li-' + index);
        img.setAttribute('src', item.image);
        img.setAttribute('index', index);
        img.setAttribute('part', 'thumb-img');
        if (item.hasOwnProperty('title'))
        {
          li.dataset.title = item.title;
          img.setAttribute('title', item.title);
        };
        li.append(img);
        ul.append(li);
        imageEl.append(img.cloneNode());
        index += 1;
      });
      thumbEl.append(ul);
      let firstLi = ul.querySelector('li:first-of-type');
      if (firstLi != null)
      {
        this.#changeImage(0);
        this.#autoplayStart();
        firstLi.classList.add('on');
      };
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'autoplay':
      {
        this.autoplay = newVal;
        break;
      };
      case 'clickable':
      {
        this.clickable = newVal;
        break;
      };
      case 'gallery':
      {
        this.gallery = newVal;
        break;
      };
      case 'width':
      {
        this.style.width = isFinite(newVal)? newVal + 'px': newVal;
        break;
      };
      case 'height':
      {
        this.style.height = isFinite(newVal)? newVal + 'px': newVal;
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
      <div class="container" part="container" style="display:none">
        <div class="image" part="image"></div>
        <div class="thumb" part="thumb"></div>
        <div class="button-left disabled" part="button-left"><jtbc-svg name="arrow_left" part="button-left-svg">></jtbc-svg></div>
        <div class="button-right disabled" part="button-right"><jtbc-svg name="arrow_right" part="button-right-svg">></jtbc-svg></div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('div.container');
    this.container.loadComponents().then(() => this.#initEvents());
  };
};