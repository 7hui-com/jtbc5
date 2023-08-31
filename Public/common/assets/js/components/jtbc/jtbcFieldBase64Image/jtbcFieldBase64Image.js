export default class jtbcFieldBase64Image extends HTMLElement {
  static get observedAttributes() {
    return ['quality', 'value', 'disabled', 'width', 'height'];
  };

  #quality = 'medium';
  #disabled = false;
  #value = null;

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    return this.#value ?? '';
  };

  get disabled() {
    return this.#disabled;
  };

  set value(value) {
    this.#value = value;
    if (value == null || value == '')
    {
      this.container.classList.remove('loaded');
      this.container.querySelector('div.image').style.backgroundImage = 'none';
    }
    else
    {
      this.container.classList.add('loaded');
      this.container.querySelector('div.image').style.backgroundImage = 'url(' + this.#value + ')';
    };
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    container.delegateEventListener('div.fileRemover', 'click', function(){ that.value = ''; });
    container.delegateEventListener('div.fileSelector', 'click', function(){ this.querySelector('input.file').click(); });
    container.delegateEventListener('input.file', 'change', function(){
      let currentWidth = that.offsetWidth;
      let currentHeight = that.offsetHeight;
      if (this.files.length == 1)
      {
        let newImage = new Image();
        let fileReader = new FileReader();
        newImage.onload = function()
        {
          let sourceX = 0;
          let sourceY = 0;
          let imgWidth = newImage.width;
          let imgHeight = newImage.height;
          let sourceWidth = imgWidth;
          let sourceHeight = imgHeight;
          let canvas = document.createElement('canvas');
          let context = canvas.getContext('2d');
          canvas.width = currentWidth;
          canvas.height = currentHeight;
          context.imageSmoothingQuality = 'high';
          if (imgWidth / currentWidth > imgHeight / currentHeight)
          {
            sourceWidth = Math.ceil(imgWidth * ((imgHeight / currentHeight) / (imgWidth / currentWidth)));
            sourceX = Math.ceil((imgWidth - sourceWidth) / 2);
          }
          else
          {
            sourceHeight = Math.ceil(imgHeight * ((imgWidth / currentWidth) / (imgHeight / currentHeight)));
            sourceY = Math.ceil((imgHeight - sourceHeight) / 2);
          };
          context.drawImage(newImage, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, currentWidth, currentHeight);
          that.value = canvas.toDataURL('image/jpeg', that.getQuality());
        };
        fileReader.onload = function(e){
          newImage.setAttribute('src', e.target.result);
        };
        fileReader.readAsDataURL(this.files[0]);
      };
    });
  };

  getQuality() {
    let quality = 0.8;
    if (this.#quality == 'low')
    {
      quality = 0.6;
    }
    else if (this.#quality == 'high')
    {
      quality = 1;
    };
    return quality;
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'quality':
      {
        if (['low', 'medium', 'high'].includes(newVal))
        {
          this.#quality = newVal;
        };
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
      case 'height':
      {
        this.style.height = isFinite(newVal)? newVal + 'px': newVal;
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
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <container style="display:none">
        <div class="image"></div>
        <div class="fileSelector"><jtbc-svg name="camera"></jtbc-svg><input type="file" class="file" accept="image/gif,image/jpeg,image/jpg,image/png" /></div>
        <div class="fileRemover"><jtbc-svg name="trash"></jtbc-svg></div>
        <div class="mask"></div>
      </container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('container');
    this.container.loadComponents().then(() => { this.#initEvents(); });
  };
};