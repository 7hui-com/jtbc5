import uploader from '../../../../library/upload/uploader.js';

export default class videoPlugin {
  static get toolbox() {
    return {
      title: 'Video',
      icon: '<svg width="24" height="24" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M472.864 496.576a16 16 0 0 0-24.864 13.312v196.224a16 16 0 0 0 24.864 13.312l147.168-98.112a16 16 0 0 0 0-26.624l-147.168-98.112z"></path><path d="M96 192a96 96 0 0 1 96-96h640a96 96 0 0 1 96 96v640a96 96 0 0 1-96 96H192a96 96 0 0 1-96-96V192z m96-32a32 32 0 0 0-32 32v96h142.688l73.92-128H192z m258.496 0l-73.92 128h198.08l73.92-128h-198.08zM864 288V192a32 32 0 0 0-32-32h-109.504l-73.92 128H864zM160 832a32 32 0 0 0 32 32h640a32 32 0 0 0 32-32V352H160v480z"></path></svg>',
    };
  };

  static get pasteConfig() {
    return {
      tags: [{'video': {'src': true, 'poster': true}}],
    };
  };

  #paddingTop = 0;
  #paddingBottom = 0;
  #width = 'auto';
  #align = 'left';
  #video = {
    'uploadid': 0,
    'fileurl': null,
  };
  #poster = {
    'uploadid': 0,
    'fileurl': null,
  };

  #getWidthOptions() {
    let result = [];
    result.push({'text': this.api.i18n.t('Auto'), 'value': 'auto'});
    for (let i = 2; i <= 10; i ++)
    {
      result.push({'text': (i * 10) + '%', 'value': (i * 10) + '%'});
    };
    return result;
  };

  #getAlignOptions() {
    let result = [];
    result.push({'text': this.api.i18n.t('Left'), 'value': 'left'});
    result.push({'text': this.api.i18n.t('Center'), 'value': 'center'});
    result.push({'text': this.api.i18n.t('Right'), 'value': 'right'});
    return result;
  };

  #setData() {
    let wrapper = this.wrapper;
    if (wrapper != null)
    {
      let videoFileurl = this.#video.fileurl;
      let posterFileurl = this.#poster.fileurl;
      let video = wrapper.querySelector('div.video').empty();
      wrapper.style.setProperty('--padding-top', this.#paddingTop + 'px');
      wrapper.style.setProperty('--padding-bottom', this.#paddingBottom + 'px');
      wrapper.dataset.align = this.#align;
      wrapper.dataset.width = this.#width;
      if (videoFileurl != null)
      {
        let player = document.createElement('video');
        player.setAttribute('src', videoFileurl);
        player.setAttribute('controls', 'controls');
        if (posterFileurl != null)
        {
          player.setAttribute('poster', posterFileurl);
        };
        video.append(player);
      };
    };
  };

  #updateSettings(el) {
    let paddingTopEl = el.querySelector('[name=paddingTop]');
    let paddingBottomEl = el.querySelector('[name=paddingBottom]');
    let widthEl = el.querySelector('[name=width]');
    let alignEl = el.querySelector('[name=align]');
    let posterEl = el.querySelector('[name=poster]');
    let videoEl = el.querySelector('[name=video]');
    if (paddingTopEl != null)
    {
      this.#paddingTop = Number.parseInt(paddingTopEl.value);
    };
    if (paddingBottomEl != null)
    {
      this.#paddingBottom = Number.parseInt(paddingBottomEl.value);
    };
    if (widthEl != null)
    {
      try
      {
        let tempArr = JSON.parse(widthEl.value);
        if (Array.isArray(tempArr) && tempArr.length === 1)
        {
          this.#width = tempArr.pop();
        };
      }
      catch(e)
      {
        throw new Error('Unexpected value');
      };
    };
    if (alignEl != null)
    {
      try
      {
        let tempArr = JSON.parse(alignEl.value);
        if (Array.isArray(tempArr) && tempArr.length === 1)
        {
          this.#align = tempArr.pop();
        };
      }
      catch(e)
      {
        throw new Error('Unexpected value');
      };
    };
    if (posterEl != null)
    {
      let posterValue = posterEl.value;
      if (posterValue.length === 0)
      {
        this.#poster.uploadid = 0;
        this.#poster.fileurl = null;
      }
      else
      {
        try
        {
          let tempObj = JSON.parse(posterValue);
          if (tempObj.hasOwnProperty('uploadid') && tempObj.hasOwnProperty('fileurl'))
          {
            this.#poster.uploadid = Number.parseInt(tempObj.uploadid);
            this.#poster.fileurl = tempObj.fileurl;
          };
        }
        catch(e)
        {
          throw new Error('Unexpected value');
        };
      };
    };
    if (videoEl != null)
    {
      let videoValue = videoEl.value;
      if (videoValue.length === 0)
      {
        this.#video.uploadid = 0;
        this.#video.fileurl = null;
      }
      else
      {
        try
        {
          let tempObj = JSON.parse(videoValue);
          if (tempObj.hasOwnProperty('uploadid') && tempObj.hasOwnProperty('fileurl'))
          {
            this.#video.uploadid = Number.parseInt(tempObj.uploadid);
            this.#video.fileurl = tempObj.fileurl;
          };
        }
        catch(e)
        {
          throw new Error('Unexpected value');
        };
      };
    };
    this.#setData();
  };

  #initData(data) {
    this.#paddingTop = data.hasOwnProperty('paddingTop')? data.paddingTop: 0;
    this.#paddingBottom = data.hasOwnProperty('paddingBottom')? data.paddingBottom: 0;
    this.#width = data.hasOwnProperty('width')? data.width: 'auto';
    this.#align = data.hasOwnProperty('align')? data.align: 'left';
    if (data.hasOwnProperty('video'))
    {
      if (data.video.hasOwnProperty('uploadid') && data.video.hasOwnProperty('fileurl'))
      {
        this.#video.uploadid = data.video.uploadid;
        this.#video.fileurl = data.video.fileurl;
      };
    };
    if (data.hasOwnProperty('poster'))
    {
      if (data.poster.hasOwnProperty('uploadid') && data.video.hasOwnProperty('fileurl'))
      {
        this.#poster.uploadid = data.poster.uploadid;
        this.#poster.fileurl = data.poster.fileurl;
      };
    };
  };

  #initEvents() {
    let that = this;
    let wrapper = this.wrapper;
    wrapper.delegateEventListener('div.video', 'click', function(){
      if (this.childElementCount === 0)
      {
        this.parentElement.querySelector('input.file').click();
      };
    });
    wrapper.delegateEventListener('div.icon[icon=upload]', 'click', function(){
      this.parentElement.querySelector('input.file').click();
    });
    wrapper.delegateEventListener('div.icon[icon=setting]', 'click', e => this.showSettings());
    wrapper.delegateEventListener('input.file', 'change', function(){
      let posterFileurl = that.#poster.fileurl;
      let video = wrapper.querySelector('div.video');
      if (!video.classList.contains('uploading') && this.files.length == 1)
      {
        video.empty().classList.add('uploading');
        video.style.setProperty('--video-uploading-width', '100%');
        let currentFile = this.files[0];
        let fileReader = new FileReader();
        fileReader.readAsDataURL(currentFile);
        fileReader.addEventListener('load', () => {
          let player = document.createElement('video');
          player.setAttribute('src', fileReader.result);
          player.setAttribute('controls', 'controls');
          video.append(player);
          let currentUploader = new uploader(that.config.action);
          currentUploader.upload(currentFile, percent => {
            video.style.setProperty('--video-uploading-width', (100 - percent) + '%');
          }, data => {
            this.value = null;
            video.classList.remove('uploading');
            if (data.code == 1)
            {
              that.#video.uploadid = data.param.uploadid;
              that.#video.fileurl = data.param.fileurl + (that.config.tail ?? '');
              player.setAttribute('src', that.#video.fileurl);
              if (posterFileurl != null)
              {
                player.setAttribute('poster', posterFileurl);
              };
            }
            else
            {
              video.empty();
              that.config.miniMessage.push(data.message);
            };
          }, target => that.config.miniMessage.push(target.status + String.fromCharCode(32) + target.statusText));
        });
      };
    });
  };

  showSettings() {
    const renderContentRow1 = () => {
      let result = document.createElement('div');
      let item1 = document.createElement('div');
      let item2 = document.createElement('div');
      result.classList.add('row');
      item1.classList.add('item');
      item1.setAttribute('size', 's');
      let item1H4 = document.createElement('h4');
      let item1Field = document.createElement('div');
      let item1Input = document.createElement('jtbc-field-number');
      item1H4.innerText = this.api.i18n.t('Padding top(px)');
      item1Field.classList.add('field');
      item1Input.classList.add('setting');
      item1Input.setAttributes({
        'name': 'paddingTop',
        'step': '5',
        'min': '0',
        'max': '1000',
        'width': '100',
        'value': this.#paddingTop,
      });
      item1Field.append(item1Input);
      item1.append(item1H4, item1Field);
      item2.classList.add('item');
      item2.setAttribute('size', 's');
      let item2H4 = document.createElement('h4');
      let item2Field = document.createElement('div');
      let item2Input = document.createElement('jtbc-field-number');
      item2H4.innerText = this.api.i18n.t('Padding bottom(px)');
      item2Field.classList.add('field');
      item2Input.classList.add('setting');
      item2Input.setAttributes({
        'name': 'paddingBottom',
        'step': '5',
        'min': '0',
        'max': '1000',
        'width': '100',
        'value': this.#paddingBottom,
      });
      item2Field.append(item2Input);
      item2.append(item2H4, item2Field);
      result.append(item1, item2);
      return result;
    };
    const renderContentRow2 = () => {
      let result = document.createElement('div');
      let item = document.createElement('div');
      result.classList.add('row');
      item.classList.add('item');
      let itemH4 = document.createElement('h4');
      let itemField = document.createElement('div');
      let itemInput = document.createElement('jtbc-field-upload');
      itemH4.innerText = this.api.i18n.t('Video poster');
      itemField.classList.add('field');
      itemInput.setAttribute('name', 'poster');
      itemInput.setAttribute('width', '100%');
      itemInput.setAttribute('accept', 'image/*');
      itemInput.setAttribute('whisper', 'true');
      itemInput.setAttribute('action', this.config.action);
      itemInput.setAttribute('tail', this.config.tail ?? '');
      itemInput.setAttribute('text-upload', this.api.i18n.t('Upload'));
      itemInput.setAttribute('value', JSON.stringify(this.#poster));
      itemField.append(itemInput);
      item.append(itemH4, itemField);
      result.append(item);
      return result;
    };
    const renderContentRow3 = () => {
      let result = document.createElement('div');
      let item = document.createElement('div');
      result.classList.add('row');
      item.classList.add('item');
      let itemH4 = document.createElement('h4');
      let itemField = document.createElement('div');
      let itemInput = document.createElement('jtbc-field-upload');
      itemH4.innerText = this.api.i18n.t('Video url');
      itemField.classList.add('field');
      itemInput.setAttribute('name', 'video');
      itemInput.setAttribute('width', '100%');
      itemInput.setAttribute('accept', 'video/*');
      itemInput.setAttribute('whisper', 'true');
      itemInput.setAttribute('action', this.config.action);
      itemInput.setAttribute('tail', this.config.tail ?? '');
      itemInput.setAttribute('text-upload', this.api.i18n.t('Upload'));
      itemInput.setAttribute('value', JSON.stringify(this.#video));
      itemField.append(itemInput);
      item.append(itemH4, itemField);
      result.append(item);
      return result;
    };
    const renderContentRow4 = () => {
      let result = document.createElement('div');
      let item = document.createElement('div');
      result.classList.add('row');
      item.classList.add('item');
      let itemH4 = document.createElement('h4');
      let itemField = document.createElement('div');
      let itemInput = document.createElement('jtbc-field-flat-selector');
      itemH4.innerText = this.api.i18n.t('Video width');
      itemField.classList.add('field');
      itemInput.setAttribute('name', 'width');
      itemInput.setAttribute('type', 'radio');
      itemInput.setAttribute('columns', '5');
      itemInput.setAttribute('data', JSON.stringify(this.#getWidthOptions()));
      itemInput.setAttribute('value', JSON.stringify([this.#width]));
      itemField.append(itemInput);
      item.append(itemH4, itemField);
      result.append(item);
      return result;
    };
    const renderContentRow5 = () => {
      let result = document.createElement('div');
      let item = document.createElement('div');
      result.classList.add('row');
      item.classList.add('item');
      let itemH4 = document.createElement('h4');
      let itemField = document.createElement('div');
      let itemInput = document.createElement('jtbc-field-flat-selector');
      itemH4.innerText = this.api.i18n.t('Alignment');
      itemField.classList.add('field');
      itemInput.setAttribute('name', 'align');
      itemInput.setAttribute('type', 'radio');
      itemInput.setAttribute('columns', '5');
      itemInput.setAttribute('data', JSON.stringify(this.#getAlignOptions()));
      itemInput.setAttribute('value', JSON.stringify([this.#align]));
      itemField.append(itemInput);
      item.append(itemH4, itemField);
      result.append(item);
      return result;
    };
    let settings = document.createElement('div');
    settings.classList.add('settings');
    let h3 = document.createElement('h3');
    let close = document.createElement('div');
    let content = document.createElement('div');
    let footer = document.createElement('div');
    h3.innerText = this.api.i18n.t('Video settings');
    close.classList.add('close');
    let closeSvg = document.createElement('jtbc-svg');
    closeSvg.setAttribute('name', 'close');
    close.append(closeSvg);
    content.classList.add('content');
    content.append(renderContentRow1(), renderContentRow2(), renderContentRow3(), renderContentRow4(), renderContentRow5());
    let btnCancel = document.createElement('button');
    let btnOk = document.createElement('button');
    btnCancel.classList.add('b3');
    btnCancel.classList.add('cancel');
    btnCancel.innerText = this.api.i18n.t('Cancel');
    btnOk.classList.add('b2');
    btnOk.classList.add('ok');
    btnOk.innerText = this.api.i18n.t('OK');
    footer.classList.add('footer');
    footer.append(btnCancel, btnOk);
    settings.append(h3, close, content, footer);
    this.config.dialog.html(settings.outerHTML).then(el => {
      el.classList.add('on');
      nap(100).then(() => {
        let settings = el.querySelector('div.settings');
        settings.classList.add('on');
        settings.addEventListener('close', e => e.target.classList.add('out'));
        settings.addEventListener('transitionend', e => {
          if (e.target.classList.contains('on') && e.target.classList.contains('out'))
          {
            el.classList.remove('on');
            e.target.classList.remove('on');
            e.target.classList.remove('out');
          };
        });
        settings.delegateEventListener('button.ok', 'click', e => {
          this.#updateSettings(e.currentTarget);
          e.currentTarget.dispatchEvent(new CustomEvent('close'));
        });
        settings.delegateEventListener('div.close', 'click', e => e.currentTarget.dispatchEvent(new CustomEvent('close')));
        settings.delegateEventListener('button.cancel', 'click', e => e.currentTarget.dispatchEvent(new CustomEvent('close')));
      });
    });
  };

  render() {
    let wrapper = this.wrapper = document.createElement('div');
    let el = document.createElement('div');
    let icons = document.createElement('div');
    wrapper.classList.add('block_video');
    el.classList.add('video');
    icons.classList.add('icons');
    ['upload', 'setting'].forEach(item => {
      let icon = document.createElement('div');
      let svg = document.createElement('jtbc-svg');
      svg.setAttribute('name', item);
      icon.classList.add('icon');
      icon.setAttribute('icon', item);
      icon.append(svg);
      icon.setAttribute('title', this.api.i18n.t(item.charAt(0).toUpperCase() + item.slice(1)));
      icons.append(icon);
    });
    let file = document.createElement('input');
    file.setAttribute('type', 'file');
    file.setAttribute('accept', 'video/*');
    file.classList.add('file');
    icons.append(file);
    wrapper.append(el, icons);
    this.#setData();
    this.#initEvents();
    return wrapper;
  };

  rendered() {
    if (Object.keys(this.data).length == 0)
    {
      this.wrapper.scrollIntoView({'behavior': 'smooth'});
    };
  };

  save(blockContent) {
    return {
      'paddingTop': this.#paddingTop,
      'paddingBottom': this.#paddingBottom,
      'width': this.#width,
      'align': this.#align,
      'poster': this.#poster,
      'video': this.#video,
    };
  };

  onPaste(e) {
    if (e.type == 'tag')
    {
      this.#video.uploadid = 0;
      this.#video.fileurl = e.detail.data.src;
      this.#poster.uploadid = 0;
      this.#poster.fileurl = e.detail.data.poster;
      this.#setData();
    };
  };

  constructor({data, api, config}) {
    this.data = data;
    this.api = api;
    this.config = config || {};
    this.#initData(this.data);
  };
};