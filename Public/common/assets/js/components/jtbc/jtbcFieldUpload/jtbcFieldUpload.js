import uploader from '../../../library/upload/uploader.js';

export default class jtbcFieldUpload extends HTMLElement {
  static get observedAttributes() {
    return ['text-upload', 'action', 'value', 'disabled', 'placeholder', 'tail', 'width'];
  };

  #disabled = false;
  #uploading = false;
  #tail = null;

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = '';
    let container = this.container;
    let input = container.querySelector('input.fileurl');
    if (input.value != this.fileurl)
    {
      if (input.value.trim().length != 0)
      {
        result = JSON.stringify({'uploadid': 0, 'fileurl': input.value});
      };
    }
    else
    {
      result = JSON.stringify({'uploadid': this.uploadid, 'fileurl': this.fileurl});
    };
    return result;
  };

  get disabled() {
    return this.#disabled;
  };

  get uploading() {
    return this.#uploading;
  };

  get tail() {
    return this.#tail;
  };

  set value(value) {
    let container = this.container;
    let input = container.querySelector('input.fileurl');
    if (value.trim().length == 0)
    {
      input.value = '';
    }
    else
    {
      try
      {
        let content = JSON.parse(value);
        this.uploadid = content.uploadid;
        this.fileurl = content.fileurl;
        input.value = this.fileurl;
      }
      catch(e)
      {
        throw new Error('Unexpected value');
      };
    };
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    let container = this.container;
    let input = container.querySelector('input.fileurl');
    if (disabled == true)
    {
      container.classList.add('disabled');
      input.disabled = true;
    }
    else
    {
      container.classList.remove('disabled');
      input.disabled = true;
    };
  };

  set tail(tail) {
    this.#tail = tail;
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    container.querySelector('input.fileurl').addEventListener('focus', () => {
      container.classList.add('focus');
    });
    container.querySelector('input.fileurl').addEventListener('blur', () => {
      container.classList.remove('focus');
    });
    container.querySelector('button.upload').addEventListener('click', () => {
      if (this.disabled == false && this.uploading == false)
      {
        container.querySelector('input.file').click();
      };
    });
    container.querySelector('input.file').addEventListener('change', function(){
      let bar = container.querySelector('span.bar');
      let btn = container.querySelector('button.upload');
      let input = container.querySelector('input.fileurl');
      const resetStatus = () => {
        this.value = null;
        that.buttonTextReset();
        that.#uploading = false;
        bar.style.width = '100%';
        btn.classList.remove('locked');
      };
      if (!btn.classList.contains('locked') && this.files.length == 1)
      {
        that.#uploading = true;
        bar.style.width = '0%';
        btn.classList.add('locked');
        let currentUploader = new uploader(that.action);
        currentUploader.upload(this.files[0], percent => {
          btn.innerText = percent + '%';
          bar.style.width = percent + '%';
        }, data => {
          if (data.code == 1)
          {
            that.uploadid = data.param.uploadid;
            input.value = that.fileurl = data.param.fileurl + (that.tail ?? '');
          }
          else
          {
            let message = data.message;
            if (that.hasAttribute('whisper'))
            {
              if (that.miniMessage != null)
              {
                that.miniMessage.push(message);
              }
              else if (that.toast != null)
              {
                that.toast.showError(message);
              }
              else
              {
                window.alert(message);
              };
            }
            else
            {
              if (that.dialog != null)
              {
                that.dialog.alert(message);
              }
              else
              {
                window.alert(message);
              };
            };
          };
          resetStatus();
        }, target => {
          let errorMessage = target.status + String.fromCharCode(32) + target.statusText;
          if (that.dialog != null)
          {
            that.dialog.alert(errorMessage);
          }
          else
          {
            window.alert(errorMessage);
          };
          resetStatus();
        });
      };
    });
    container.querySelector('input.fileurl').addEventListener('dblclick', function(){
      if (that.imagePreviewer != null)
      {
        let fileurl = this.value;
        let originalFileurl = fileurl;
        if (fileurl.includes('?'))
        {
          fileurl = fileurl.substring(0, fileurl.lastIndexOf('?'));
        };
        if (fileurl.includes('.'))
        {
          let extension = fileurl.substring(fileurl.lastIndexOf('.') + 1);
          if (['jpg', 'jpeg', 'gif', 'png', 'svg', 'webp'].includes(extension))
          {
            that.imagePreviewer.popup({'fileurl': originalFileurl});
          };
        };
      };
    });
  };

  buttonTextReset() {
    this.container.querySelector('button.upload').innerText = this.textUpload;
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'text-upload':
      {
        this.textUpload = newVal;
        this.buttonTextReset();
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
      case 'placeholder':
      {
        this.container.querySelector('input.fileurl')?.setAttribute('placeholder', newVal);
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
    };
  };

  connectedCallback() {
    this.ready = true;
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none">
        <div class="border"></div>
        <div class="input"><span class="input"><input type="text" name="fileurl" class="fileurl" /></span><span class="btn"><span class="bar"></span><button class="upload">Upload</button><input type="file" class="file" /></span></div>
      </div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.action = null;
    this.uploadid = 0;
    this.fileurl = null;
    this.container = shadowRoot.querySelector('div.container');
    this.dialog = document.getElementById('dialog');
    this.toast = document.getElementById('toast');
    this.miniMessage = document.getElementById('miniMessage');
    this.imagePreviewer = document.getElementById('imagePreviewer');
    this.textUpload = 'Upload';
    this.#initEvents();
  };
};