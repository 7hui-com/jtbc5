export default class jtbcDialog extends HTMLElement {
  static get observedAttributes() {
    return ['text-ok', 'text-cancel'];
  };

  set href(href) {
    if (this.locked)
    {
      this.close().then(() => {
        this.href = href;
      });
    }
    else
    {
      fetch(href).then(res => res.ok? res.json(): {}).then(data => {
        if (Number.isInteger(data.code))
        {
          if (data.code == 1)
          {
            this.popup(data.fragment);
          };
        };
      });
    };
  };

  alert(message, callback, textOk = null, linkURL = null) {
    if (this.locked)
    {
      this.close().then(() => {
        this.alert(message, callback, textOk, linkURL);
      });
    }
    else
    {
      this.locked = true;
      let dialog = this.container.querySelector('.alert');
      this.classList.add('on');
      this.container.classList.add('on');
      dialog.querySelector('.text').innerText = message;
      if (textOk != null) dialog.querySelector('button.ok').innerText = textOk;
      if (linkURL != null)
      {
        let link = dialog.querySelector('.link');
        let anchor = document.createElement('a');
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('href', linkURL);
        anchor.innerText = linkURL;
        link.classList.add('on');
        link.innerHTML = anchor.outerHTML;
      };
      dialog.classList.add('on');
      dialog.parentNode.classList.add('on');
      this.callback = callback;
    };
  };

  confirm(message, callback, textOk = null, textCancel = null) {
    if (this.locked)
    {
      this.close().then(() => {
        this.confirm(message, callback, textOk, textCancel);
      });
    }
    else
    {
      this.locked = true;
      let dialog = this.container.querySelector('.confirm');
      this.classList.add('on');
      this.container.classList.add('on');
      dialog.querySelector('.text').innerText = message;
      if (textOk != null) dialog.querySelector('button.ok').innerText = textOk;
      if (textCancel != null) dialog.querySelector('button.cancel').innerText = textCancel;
      dialog.classList.add('on');
      dialog.parentNode.classList.add('on');
      this.callback = callback;
    };
  };

  async popup(html, callback) {
    if (this.locked)
    {
      this.close().then(() => {
        return this.popup(html, callback);
      });
    }
    else
    {
      this.locked = true;
      let dialog = this.container.querySelector('.popup');
      await dialog.querySelector('.content').html(html);
      this.classList.add('on');
      this.container.classList.add('on');
      dialog.classList.add('on');
      dialog.parentNode.classList.add('on');
      if (dialog.querySelectorAll('div.title').length == 0)
      {
        dialog.querySelector('span.close').classList.add('withMask');
      }
      else
      {
        dialog.querySelector('span.close').classList.remove('withMask');
      };
      this.callback = callback;
      return this;
    };
  };

  async open(url, callback) {
    let res = await fetch(url);
    if (res.ok)
    {
      let data = await res.json();
      if (data.code == 1)
      {
        return this.popup(data.fragment, callback);
      };
    };
  };

  async fullpage(html, showExitButton = false) {
    let result = null;
    if (this.classList.contains('on') && this.container.classList.contains('on'))
    {
      let dialogFullpage = this.container.querySelector('.dialog_fullpage');
      if (showExitButton == true)
      {
        dialogFullpage.querySelector('span.exit').classList.add('valid');
      }
      else
      {
        dialogFullpage.querySelector('span.exit').classList.remove('valid');
      };
      result = await dialogFullpage.querySelector('.fullpage').html(html);
      dialogFullpage.classList.add('on');
    };
    return result;
  };

  close() {
    if (this.locked)
    {
      return new Promise((resolve) => {
        this.container.querySelectorAll('.dialog').forEach(el => {
          if (el.classList.contains('on')) el.classList.add('out');
        });
        setTimeout(() => { this.container.classList.remove('on'); }, 200);
        setTimeout(() => {
          this.buttonTextReset();
          this.classList.remove('on');
          this.container.querySelectorAll('.dialog').forEach(el => {
            el.classList.remove('on', 'out');
            if (el.classList.contains('popup'))
            {
              let emptyContentEl = document.createElement('div');
              emptyContentEl.classList.add('content');
              el.querySelector('div.content').replaceWith(emptyContentEl);
            };
            let link = el.querySelector('.link');
            if (link != null) link.classList.remove('on');
          });
          this.container.querySelectorAll('jtbc-svg[name=close]').forEach(el => {
            el.removeAttribute('class');
          });
          this.container.querySelectorAll('.dialog_item').forEach(el => {
            el.classList.remove('on');
          });
          this.callback = null;
          this.callbackArgs = [];
          this.locked = false;
          resolve(this);
        }, 400);
      });
    }
    else
    {
      return new Promise((resolve) => { resolve(this); });
    };
  };

  querySelector(...args) {
    return this.container.querySelector(...args);
  };

  querySelectorAll(...args) {
    return this.container.querySelectorAll(...args);
  };

  buttonTextReset() {
    this.container.querySelectorAll('button.ok').forEach(el => { el.innerText = this.textOk; });
    this.container.querySelectorAll('button.cancel').forEach(el => { el.innerText = this.textCancel; });
  };

  initEvents() {
    let container = this.container;
    container.querySelectorAll('div.dialog_item').forEach(el => {
      el.addEventListener('dblclick', e => {
        if (el == e.target)
        {
          this.close();
        };
      });
    });
    container.delegateEventListener('button.ok', 'click', () => {
      if (this.callback != null)
      {
        if (this.callbackArgs.length == 0)
        {
          this.callback();
        }
        else
        {
          this.callback(...this.callbackArgs);
        };
      };
      this.close();
    });
    container.delegateEventListener('button.cancel', 'click', () => { this.close(); });
    container.delegateEventListener('[role=dialog-close]', 'click', () => { this.close(); });
    container.delegateEventListener('[role=dialog-fullpage-exit', 'click', () => {
      document.documentElement.style.overflow = null;
      container.querySelector('.dialog_fullpage').classList.remove('on');
    });
    container.delegateEventListener('.dialog_fullpage', 'transitionend', function(){
      if (!this.classList.contains('on'))
      {
        this.querySelector('.fullpage').html('');
      }
      else
      {
        document.documentElement.style.overflow = 'hidden';
      };
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'text-ok':
      {
        this.textOk = newVal;
        this.buttonTextReset();
        break;
      };
      case 'text-cancel':
      {
        this.textCancel = newVal;
        this.buttonTextReset();
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
  };

  constructor() {
    super();
    let pluginCss = this.getAttribute('plugin_css');
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('.')) + '.css';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <container style="display:none">
        <div class="dialog_item">
          <div class="alert dialog">
            <div class="content">
              <div class="icon"><jtbc-svg name="alert"></jtbc></div>
              <div class="text"></div>
              <div class="link"></div>
              <div class="buttons"><button class="ok">OK</button></div>
            </div>
          </div>
        </div>
        <div class="dialog_item">
          <div class="confirm dialog">
            <div class="content">
              <div class="icon"><jtbc-svg name="alert"></jtbc></div>
              <div class="text"></div>
              <div class="buttons"><button class="ok">OK</button><button class="cancel">Cancel</button></div>
            </div>
          </div>
        </div>
        <div class="dialog_item">
          <div class="popup dialog">
            <span class="close" role="dialog-close"><jtbc-svg name="close"></jtbc-svg></span>
            <div class="content"></div>
          </div>
        </div>
        <div class="dialog_fullpage">
          <span class="exit" role="dialog-fullpage-exit"><jtbc-svg name="close"></jtbc-svg></span>
          <div class="fullpage"></div>
        </div>
      </container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.locked = false;
    this.callback = null;
    this.callbackArgs = [];
    this.textOk = 'OK';
    this.textCancel = 'Cancel';
    this.container = shadowRoot.querySelector('container');
    if (pluginCss != null)
    {
      let pluginStyle = document.createElement('link');
      pluginStyle.setAttribute('type', 'text/css');
      pluginStyle.setAttribute('rel', 'stylesheet');
      pluginStyle.setAttribute('href', pluginCss);
      shadowRoot.insertBefore(pluginStyle, this.container);
    };
    Array.from(shadowRoot.children).forEach(el => { el.loadComponents(); });
    this.initEvents();
  };
};