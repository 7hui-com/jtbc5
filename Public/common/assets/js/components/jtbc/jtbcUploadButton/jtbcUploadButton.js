import uploader from '../../../library/upload/uploader.js';

export default class jtbcUploadButton extends HTMLButtonElement {
  static get observedAttributes() {
    return ['accept', 'with-global-headers'];
  };

  #withGlobalHeaders = null;

  #initEvents() {
    let that = this;
    let dialog = document.getElementById('dialog');
    let withGlobalHeaders = this.#withGlobalHeaders;
    this.addEventListener('click', function(){ this.inputFile.click(); });
    this.inputFile.addEventListener('change', function(){
      const resetStatus = () => {
        this.value = null;
        that.classList.remove('locked');
        that.innerText = that.getAttribute('text');
      };
      if (!that.classList.contains('locked') && this.files.length == 1)
      {
        that.classList.add('locked');
        that.setAttribute('text', that.innerText);
        that.innerText = '0%';
        let currentUploader = new uploader(that.getAttribute('action'));
        if (withGlobalHeaders != null)
        {
          let broadcaster = getBroadcaster('fetch');
          let state = broadcaster.getState();
          if (state.hasOwnProperty(withGlobalHeaders))
          {
            currentUploader.setHeaders(state[withGlobalHeaders]);
          };
        };
        currentUploader.upload(this.files[0], percent => {
          that.innerText = percent + '%';
        }, data => {
          that.dispatchEvent(new CustomEvent('uploadend', {detail: {data: data}, bubbles: true}));
          if (!that.hasAttribute('keepsilent'))
          {
            dialog != null? dialog.alert(data.message): window.alert(data.message);
          };
          resetStatus();
        }, target => {
          let errorMessage = target.status + ' ' + target.statusText;
          dialog != null? dialog.alert(errorMessage): window.alert(errorMessage);
          resetStatus();
        });
      };
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'accept':
      {
        this.inputFile.setAttribute('accept', newVal);
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
  };

  constructor() {
    super();
    this.ready = false;
    this.inputFile = document.createElement('input');
    this.inputFile.setAttribute('type', 'file');
  };
};