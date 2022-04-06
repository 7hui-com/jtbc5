import uploader from '../../../library/upload/uploader.js';

export default class jtbcFieldAvatar extends HTMLElement {
  static get observedAttributes() {
    return ['text-upload', 'text-preview', 'text-remove', 'action', 'value', 'disabled'];
  };

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = '';
    let container = this.container;
    let inputUploadId = container.querySelector('input.uploadid');
    let inputFileUrl = container.querySelector('input.fileurl');
    if (inputFileUrl.value.trim().length != 0)
    {
      result = JSON.stringify({'uploadid': inputUploadId.value, 'fileurl': inputFileUrl.value});
    };
    return result;
  };

  get disabled() {
    return this.currentDisabled;
  };

  set value(value) {
    this.currentValue = value;
    let container = this.container;
    let inputUploadId = container.querySelector('input.uploadid');
    let inputFileUrl = container.querySelector('input.fileurl');
    if (this.currentValue.trim().length != 0)
    {
      let value = JSON.parse(this.currentValue);
      let avatar = container.querySelector('.avatar');
      inputUploadId.value = value.uploadid;
      inputFileUrl.value = value.fileurl;
      avatar.classList.add('uploaded');
      avatar.style.backgroundImage = 'url(' + value.fileurl + ')';
    };
  };

  set disabled(disabled) {
    this.currentDisabled = disabled;
    let container = this.container;
    if (disabled == true)
    {
      container.classList.add('disabled');
    }
    else
    {
      container.classList.remove('disabled');
    };
  };

  buttonTextReset() {
    let container = this.container;
    container.querySelectorAll('.textUpload').forEach(el => { el.setAttribute('title', this.textUpload); });
    container.querySelectorAll('.textPreview').forEach(el => { el.setAttribute('title', this.textPreview); });
    container.querySelectorAll('.textRemove').forEach(el => { el.setAttribute('title', this.textRemove); });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'text-upload':
      {
        this.textUpload = newVal;
        this.buttonTextReset();
        break;
      };
      case 'text-preview':
      {
        this.textPreview = newVal;
        this.buttonTextReset();
        break;
      };
      case 'text-remove':
      {
        this.textRemove = newVal;
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
    };
  };

  initEvents() {
    let that = this;
    let container = this.container;
    let dialog = document.getElementById('dialog');
    container.delegateEventListener('.upload', 'click', () => {
      if (this.currentDisabled == false && this.currentUploading == false)
      {
        container.querySelector('input.file').click();
      };
    });
    container.querySelector('input.file').addEventListener('change', function(){
      let avatar = container.querySelector('.avatar');
      let avatarUploading = avatar.querySelector('.uploading');
      let inputUploadId = container.querySelector('input.uploadid');
      let inputFileUrl = container.querySelector('input.fileurl');
      const resetStatus = () => {
        this.value = null;
        avatarUploading.style.width = '0%';
        avatar.classList.remove('uploading');
        that.currentUploading = false;
      };
      if (!avatar.classList.contains('uploading') && this.files.length == 1)
      {
        that.currentUploading = true;
        avatar.classList.remove('uploaded');
        avatar.classList.add('uploading');
        avatarUploading.style.width = '100%';
        let currentFile = this.files[0];
        let fileReader = new FileReader();
        fileReader.readAsDataURL(currentFile);
        fileReader.addEventListener('load', () => {
          avatar.style.backgroundImage = 'url(' + fileReader.result + ')';
          let currentUploader = new uploader(that.action);
          currentUploader.upload(currentFile, percent => {
            avatarUploading.style.width = (100 - percent) + '%';
          }, data => {
            if (data.code == 1)
            {
              inputUploadId.value = data.param.uploadid;
              inputFileUrl.value = data.param.fileurl;
              avatar.classList.add('uploaded');
            }
            else
            {
              if (dialog == null)
              {
                window.alert(data.message);
              }
              else
              {
                dialog.alert(data.message);
              };
            };
            resetStatus();
          }, target => {
            let errorMessage = target.status + ' ' + target.statusText;
            dialog != null? dialog.alert(errorMessage): window.alert(errorMessage);
            avatar.style.backgroundImage = 'none';
            resetStatus();
          });
        });
      };
    });
    container.querySelector('.preview').addEventListener('click', function(){
      if (that.imagePreviewer != null)
      {
        let fileurl = container.querySelector('input.fileurl').value;
        if (['.jpg','.gif','.png','.svg','.webp'].includes(fileurl.substring(fileurl.lastIndexOf('.'))))
        {
          that.imagePreviewer.popup({'fileurl': fileurl});
        };
      };
    });
    container.querySelector('.remove').addEventListener('click', function(){
      if (that.currentUploading != true)
      {
        let avatar = container.querySelector('.avatar');
        let inputUploadId = container.querySelector('input.uploadid');
        let inputFileUrl = container.querySelector('input.fileurl');
        inputUploadId.value = '';
        inputFileUrl.value = '';
        avatar.classList.remove('uploaded');
        avatar.style.backgroundImage = 'none';
      };
    });
  };

  connectedCallback() {
    this.ready = true;
  };

  constructor() {
    super();
    this.ready = false;
    this.action = null;
    this.textUpload = 'Upload';
    this.textPreview = 'Preview';
    this.textRemove = 'Remove';
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('.')) + '.css';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <container style="display:none">
        <div class="avatar">
          <div class="uploading"><input type="hidden" name="uploadid" class="uploadid" /><input type="hidden" name="fileurl" class="fileurl" /><input type="file" class="file" accept="image/jpeg,image/png,image/gif" /></div>
          <div class="pending"><icons><jtbc-svg name="camera" class="textUpload upload" title="${this.textUpload}"></jtbc-svg></icons></div>
          <div class="hover"><icons><jtbc-svg name="magnifier" class="textPreview preview" title="${this.textPreview}"></jtbc-svg><jtbc-svg name="camera" class="textUpload upload" title="${this.textUpload}"></jtbc-svg><jtbc-svg name="trash" class="textRemove remove" title="${this.textRemove}"></jtbc-svg></icons></div>
        </div>
        <div class="mask"></div>
      </container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.container = shadowRoot.querySelector('container');
    this.imagePreviewer = document.getElementById('imagePreviewer');
    this.currentValue = '';
    this.currentDisabled = false;
    this.currentUploading = false;
    this.initEvents();
  };
};