import uploader from '../../../library/upload/uploader.js';

export default class jtbcFieldUpload extends HTMLElement {
  static get observedAttributes() {
    return ['text-upload', 'action', 'value', 'disabled', 'placeholder', 'width'];
  };

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
    return this.currentDisabled;
  };

  set value(value) {
    this.currentValue = value;
    let container = this.container;
    let input = container.querySelector('input.fileurl');
    if (this.currentValue.trim() == '')
    {
      input.value = '';
    }
    else
    {
      let value = JSON.parse(this.currentValue);
      this.uploadid = value.uploadid;
      this.fileurl = value.fileurl;
      input.value = this.fileurl;
    };
  };

  set disabled(disabled) {
    this.currentDisabled = disabled;
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

  buttonTextReset() {
    let container = this.container;
    container.querySelector('button.upload').innerText = this.textUpload;
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
      case 'width':
      {
        this.style.width = isFinite(newVal)? newVal + 'px': newVal;
        break;
      };
    };
  };

  initEvents() {
    let that = this;
    let container = this.container;
    let dialog = document.getElementById('dialog');
    let miniMessage = document.getElementById('miniMessage');
    container.querySelector('input.fileurl').addEventListener('focus', () => {
      container.classList.add('focus');
    });
    container.querySelector('input.fileurl').addEventListener('blur', () => {
      container.classList.remove('focus');
    });
    container.querySelector('button.upload').addEventListener('click', () => {
      if (this.currentDisabled == false && this.currentUploading == false)
      {
        container.querySelector('input.file').click();
      };
    });
    container.querySelector('input.file').addEventListener('change', function(){
      let bar = container.querySelector('span.bar');
      let btn = container.querySelector('button.upload');
      let input = container.querySelector('input.fileurl');
      if (!btn.classList.contains('locked') && this.files.length == 1)
      {
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
            input.value = that.fileurl = data.param.fileurl;
          }
          else
          {
            this.value = null;
            if (that.hasAttribute('whisper') && miniMessage != null)
            {
              miniMessage.push(data.message);
            }
            else if (dialog != null)
            {
              dialog.alert(data.message);
            }
            else
            {
              window.alert(data.message);
            };
          };
          that.buttonTextReset();
          bar.style.width = '100%';
          btn.classList.remove('locked');
        }, target => {
          let errorMessage = target.status + ' ' + target.statusText;
          dialog != null? dialog.alert(errorMessage): window.alert(errorMessage);
          that.buttonTextReset();
          bar.style.width = '100%';
          btn.classList.remove('locked');
        });
      };
    });
    container.querySelector('input.fileurl').addEventListener('dblclick', function(){
      if (that.imagePreviewer != null)
      {
        let fileurl = this.value;
        if (['.jpg','.gif','.png','.svg','.webp'].includes(fileurl.substring(fileurl.lastIndexOf('.'))))
        {
          that.imagePreviewer.popup({'fileurl': fileurl});
        };
      };
    });
  };

  connectedCallback() {
    this.ready = true;
  };

  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('.')) + '.css';
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
    this.imagePreviewer = document.getElementById('imagePreviewer');
    this.currentValue = '';
    this.currentDisabled = false;
    this.currentUploading = false;
    this.textUpload = 'Upload';
    this.initEvents();
  };
};