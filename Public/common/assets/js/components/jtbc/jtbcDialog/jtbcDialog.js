export default class jtbcDialog extends HTMLElement {
  static get observedAttributes() {
    return ['credentials', 'mustache', 'popup-movable', 'with-global-headers', 'text-ok', 'text-cancel'];
  };

  #url = null;
  #credentials = 'same-origin';
  #mustache = null;
  #popupMovable = true;
  #credentialsList = ['include', 'same-origin', 'omit'];
  #withGlobalHeaders = null;

  get credentials() {
    return this.#credentials;
  };

  get mustache() {
    return this.#mustache;
  };

  get url() {
    return this.#url;
  };

  get popupMovable() {
    return this.#popupMovable;
  };

  set credentials(credentials) {
    if (this.#credentialsList.includes(credentials))
    {
      this.#credentials = credentials;
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  set mustache(mustache) {
    this.#mustache = mustache;
  };

  set popupMovable(popupMovable) {
    let target = this.container.querySelector('.popup');
    if (popupMovable === 'false')
    {
      this.#popupMovable = false;
      target.classList.remove('movable');
    }
    else
    {
      this.#popupMovable = true;
      target.classList.add('movable');
    };
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
      this.#url = new URL(href, document.baseURI);
      fetch(href, this.#getFetchParams()).then(res => res.ok? res.text(): '').then(text => {
        let code, fragment = null;
        if (text.startsWith('{'))
        {
          try
          {
            let content = JSON.parse(text);
            code = Number.parseInt(content.code);
            fragment = content.hasOwnProperty('fragment')? content.fragment: null;
          }
          catch(e) {};
        }
        else if (text.startsWith('<'))
        {
          let parser = new DOMParser();
          let dom = parser.parseFromString(text, 'text/xml');
          let fel = dom.querySelector('xml>fragment');
          code = Number.parseInt(dom.querySelector('xml')?.getAttribute('code'));
          fragment = (fel != null)? fel.textContent: null;
        };
        if (code == 1)
        {
          if (this.mustache != null)
          {
            let params = this.getAttributes(this.mustache);
            Object.keys(params).forEach(key => {
              fragment = fragment.replaceAll('{{' + key + '}}', params[key]);
            });
          };
          this.popup(fragment);
        };
      });
    };
  };

  #getFetchParams() {
    let withGlobalHeaders = this.#withGlobalHeaders;
    let result = {'method': 'get', 'credentials': this.#credentials};
    if (withGlobalHeaders != null)
    {
      let broadcaster = getBroadcaster('fetch');
      let state = broadcaster.getState();
      if (state.hasOwnProperty(withGlobalHeaders))
      {
        result.headers = state[withGlobalHeaders];
      };
    };
    return result;
  };

  #initEvents() {
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
    container.delegateEventListener('.dialog_fullpage', 'transitionend', function() {
      if (!this.classList.contains('on'))
      {
        this.querySelector('.fullpage').html('');
      }
      else
      {
        document.documentElement.style.overflow = 'hidden';
      };
    });
    if (isTouchDevice())
    {
      container.delegateEventListener('.dialog.popup.movable div.title', 'touchstart', function(e) {
        e.preventDefault();
        if (e.touches.length == 1)
        {
          let el = this;
          let target = container.querySelector('.popup');
          const move = function(e) {
            let targetX = (el.translateX ?? 0) + e.touches[0].screenX - el.startPosition.x;
            let targetY = (el.translateY ?? 0) + e.touches[0].screenY - el.startPosition.y;
            target.translateX = targetX;
            target.translateY = targetY;
            target.style.marginLeft = (targetX * 2) + 'px';
            target.style.marginTop = (targetY * 2) + 'px';
          };
          const stop = function(e) {
            target.classList.remove('moving');
            el.translateX = target.translateX;
            el.translateY = target.translateY;
            document.removeEventListener('touchmove', move);
            document.removeEventListener('touchend', stop);
          };
          target.classList.add('moving');
          el.startPosition = {'x': e.touches[0].screenX, 'y': e.touches[0].screenY};
          document.addEventListener('touchmove', move);
          document.addEventListener('touchend', stop);
        };
      });
    }
    else
    {
      container.delegateEventListener('.dialog.popup.movable div.title', 'mousedown', function(e) {
        e.preventDefault();
        let el = this;
        let target = container.querySelector('.popup');
        const move = function(e) {
          let targetX = (el.translateX ?? 0) + e.screenX - el.startPosition.x;
          let targetY = (el.translateY ?? 0) + e.screenY - el.startPosition.y;
          target.translateX = targetX;
          target.translateY = targetY;
          target.style.marginLeft = (targetX * 2) + 'px';
          target.style.marginTop = (targetY * 2) + 'px';
        };
        const stop = function(e) {
          target.classList.remove('moving');
          el.translateX = target.translateX;
          el.translateY = target.translateY;
          document.removeEventListener('mousemove', move);
          document.removeEventListener('mouseup', stop);
        };
        target.classList.add('moving');
        el.startPosition = {'x': e.screenX, 'y': e.screenY};
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', stop);
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
      let link = dialog.querySelector('.link').empty();
      this.classList.add('on');
      this.container.classList.add('on');
      dialog.querySelector('.text').innerText = message;
      if (textOk != null) dialog.querySelector('button.ok').innerText = textOk;
      if (linkURL != null)
      {
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
    let res = await fetch(url, this.#getFetchParams());
    if (res.ok)
    {
      let code, fragment = null;
      let text = await res.text();
      if (text.startsWith('{'))
      {
        try
        {
          let content = JSON.parse(text);
          code = Number.parseInt(content.code);
          fragment = content.hasOwnProperty('fragment')? content.fragment: null;
        }
        catch(e) {};
      }
      else if (text.startsWith('<'))
      {
        let parser = new DOMParser();
        let dom = parser.parseFromString(text, 'text/xml');
        let fel = dom.querySelector('xml>fragment');
        code = Number.parseInt(dom.querySelector('xml')?.getAttribute('code'));
        fragment = (fel != null)? fel.textContent: null;
      };
      if (code == 1)
      {
        if (this.mustache != null)
        {
          let params = this.getAttributes(this.mustache);
          Object.keys(params).forEach(key => {
            fragment = fragment.replaceAll('{{' + key + '}}', params[key]);
          });
        };
        return this.popup(fragment, callback);
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
            el.removeAttribute('style');
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

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'credentials':
      {
        this.credentials = newVal;
        break;
      };
      case 'mustache':
      {
        this.mustache = newVal;
        break;
      };
      case 'popup-movable':
      {
        this.popupMovable = newVal;
        break;
      };
      case 'with-global-headers':
      {
        this.#withGlobalHeaders = newVal;
        break;
      };
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
    this.#initEvents();
  };

  constructor() {
    super();
    let pluginCss = this.getAttribute('plugin_css');
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
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
          <div class="popup dialog movable">
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
    this.container.loadComponents();
  };
};