export default class jtbcToast extends HTMLElement {
  static get observedAttributes() {
    return ['position', 'timeout'];
  };

  #position = 'top-right';
  #timeout = 3000;

  get position() {
    return this.#position;
  };

  get timeout() {
    return this.#timeout;
  };

  set position(position) {
    if (['top-left', 'top-center', 'top-right', 'middle-left', 'center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'].includes(position))
    {
      this.#position = position;
    }
    else
    {
      this.setAttribute('position', 'top-right');
    };
  };

  #checkMessages() {
    let container = this.container;
    let messageCount = container.querySelectorAll('div.message').length;
    if (messageCount == 0)
    {
      this.classList.remove('on');
    };
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    container.delegateEventListener('div.message', 'transitionend', function(){
      if (this.classList.contains('on') && this.classList.contains('out'))
      {
        if (this.callback != null)
        {
          this.callback();
        };
        this.remove();
        that.#checkMessages();
      };
    });
    container.delegateEventListener('div.message span.close', 'click', function(){
      this.parentElement.classList.add('out');
    });
  };

  push(message, type = 'info', title = null, timeout = null, callback = null) {
    this.classList.add('on');
    let icons = {'info': 'message', 'success': 'correct', 'warning': 'warning_triangle', 'error': 'incorrect'};
    let icon = icons.hasOwnProperty(type)? icons[type]: 'message';
    let msg = document.createElement('div');
    let msgIcon = document.createElement('div');
    let msgContent = document.createElement('div');
    msg.callback = callback;
    msg.classList.add('message');
    msg.setAttribute('type', type);
    if (timeout === false)
    {
      let msgClose = document.createElement('span');
      msgClose.classList.add('close');
      msgClose.html('<jtbc-svg name="close"></jtbc-svg>').then(el => msg.append(el));
    }
    else
    {
      timeout = Math.max(Number.parseInt(timeout ?? this.timeout), 1000);
      msg.setAttribute('timeout', timeout);
      setTimeout(() => msg.classList.add('out'), timeout);
    };
    msgIcon.classList.add('icon');
    msgIcon.html('<jtbc-svg name="' + icon + '"></jtbc-svg>');
    msgContent.classList.add('content');
    if (title != null)
    {
      let msgContentTitle = document.createElement('span');
      msgContentTitle.classList.add('title');
      msgContentTitle.innerText = title;
      msgContent.append(msgContentTitle);
    };
    let msgContentText = document.createElement('span');
    msgContentText.classList.add('text');
    msgContentText.innerText = message;
    msgContent.append(msgContentText);
    msg.append(msgIcon, msgContent);
    setTimeout(() => msg.classList.add('on'), 100);
    this.container.querySelector('div.messages').append(msg);
    return msg;
  };

  showInfo(message, title = null, timeout = null, callback = null) {
    return this.push(message, 'info', title, timeout, callback)
  };

  showSuccess(message, title = null, timeout = null, callback = null) {
    return this.push(message, 'success', title, timeout, callback)
  };

  showWarning(message, title = null, timeout = null, callback = null) {
    return this.push(message, 'warning', title, timeout, callback)
  };

  showError(message, title = null, timeout = null, callback = null) {
    return this.push(message, 'error', title, timeout, callback)
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'position':
      {
        this.position = newVal;
        break;
      };
      case 'timeout':
      {
        this.#timeout = Math.max(Number.parseInt(newVal), 1000);
        break;
      };
    };
  };

  connectedCallback() {
    this.#initEvents();
    if (!this.hasAttribute('position'))
    {
      this.setAttribute('position', this.position);
    };
    this.ready = true;
  };

  constructor() {
    super();
    this.ready = false;
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `<style>@import url('${importCssUrl}');</style><container><div class="messages"></div></container>`;
    shadowRoot.innerHTML = shadowRootHTML;
    this.container = shadowRoot.querySelector('container');
  };
};