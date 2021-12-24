export default class jtbcMiniMessage extends HTMLElement {
  static get observedAttributes() {
    return ['timeout'];
  };

  push(message, callback = null) {
    this.messageId += 1;
    let newMessage = {
      'id': this.messageId,
      'message': message,
      'callback': callback,
    };
    this.messageQueue.push(newMessage);
    this.showMiniMessage();
    return this;
  };

  showMiniMessage() {
    if (this.locked == false)
    {
      this.locked = true;
      this.classList.add('on');
      this.container.classList.add('on');
      let msg = this.messageQueue.shift();
      let message = this.container.querySelector('.message');
      this.currentMessage = msg.message;
      this.currentMessageId = msg.id;
      this.currentCallback = msg.callback;
      message.innerText = this.currentMessage;
      message.classList.add('on');
      setTimeout(() => {
        message.classList.add('out');
      }, this.timeout);
      setTimeout(() => {
        message.classList.remove('on', 'out');
        if (this.currentCallback != null) this.currentCallback();
      }, this.timeout + 300);
      setTimeout(() => {
        this.locked = false;
        if (this.messageQueue.length != 0) this.showMiniMessage();
        else
        {
          this.classList.remove('on');
          this.container.classList.remove('on');
        };
      }, this.timeout + 600);
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'timeout':
      {
        let timeout = Number.parseInt(newVal);
        if (timeout < 1000) timeout = 1000;
        this.timeout = timeout;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
  };

  constructor() {
    super();
    this.ready = false;
    this.locked = false;
    this.timeout = 3000;
    this.messageId = 0;
    this.messageQueue = [];
    this.currentMessage = null;
    this.currentMessageId = 0;
    this.currentCallback = null;
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('.')) + '.css';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <container><span class="message"></span></container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.container = shadowRoot.querySelector('container');
  };
};