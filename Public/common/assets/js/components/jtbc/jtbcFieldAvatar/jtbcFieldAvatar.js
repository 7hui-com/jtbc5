import uploader from '../../../library/upload/uploader.js';

export default class jtbcFieldAvatar extends HTMLElement {
  static get observedAttributes() {
    return ['text-upload', 'text-preview', 'text-remove', 'action', 'value', 'disabled', 'tail', 'with-global-headers'];
  };

  #disabled = false;
  #uploading = false;
  #tail = null;
  #withGlobalHeaders = null;

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
      result = JSON.stringify({'uploadid': Number.parseInt(inputUploadId.value), 'fileurl': inputFileUrl.value});
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
    let avatar = container.querySelector('.avatar');
    let inputUploadId = container.querySelector('input.uploadid');
    let inputFileUrl = container.querySelector('input.fileurl');
    if (value.trim().length == 0)
    {
      inputUploadId.value = '';
      inputFileUrl.value = '';
      avatar.classList.remove('uploaded');
      avatar.style.backgroundImage = 'none';
    }
    else
    {
      try
      {
        let content = JSON.parse(value);
        inputUploadId.value = content.uploadid;
        inputFileUrl.value = content.fileurl;
        avatar.classList.add('uploaded');
        avatar.style.backgroundImage = 'url(' + content.fileurl + ')';
      }
      catch(e)
      {
        throw new Error('Unexpected value');
      };
    };
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  set tail(tail) {
    this.#tail = tail;
  };

  #initEvents() {
    let that = this;
    let container = this.container;
    let withGlobalHeaders = this.#withGlobalHeaders;
    container.delegateEventListener('.upload', 'click', () => {
      if (this.disabled == false && this.uploading == false)
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
        that.#uploading = false;
      };
      if (!avatar.classList.contains('uploading') && this.files.length == 1)
      {
        that.#uploading = true;
        avatar.classList.remove('uploaded');
        avatar.classList.add('uploading');
        avatarUploading.style.width = '100%';
        let currentFile = this.files[0];
        let fileReader = new FileReader();
        fileReader.readAsDataURL(currentFile);
        fileReader.addEventListener('load', () => {
          avatar.style.backgroundImage = 'url(' + fileReader.result + ')';
          let currentUploader = new uploader(that.action);
          if (withGlobalHeaders != null)
          {
            let broadcaster = getBroadcaster('fetch');
            let state = broadcaster.getState();
            if (state.hasOwnProperty(withGlobalHeaders))
            {
              currentUploader.setHeaders(state[withGlobalHeaders]);
            };
          };
          currentUploader.upload(currentFile, percent => {
            avatarUploading.style.width = (100 - percent) + '%';
          }, data => {
            if (data.code == 1)
            {
              avatar.classList.add('uploaded');
              inputUploadId.value = data.param.uploadid;
              inputFileUrl.value = data.param.fileurl + (that.tail ?? '');
              avatar.style.backgroundImage = 'url(' + inputFileUrl.value + ')';
            }
            else
            {
              let message = data.message;
              if (that.dialog != null)
              {
                that.dialog.alert(message);
              }
              else
              {
                window.alert(message);
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
    container.querySelector('.remove').addEventListener('click', function(){
      if (that.uploading != true)
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
      case 'tail':
      {
        this.tail = newVal;
        break;
      };
      case 'with-global-headers':
      {
        this.#withGlobalHeaders = newVal;
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
    this.ready = false;
    this.action = null;
    this.textUpload = 'Upload';
    this.textPreview = 'Preview';
    this.textRemove = 'Remove';
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
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
    this.dialog = document.getElementById('dialog');
    this.imagePreviewer = document.getElementById('imagePreviewer');
  };
};