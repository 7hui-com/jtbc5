export default class jtbcErrorTips extends HTMLElement {
  static get observedAttributes() {
    return ['data', 'no_error_href', 'timeout'];
  };

  #data = null;
  #noErrorHref = null;
  #timeout = 5000;
  #timeoutHandler;

  get data() {
    return this.#data;
  };

  get noErrorHref() {
    return this.#noErrorHref;
  };

  get timeout() {
    return this.#timeout;
  };

  set data(data) {
    this.#data = data;
  };

  set noErrorHref(noErrorHref) {
    this.#noErrorHref = noErrorHref;
  };

  set timeout(timeout) {
    this.#timeout = Number.parseInt(timeout);
  };

  #initEvents() {
    let container = this.container;
    container.addEventListener('transitionend', function(){
      if (this.classList.contains('on') && this.classList.contains('out'))
      {
        this.classList.remove('on');
        this.classList.remove('out');
      };
    });
  };

  render() {
    clearTimeout(this.#timeoutHandler);
    if (this.data != null)
    {
      let noError = true;
      let noErrorAttr = this.getAttribute('no_error');
      let data = JSON.parse(this.data);
      let ul = document.createElement('ul');
      if (Array.isArray(data))
      {
        data.forEach(item => {
          let currentCode = Number.parseInt(item.code);
          let currentMessage = item.message;
          let li = document.createElement('li');
          li.setAttribute('code', currentCode);
          li.setAttribute('message', currentMessage);
          li.innerText = currentMessage;
          ul.append(li);
          if (currentCode != 1) noError = false;
        });
      };
      if (noError == true && noErrorAttr != 'silent')
      {
        let target = this.getTarget('no_error_target');
        if (this.noErrorHref == null)
        {
          target.reload();
        }
        else
        {
          target.href = this.noErrorHref;
        };
        this.dispatchEvent(new CustomEvent('noerror'));
      }
      else
      {
        this.container.classList.add('on');
        this.container.querySelector('ul').replaceWith(ul);
        this.scrollIntoView({'block': 'end', 'behavior': 'smooth'});
        this.#timeoutHandler = setTimeout(() => this.container.classList.add('out'), this.timeout);
      };
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'data':
      {
        this.data = newVal;
        this.render();
        break;
      };
      case 'no_error_href':
      {
        this.noErrorHref = newVal;
        break;
      };
      case 'timeout':
      {
        this.timeout = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#initEvents();
  };

  constructor() {
    super();
    this.ready = false;
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <container>
        <ul></ul>
      </container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.container = shadowRoot.querySelector('container');
  };
};