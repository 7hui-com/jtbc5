export default class jtbcSkeleton extends HTMLElement {
  static get observedAttributes() {
    return ['theme', 'gap', 'radius', 'background-color', 'title-width', 'title-height', 'img-width', 'img-height', 'avatar-width', 'avatar-radius', 'content-line-height', 'content-line-gap'];
  };

  #theme = 0;
  #themes = [1, 2, 3, 4, 5, 6];

  get theme() {
    return this.#theme;
  };

  set theme(theme) {
    theme = Number.parseInt(theme);
    this.#theme = this.#themes.includes(theme)? theme: 1;
    this.#setTheme(this.#theme);
  };

  #setTheme(theme) {
    this.container.empty();
    let wrap = document.createElement('div');
    wrap.classList.add('theme' + theme);
    if (theme == 1)
    {
      let content = document.createElement('div');
      content.classList.add('content');
      for (let i = 0; i < 5; i ++)
      {
        let line = document.createElement('div');
        line.classList.add('line');
        content.append(line);
      };
      wrap.append(content);
    }
    else if (theme == 2)
    {
      let content = document.createElement('div');
      content.classList.add('content');
      for (let i = 0; i < 3; i ++)
      {
        let line = document.createElement('div');
        line.classList.add('line');
        content.append(line);
      };
      wrap.append(content);
    }
    else if (theme == 3)
    {
      let img = document.createElement('div');
      let title = document.createElement('div');
      img.classList.add('img');
      title.classList.add('title');
      wrap.append(img);
      wrap.append(title);
    }
    else if (theme == 4)
    {
      let img = document.createElement('div');
      let content = document.createElement('div');
      img.classList.add('img');
      content.classList.add('content');
      for (let i = 0; i < 2; i ++)
      {
        let line = document.createElement('div');
        line.classList.add('line');
        content.append(line);
      };
      wrap.append(img);
      wrap.append(content);
    }
    else if (theme == 5)
    {
      let leftBox = document.createElement('div');
      let rightBox = document.createElement('div');
      let img = document.createElement('div');
      let title = document.createElement('div');
      let content = document.createElement('div');
      leftBox.classList.add('leftBox');
      rightBox.classList.add('rightBox');
      img.classList.add('img');
      title.classList.add('title');
      content.classList.add('content');
      for (let i = 0; i < 5; i ++)
      {
        let line = document.createElement('div');
        line.classList.add('line');
        content.append(line);
      };
      leftBox.append(img);
      rightBox.append(title);
      rightBox.append(content);
      wrap.append(leftBox);
      wrap.append(rightBox);
    }
    else if (theme == 6)
    {
      let leftBox = document.createElement('div');
      let rightBox = document.createElement('div');
      let avatar = document.createElement('div');
      let title = document.createElement('div');
      let content = document.createElement('div');
      leftBox.classList.add('leftBox');
      rightBox.classList.add('rightBox');
      avatar.classList.add('avatar');
      title.classList.add('title');
      content.classList.add('content');
      for (let i = 0; i < 3; i ++)
      {
        let line = document.createElement('div');
        line.classList.add('line');
        content.append(line);
      };
      leftBox.append(avatar);
      rightBox.append(title);
      rightBox.append(content);
      wrap.append(leftBox);
      wrap.append(rightBox);
    };
    this.container.append(wrap);
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'theme':
      {
        this.theme = newVal;
        break;
      };
      case 'gap':
      {
        this.style.setProperty('--gap', isFinite(newVal)? newVal + 'px': newVal);
        break;
      };
      case 'radius':
      {
        this.style.setProperty('--radius', isFinite(newVal)? newVal + 'px': newVal);
        break;
      };
      case 'background-color':
      {
        this.style.setProperty('--background-color', newVal);
        break;
      };
      case 'title-width':
      {
        this.style.setProperty('--title-width', isFinite(newVal)? newVal + 'px': newVal);
        break;
      };
      case 'title-height':
      {
        this.style.setProperty('--title-height', isFinite(newVal)? newVal + 'px': newVal);
        break;
      };
      case 'img-width':
      {
        this.style.setProperty('--img-width', isFinite(newVal)? newVal + 'px': newVal);
        break;
      };
      case 'img-height':
      {
        this.style.setProperty('--img-height', isFinite(newVal)? newVal + 'px': newVal);
        break;
      };
      case 'avatar-width':
      {
        this.style.setProperty('--avatar-width', isFinite(newVal)? newVal + 'px': newVal);
        break;
      };
      case 'avatar-radius':
      {
        this.style.setProperty('--avatar-radius', isFinite(newVal)? newVal + 'px': newVal);
        break;
      };
      case 'content-line-height':
      {
        this.style.setProperty('--content-line-height', isFinite(newVal)? newVal + 'px': newVal);
        break;
      };
      case 'content-line-gap':
      {
        this.style.setProperty('--content-line-gap', isFinite(newVal)? newVal + 'px': newVal);
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    if (this.theme == 0) {
      this.theme = 1;
    };
  };

  constructor() {
    super();
    this.ready = false;
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    shadowRoot.innerHTML = `<style>@import url('${importCssUrl}');</style><container style="display:none"></container>`;
    this.container = shadowRoot.querySelector('container');
  };
};