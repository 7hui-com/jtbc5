export default class jtbcFieldGallery extends HTMLElement {
  static get observedAttributes() {
    return ['text', 'mode', 'action', 'value', 'disabled', 'width'];
  };

  get name() {
    return this.getAttribute('name');
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
    return this.currentDisabled;
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
    if (disabled == true)
    {
      this.container.classList.add('disabled');
    }
    else
    {
      this.container.classList.remove('disabled');
    };
    this.currentDisabled = disabled;
  };

  addUploadedItem(param) {
    let mainEl = this.container.querySelector('div.main');
    let button = mainEl.querySelector('div.button');
    if (button != null)
    {
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

  initEvents() {
    let that = this;
    let container = this.container;
    let mainEl = this.container.querySelector('div.main');
    let progress = container.querySelector('.progress');
    container.delegateEventListener('div.add', 'click', function(){
      this.querySelector('input.file').click();
    });
    container.querySelector('input.file').addEventListener('change', function(){
      if (that.currentUploading != true)
      {
        that.currentUploading = true;
        progress.startUpload(this, (index, data) => {
          if (data.code == 1) that.addUploadedItem(data.param);
        }, () => { that.currentUploading = false; });
      };
    });
    container.delegateEventListener('div.item', 'dragstart', function(){
      that.draging = this;
      this.classList.add('draging');
      mainEl.classList.add('draging');
    });
    container.delegateEventListener('div.item', 'dragend', function(){
      mainEl.classList.remove('draging');
      that.draging.classList.remove('draging');
      that.querySelectorAll('div.item[draggable=true]').forEach(el => {
        el.draggable = false;
      });
    });
    container.delegateEventListener('div.item', 'dragover', function(e){
      e.preventDefault();
      let target = this;
      let draging = that.draging;
      if (draging != null && target != draging && !target.classList.contains('button'))
      {
        if (draging.index() < target.index())
        {
          target.after(draging);
        }
        else
        {
          target.before(draging);
        };
      };
    });
    container.delegateEventListener('div.item', 'mousedown', function(){
      if (!this.classList.contains('button'))
      {
        this.draggable = true;
      };
    });
    container.delegateEventListener('.textPreview', 'click', function(){
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
    container.delegateEventListener('.textRemove', 'click', function(){
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
    container.delegateEventListener('.textRemove', 'remove', function(){
      let uploadid = this.getAttribute('uploadid');
      let item = container.querySelector('.item-' + uploadid);
      if (item != null)
      {
        item.remove();
      };
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
        let modes = ['square', 'horizontal', 'vertical'];
        if (modes.includes(newVal))
        {
          this.currentMode = newVal;
          modes.forEach(mode => {
            if (this.currentMode == mode)
            {
              this.container.classList.add(mode);
            }
            else
            {
              this.container.classList.remove(mode);
            };
          });
        };
        break;
      };
      case 'action':
      {
        this.action = this.currentAction = newVal;
        break;
      };
      case 'value':
      {
        this.value = this.currentValue = newVal;
        break;
      };
      case 'disabled':
      {
        this.disabled = this.hasAttribute('disabled')? true: false;
        break;
      };
      case 'width':
      {
        this.style.width = isFinite(newVal)? newVal + 'px': newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
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
    let importCssUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('.')) + '.css';
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
    this.currentMode = 'square';
    this.currentDisabled = false;
    this.currentUploading = false;
    this.currentValue = null;
    this.currentAction = null;
    this.container = shadowRoot.querySelector('container');
    this.dialog = document.getElementById('dialog');
    this.imagePreviewer = document.getElementById('imagePreviewer');
    this.container.loadComponents().then(() => { this.initEvents(); });
  };
};