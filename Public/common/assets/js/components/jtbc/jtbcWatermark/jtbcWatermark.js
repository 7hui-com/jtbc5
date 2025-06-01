export default class jtbcWatermark extends HTMLElement {
  static get observedAttributes() {
    return ['font', 'font-color', 'line-height', 'text', 'texts', 'image', 'width', 'height', 'rotate'];
  };

  #font = '32px Arial';
  #fontColor = 'rgba(0, 0, 0, 0.3)';
  #lineHeight = 50;
  #text = '';
  #texts = [];
  #image = null;
  #width = 600;
  #height = 600;
  #rotate = 338;

  get font() {
    return this.#font;
  };

  get fontColor() {
    return this.#fontColor;
  };

  get lineHeight() {
    return this.#lineHeight;
  }

  get text() {
    return this.#text;
  };

  get texts() {
    return this.#texts;
  };

  get image() {
    return this.#image;
  };

  get width() {
    return this.#width;
  };

  get height() {
    return this.#height;
  };

  get rotate() {
    return this.#rotate;
  };

  set font(font) {
    this.#font = font;
    this.update();
  };

  set fontColor(fontColor) {
    this.#fontColor = fontColor;
    this.update();
  };

  set lineHeight(lineHeight) {
    if (isFinite(lineHeight))
    {
      this.#lineHeight = Math.max(10, Number.parseInt(lineHeight));
    }
    else
    {
      this.#lineHeight = 30;
    };
    this.update();
  };

  set text(text) {
    this.#text = text;
    this.update();
  };

  set texts(texts) {
    try
    {
      let textArr = JSON.parse(texts);
      if (!Array.isArray(textArr))
      {
        this.#texts = [];
      }
      else
      {
        this.#texts = textArr;
      };
      this.update();
    }
    catch(e)
    {
      throw new Error('Unexpected value');
    };
  };

  set image(image) {
    this.#image = image;
    this.update();
  };

  set width(width) {
    if (isFinite(width))
    {
      this.#width = Math.max(10, Number.parseInt(width));
    }
    else
    {
      this.#width = 600;
    };
    this.update();
  };

  set height(height) {
    if (isFinite(height))
    {
      this.#height = Math.max(10, Number.parseInt(height));
    }
    else
    {
      this.#height = 600;
    };
    this.update();
  };

  set rotate(rotate) {
    if (isFinite(rotate))
    {
      this.#rotate = Math.min(360, Math.max(0, Number.parseInt(rotate)));
    }
    else
    {
      this.#rotate = 338;
    };
    this.update();
  };

  #initEvents() {
    let container = this.container;
    container.delegateEventListener('slot', 'slotchange', function(){
      this.assignedElements().forEach(el => el.classList.add('slotted'));
    });
  };

  render() {
    let text = this.#text;
    let texts = this.#texts;
    let image = this.#image;
    let width = this.#width;
    let height = this.#height;
    let container = this.container;
    let watermark = container.querySelector('div.watermark');
    if (text.length != 0)
    {
      let canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      let ctx = canvas.getContext('2d');
      ctx.font = this.#font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = this.#fontColor;
      ctx.translate(width / 2, height / 2);
      ctx.rotate(this.#rotate * Math.PI / 180);
      ctx.translate(0 - width / 2, 0 - height / 2);
      ctx.fillText(text, width / 2, height / 2);
      watermark.style.backgroundSize = (width / 2) + 'px ' + (height / 2) + 'px';
      watermark.style.backgroundImage = 'url(' + canvas.toDataURL('image/png', 1) + ')';
    }
    else if (texts.length != 0)
    {
      let index = -1;
      let lineHeight = this.#lineHeight;
      let startY = height / 2 - (texts.length - 1) * lineHeight / 2;
      let canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      let ctx = canvas.getContext('2d');
      ctx.font = this.#font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = this.#fontColor;
      ctx.translate(width / 2, height / 2);
      ctx.rotate(this.#rotate * Math.PI / 180);
      ctx.translate(0 - width / 2, 0 - height / 2);
      texts.forEach(text => {
        index += 1;
        ctx.fillText(text, width / 2, startY + index * lineHeight);
      });
      watermark.style.backgroundSize = (width / 2) + 'px ' + (height / 2) + 'px';
      watermark.style.backgroundImage = 'url(' + canvas.toDataURL('image/png', 1) + ')';
    }
    else if (image != null)
    {
      let img = new Image();
      img.addEventListener('load', e => {
        let imgWidth = e.target.width;
        let imgHeight = e.target.height;
        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext('2d');
        ctx.translate(width / 2, height / 2);
        ctx.rotate(this.#rotate * Math.PI / 180);
        ctx.translate(0 - width / 2, 0 - height / 2);
        ctx.drawImage(img, (width - imgWidth) / 2, (height - imgHeight) / 2, imgWidth, imgHeight);
        watermark.style.backgroundSize = (width / 2) + 'px ' + (height / 2) + 'px';
        watermark.style.backgroundImage = 'url(' + canvas.toDataURL('image/png', 1) + ')';
      });
      img.src = image;
    };
  };

  update() {
    if (this.ready)
    {
      this.render();
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'font':
      {
        this.font = newVal;
        break;
      };
      case 'font-color':
      {
        this.fontColor = newVal;
        break;
      };
      case 'line-height':
      {
        this.lineHeight = newVal;
        break;
      };
      case 'text':
      {
        this.text = newVal;
        break;
      };
      case 'texts':
      {
        this.texts = newVal;
        break;
      };
      case 'image':
      {
        this.image = newVal;
        break;
      };
      case 'width':
      {
        this.width = newVal;
        break;
      };
      case 'height':
      {
        this.height = newVal;
        break;
      };
      case 'rotate':
      {
        this.rotate = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.render();
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <container part="container" style="display:none">
        <div part="watermark" class="watermark"></div>
        <div part="box" class="box"><slot></slot></div>
      </container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('container');
    this.#initEvents();
  };
};