import uploader from '../../../library/upload/uploader.js';

export default class jtbcUploadProgress extends HTMLElement {
  static get observedAttributes() {
    return ['action'];
  };

  formatFileSize(filesize) {
    let result = filesize + 'B';
    if (filesize > 0)
    {
      let index = Math.floor(Math.log(filesize) / Math.log(1024));
      let sizename = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      result = Math.round(filesize / Math.pow(1024, index), 2).toString() + sizename[index];
    };
    return result;
  };

  prepareUpload(input) {
    let container = this.container;
    if (input.files.length >= 1)
    {
      let index = 0;
      let uploading = document.createElement('div');
      uploading.className = 'uploading';
      this.uploaded = {'total': 0, 'done': 0, 'error': 0};
      Array.from(input.files).forEach(file => {
        let item = document.createElement('item');
        let filename = document.createElement('filename');
        let filesize = document.createElement('filesize');
        let progressbar = document.createElement('progressbar');
        filename.innerText = file.name;
        filesize.innerText = this.formatFileSize(file.size);
        item.setAttribute('index', index);
        item.append(filename, filesize, progressbar);
        uploading.append(item);
        index += 1;
      });
      this.uploaded.total = index;
      container.querySelector('div.uploading').replaceWith(uploading);
    };
  };

  startUpload(input, itemDoneCallBack = () => {}, doneCallBack = () => {}, progressCallBack = () => {}) {
    let files = input.files;
    let container = this.container;
    if (files.length >= 1 && this.uploading != true)
    {
      let currentIndex = 0;
      this.uploading = true;
      this.prepareUpload(input);
      const uploadNextFile = () => {
        let currentUploader = new uploader(this.action);
        let item = container.querySelector("item[index='" + currentIndex + "']");
        currentUploader.upload(files[currentIndex], percent => {
          item.querySelector('progressbar').style.width = percent + '%';
          progressCallBack(currentIndex, percent);
        }, data => {
          itemDoneCallBack(currentIndex, data);
          item.querySelector('progressbar').style.width = '100%';
          if (data.code == 1)
          {
            item.remove();
            this.uploaded.done += 1;
          }
          else
          {
            item.classList.add('error');
            item.setAttribute('title', data.message);
            this.uploaded.error += 1;
          };
          currentIndex += 1;
          if (currentIndex < files.length)
          {
            uploadNextFile();
          }
          else
          {
            doneCallBack();
            input.value = null;
            this.uploading = false;
          };
        });
      };
      uploadNextFile();
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'action':
      {
        this.action = newVal;
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
    this.action = null;
    this.uploaded = {};
    this.uploading = false;
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('.')) + '.css';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"><div class="uploading"></div></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.container = shadowRoot.querySelector('div.container');
    this.container.delegateEventListener('item.error', 'dblclick', function(){ this.classList.add('out'); });
    this.container.delegateEventListener('item', 'transitionend', function(){ if (this.classList.contains('out')) this.remove(); });
  };
};