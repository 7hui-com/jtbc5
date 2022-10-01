export default class jtbcErrorTips extends HTMLElement {
  static get observedAttributes() {
    return ['data', 'no_error_href'];
  };

  render() {
    if (this.currentData != null)
    {
      let noError = true;
      let noErrorAttr = this.getAttribute('no_error');
      let data = JSON.parse(this.currentData);
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
        if (this.currentNoErrorHref == null)
        {
          target.reload();
        }
        else
        {
          target.href = this.currentNoErrorHref;
        };
        this.dispatchEvent(new CustomEvent('noerror'));
      }
      else
      {
        this.classList.add('on');
        this.container.querySelector('ul').replaceWith(ul);
        this.scrollIntoView({block: 'end', behavior: 'smooth'});
      };
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'data':
      {
        this.currentData = newVal;
        this.render();
        break;
      };
      case 'no_error_href':
      {
        this.currentNoErrorHref = newVal;
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
    this.currentData = null;
    this.currentNoErrorHref = null;
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