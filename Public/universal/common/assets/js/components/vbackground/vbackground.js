import userAgentInspector from '../../../../../../common/assets/js/library/navigator/userAgentInspector.js';

export default class vbackground extends HTMLElement {
  static get observedAttributes() {
    return ['video', 'image'];
  };

  #video = null;
  #image = null;

  get video() {
    return this.#video;
  };

  get image() {
    return this.#image;
  };

  set video(video) {
    this.#video = video;
    this.update();
  };

  set image(image) {
    this.#image = image;
    this.update();
  };

  #initEvents() {
    let container = this.container;
    container.delegateEventListener('slot', 'slotchange', function(){
      this.assignedElements().forEach(el => el.classList.add('slotted'));
    });
  };

  render() {
    let container = this.container;
    let background = container.querySelector('div.background').empty();
    let ua = new userAgentInspector(navigator.userAgent);
    if (ua.isMobile())
    {
      let img = document.createElement('img');
      img.setAttribute('src', this.#image);
      background.append(img);
    }
    else
    {
      let video = document.createElement('video');
      video.setAttribute('src', this.#video);
      video.setAttribute('autoplay', 'true');
      video.setAttribute('loop', 'true');
      video.setAttribute('muted', 'true');
      video.setAttribute('playsinline', 'true');
      background.innerHTML = video.outerHTML;
      video.remove();
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
      case 'video':
      {
        this.video = newVal;
        break;
      };
      case 'image':
      {
        this.image = newVal;
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
        <div part="background" class="background"></div>
        <div part="box" class="box"><slot></slot></div>
      </container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.container = shadowRoot.querySelector('container');
    this.#initEvents();
  };
};