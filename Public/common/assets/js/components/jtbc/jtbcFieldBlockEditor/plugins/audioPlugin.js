export default class audioPlugin {
  static get toolbox() {
    return {
      title: 'Audio',
      icon: '<svg width="24" height="24" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M842 454c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8 0 140.3-113.7 254-254 254S258 594.3 258 454c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8 0 168.7 126.6 307.9 290 327.6V884H326.7c-13.7 0-24.7 14.3-24.7 32v36c0 4.4 2.8 8 6.2 8h407.6c3.4 0 6.2-3.6 6.2-8v-36c0-17.7-11-32-24.7-32H548V782.1c165.3-18 294-158 294-328.1zM512 624c93.9 0 170-75.2 170-168V232c0-92.8-76.1-168-170-168s-170 75.2-170 168v224c0 92.8 76.1 168 170 168z m-94-392c0-50.6 41.9-92 94-92s94 41.4 94 92v224c0 50.6-41.9 92-94 92s-94-41.4-94-92V232z"></path></svg>',
    };
  };

  #paddingTop = 0;
  #paddingBottom = 0;
  #width = 'auto';
  #align = 'left';
  #audio = {
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
      let audioileurl = this.#audio.fileurl;
      let audio = wrapper.querySelector('div.audio');
      wrapper.style.setProperty('--padding-top', this.#paddingTop + 'px');
      wrapper.style.setProperty('--padding-bottom', this.#paddingBottom + 'px');
      wrapper.dataset.align = this.#align;
      wrapper.dataset.width = this.#width;
      let player = document.createElement('audio');
      player.setAttribute('controls', 'controls');
      if (audioileurl != null)
      {
        player.setAttribute('src', audioileurl);
      };
      audio.empty().append(player);
    };
  };

  #updateSettings(el) {
    let paddingTopEl = el.querySelector('[name=paddingTop]');
    let paddingBottomEl = el.querySelector('[name=paddingBottom]');
    let widthEl = el.querySelector('[name=width]');
    let alignEl = el.querySelector('[name=align]');
    let audioEl = el.querySelector('[name=audio]');
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
    if (audioEl != null)
    {
      let audioValue = audioEl.value;
      if (audioValue.length === 0)
      {
        this.#audio.uploadid = 0;
        this.#audio.fileurl = null;
      }
      else
      {
        try
        {
          let tempObj = JSON.parse(audioValue);
          if (tempObj.hasOwnProperty('uploadid') && tempObj.hasOwnProperty('fileurl'))
          {
            this.#audio.uploadid = Number.parseInt(tempObj.uploadid);
            this.#audio.fileurl = tempObj.fileurl;
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
    if (data.hasOwnProperty('audio'))
    {
      if (data.audio.hasOwnProperty('uploadid') && data.audio.hasOwnProperty('fileurl'))
      {
        this.#audio.uploadid = data.audio.uploadid;
        this.#audio.fileurl = data.audio.fileurl;
      };
    };
  };

  #initEvents() {
    let wrapper = this.wrapper;
    wrapper.delegateEventListener('div.icon[icon=setting]', 'click', e => this.showSettings());
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
      itemH4.innerText = this.api.i18n.t('Audio');
      itemField.classList.add('field');
      itemInput.setAttribute('name', 'audio');
      itemInput.setAttribute('width', '100%');
      itemInput.setAttribute('accept', 'audio/*');
      itemInput.setAttribute('whisper', 'true');
      itemInput.setAttribute('action', this.config.action);
      itemInput.setAttribute('tail', this.config.tail ?? '');
      itemInput.setAttribute('text-upload', this.api.i18n.t('Upload'));
      itemInput.setAttribute('value', JSON.stringify(this.#audio));
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
      let itemInput = document.createElement('jtbc-field-flat-selector');
      itemH4.innerText = this.api.i18n.t('Audio width');
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
    const renderContentRow4 = () => {
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
    h3.innerText = this.api.i18n.t('Audio settings');
    close.classList.add('close');
    let closeSvg = document.createElement('jtbc-svg');
    closeSvg.setAttribute('name', 'close');
    close.append(closeSvg);
    content.classList.add('content');
    content.append(renderContentRow1(), renderContentRow2(), renderContentRow3(), renderContentRow4());
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
    let audio = document.createElement('div');
    let player = document.createElement('audio');
    let icons = document.createElement('div');
    let emptyInput = document.createElement('input');
    wrapper.classList.add('block_audio');
    audio.classList.add('audio');
    player.setAttribute('controls', 'controls');
    audio.append(player);
    icons.classList.add('icons');
    let icon = document.createElement('div');
    let svg = document.createElement('jtbc-svg');
    svg.setAttribute('name', 'setting');
    icon.classList.add('icon');
    icon.setAttribute('icon', 'setting');
    icon.append(svg);
    icon.setAttribute('title', this.api.i18n.t('Setting'));
    icons.append(icon);
    emptyInput.setAttribute('type', 'hidden');
    wrapper.append(audio, icons, emptyInput);
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
      'audio': this.#audio,
    };
  };

  constructor({data, api, config}) {
    this.data = data;
    this.api = api;
    this.config = config || {};
    this.#initData(this.data);
  };
};