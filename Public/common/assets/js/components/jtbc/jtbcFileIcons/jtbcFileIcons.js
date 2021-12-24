export default class jtbcFileIcons extends HTMLElement {
  static get observedAttributes() {
    return ['icon'];
  };

  #icon = 'others';
  #icons = ['7z','aac','apk','app','asp','aspx','avi','bak','bat','bin','bmp','cfm','cgi','css','csv','dat','db','dll','doc','docx','exe','flv','folder','gif','gz','html','ico','iso','jar','jpg','js','jsp','jtbc','log','lua','m4a','m4v','mdb','mid','mov','mp3','mp4','msi','ogg','otf','pdf','php','png','ppt','pptx','psd','rar','rss','sql','srt','svg','swf','sys','tar','tmp','ttf','txt','wav','wma','wmv','xls','xlsx','xml','zip'];

  get icon() {
    return this.#icon;
  };

  set icon(icon) {
    this.#icon = this.#icons.includes(icon)? icon: 'others';
    this.container.empty();
    let newImg = document.createElement('img');
    newImg.setAttribute('src', this.basePath + '/svg/' + this.icon + '.svg');
    this.container.append(newImg);
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'icon':
      {
        this.icon = newVal;
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
    shadowRoot.innerHTML = `<container style="display:block"></container>`;
    this.ready = false;
    this.container = shadowRoot.querySelector('container');
    this.basePath = import.meta.url.substring(0, import.meta.url.lastIndexOf('/'));
  };
};