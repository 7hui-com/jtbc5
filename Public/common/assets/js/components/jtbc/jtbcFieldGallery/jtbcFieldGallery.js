export default class jtbcFieldGallery extends HTMLElement {
  static get observedAttributes() {
    return ['text', 'mode', 'action', 'value', 'disabled', 'tail', 'width', 'with-global-headers'];
  };

  #mode = 'square';
  #disabled = false;
  #uploading = false;
  #tail = null;
  #withGlobalHeaders = null;

  get name() {
    return this.getAttribute('name');
  };

  get mode() {
    return this.#mode;
  };

  get uploading() {
    return this.#uploading;
  };

  get value() {
    let result = '';
    let value = [];
    let container = this.container;
    container.querySelectorAll('div.item').forEach(el => {
      if (!el.classList.contains('button'))
      {
        value.push(JSON.parse(el.getAttribute('param')));
      };
    });
    if (value.length != 0)
    {
      result = JSON.stringify(value);
    };
    return result;
  };

  get disabled() {
    return this.#disabled;
  };

  get tail() {
    return this.#tail;
  };

  get withGlobalHeaders() {
    return this.#withGlobalHeaders;
  };

  set mode(mode) {
    let modeList = ['square', 'horizontal', 'vertical'];
    if (modeList.includes(mode))
    {
      this.#mode = mode;
      modeList.forEach(item => {
        if (this.mode == item)
        {
          this.container.classList.add(item);
        }
        else
        {
          this.container.classList.remove(item);
        };
      });
    };
  };

  set value(value) {
    let container = this.container;
    let params = value? JSON.parse(value): [];
    if (Array.isArray(params))
    {
      container.querySelectorAll('div.item').forEach(el => {
        if (!el.classList.contains('button'))
        {
          el.remove();
        }
      });
      params.forEach(param => { this.addUploadedItem(param); });
    };
  };

  set action(action) {
    this.container.querySelector('.progress')?.setAttribute('action', action);
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  set tail(tail) {
    this.#tail = tail;
  };

  set withGlobalHeaders(withGlobalHeaders) {
    this.#withGlobalHeaders = withGlobalHeaders;
    this.container.querySelectorAll('jtbc-upload-progress').forEach(el => {
      el.setAttribute('with-global-headers', withGlobalHeaders);
    });
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    let mainEl = this.container.querySelector('div.main');
    let progress = container.querySelector('.progress');
    const draging = (x, y) => {
      that.draging.parentNode.querySelectorAll('div.item').forEach(item => {
        if (item != that.draging && !item.classList.contains('button'))
        {
          let bcr = item.getBoundingClientRect();
          if (x > bcr.left && x < (bcr.left + bcr.width) && y > bcr.top && y < (bcr.top + bcr.height))
          {
            if (that.draging.index() < item.index())
            {
              item.after(that.draging);
            }
            else
            {
              item.before(that.draging);
            };
          };
        };
      });
    };
    container.delegateEventListener('div.add', 'click', function() {
      this.querySelector('input.file').click();
    });
    container.querySelector('input.file').addEventListener('change', function() {
      if (that.uploading != true)
      {
        that.#uploading = true;
        progress.startUpload(this, (index, data) => {
          if (data.code == 1)
          {
            that.addUploadedItem(data.param, that.tail);
          };
        }, () => { that.#uploading = false; });
      };
    });
    container.delegateEventListener('.textPreview', 'click', function() {
      let uploadid = this.getAttribute('uploadid');
      let item = container.querySelector('.item-' + uploadid);
      if (item != null && item.hasAttribute('param'))
      {
        let param = JSON.parse(item.getAttribute('param'));
        if (param.filegroup == 1)
        {
          imagePreviewer.popup(param);
        };
      };
    });
    container.delegateEventListener('.textRemove', 'click', function() {
      if (that.dialog != null)
      {
        that.dialog.confirm(that.text.removeTips, () => {
          this.dispatchEvent(new CustomEvent('remove', {bubbles: true}));
        });
      }
      else
      {
        if (window.confirm(that.text.removeTips))
        {
          this.dispatchEvent(new CustomEvent('remove', {bubbles: true}));
        };
      };
    });
    container.delegateEventListener('.textRemove', 'remove', function() {
      let uploadid = this.getAttribute('uploadid');
      let item = container.querySelector('.item-' + uploadid);
      if (item != null)
      {
        item.remove();
      };
    });
    if (isTouchDevice())
    {
      container.delegateEventListener('div.item', 'touchstart', function(e) {
        if (!this.classList.contains('button') && e.target.classList.contains('hover'))
        {
          e.preventDefault();
          if (e.touches.length == 1)
          {
            that.draging = this;
            mainEl.classList.add('draging');
            that.draging.classList.add('draging');
            let drag = e => {
              draging(e.touches[0].clientX, e.touches[0].clientY);
            };
            let stop = function(e) {
              mainEl.classList.remove('draging');
              that.draging.classList.remove('draging');
              document.removeEventListener('touchmove', drag);
              document.removeEventListener('touchend', stop);
            };
            document.addEventListener('touchmove', drag);
            document.addEventListener('touchend', stop);
          };
        };
      });
    }
    else
    {
      container.delegateEventListener('div.item', 'mousedown', function(e) {
        if (!this.classList.contains('button') && e.target.classList.contains('hover'))
        {
          e.preventDefault();
          that.draging = this;
          mainEl.classList.add('draging');
          that.draging.classList.add('draging');
          let drag = e => {
            draging(e.clientX, e.clientY);
          };
          let stop = function(e) {
            mainEl.classList.remove('draging');
            that.draging.classList.remove('draging');
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stop);
          };
          document.addEventListener('mousemove', drag);
          document.addEventListener('mouseup', stop);
        };
      });
    };
  };

  addUploadedItem(param, tail = null) {
    let mainEl = this.container.querySelector('div.main');
    let button = mainEl.querySelector('div.button');
    if (button != null)
    {
      if (tail != null)
      {
        param.fileurl = param.fileurl + (tail ?? '');
      };
      let newItem = document.createElement('div');
      let newImage = document.createElement('div');
      newItem.classList.add('item');
      newItem.classList.add('item-' + param.uploadid);
      newItem.setAttribute('param', JSON.stringify(param));
      newImage.classList.add('image');
      newImage.style.backgroundImage = 'url(' + param.fileurl + ')';
      newImage.innerHTML = '<div class="hover"><icons><jtbc-svg name="magnifier" class="textPreview"></jtbc-svg><jtbc-svg name="trash" class="textRemove"></jtbc-svg></icons></div>';
      newImage.querySelectorAll('jtbc-svg').forEach(el => { el.setAttribute('uploadid', param.uploadid); });
      newItem.append(newImage);
      mainEl.insertBefore(newItem, button);
      this.textReset();
    };
  };

  textReset() {
    let text = this.text;
    let container = this.container;
    container.querySelectorAll('.textAdd').forEach(el => {
      el.setAttribute('title', text.add);
    });
    container.querySelectorAll('.textPreview').forEach(el => {
      el.setAttribute('title', text.preview);
    });
    container.querySelectorAll('.textRemove').forEach(el => {
      el.setAttribute('title', text.remove);
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'text':
      {
        this.text = JSON.parse(newVal);
        this.textReset();
        break;
      };
      case 'mode':
      {
        this.mode = newVal;
        break;
      };
      case 'action':
      {
        this.action = newVal;
        break;
      };
      case 'value':
      {
        this.value = newVal;
        break;
      };
      case 'disabled':
      {
        this.disabled = this.hasAttribute('disabled')? true: false;
        break;
      };
      case 'tail':
      {
        this.tail = newVal;
        break;
      };
      case 'width':
      {
        this.style.width = isFinite(newVal)? newVal + 'px': newVal;
        break;
      };
      case 'with-global-headers':
      {
        this.withGlobalHeaders = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.#initEvents();
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    this.text = {
      'add': 'Add',
      'preview': 'Preview',
      'remove': 'Remove',
      'removeTips': 'Are you sure to remove?',
    };
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <container style="display:none">
        <div class="main">
          <div class="item button"><div class="add textAdd" title="${this.text.add}"><jtbc-svg name="add"><input type="file" class="file" multiple="multiple" /></jtbc-svg></div></div>
        </div>
        <jtbc-upload-progress class="progress"></jtbc-upload-progress>
        <div class="mask"></div>
      </container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.draging = null;
    this.container = shadowRoot.querySelector('container');
    this.dialog = document.getElementById('dialog');
    this.imagePreviewer = document.getElementById('imagePreviewer');
    this.container.loadComponents();
  };
};