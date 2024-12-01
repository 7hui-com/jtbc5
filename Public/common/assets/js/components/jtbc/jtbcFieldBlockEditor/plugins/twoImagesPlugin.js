import uploader from '../../../../library/upload/uploader.js';

export default class twoImagesPlugin {
  static get toolbox() {
    return {
      title: 'Two images',
      icon: '<svg width="24" height="24" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M140.434286 236.982857a97.52381 97.52381 0 0 1 97.523809-97.523809h269.994667v780.190476H238.006857a97.52381 97.52381 0 0 1-97.523809-97.52381v-585.142857z m97.523809-24.380952a24.380952 24.380952 0 0 0-24.380952 24.380952v585.142857a24.380952 24.380952 0 0 0 24.380952 24.380953h196.85181v-633.904762H238.006857zM920.624762 822.125714a97.52381 97.52381 0 0 1-97.52381 97.52381h-265.167238v-780.190476h265.216a97.52381 97.52381 0 0 1 97.52381 97.523809v585.142857z m-97.52381 24.380953a24.380952 24.380952 0 0 0 24.380953-24.380953v-585.142857a24.380952 24.380952 0 0 0-24.380953-24.380952h-192.024381v633.904762h192.073143z"></path></svg>',
    };
  };

  #gap = 20;
  #paddingTop = 0;
  #paddingBottom = 0;
  #ratio = '5 / 5';
  #alignItems = 'top';
  #image1 = {
    'uploadid': 0,
    'fileurl': null,
  };
  #image2 = {
    'uploadid': 0,
    'fileurl': null,
  };

  #getRatioOptions() {
    let result = [];
    result.push({'text': '3 / 7', 'value': '3 / 7'});
    result.push({'text': '4 / 6', 'value': '4 / 6'});
    result.push({'text': '5 / 5', 'value': '5 / 5'});
    result.push({'text': '6 / 4', 'value': '6 / 4'});
    result.push({'text': '7 / 3', 'value': '7 / 3'});
    return result;
  };

  #getAlignItemsOptions() {
    let result = [];
    result.push({'text': this.api.i18n.t('Top'), 'value': 'top'});
    result.push({'text': this.api.i18n.t('Middle'), 'value': 'middle'});
    result.push({'text': this.api.i18n.t('Bottom'), 'value': 'bottom'});
    result.push({'text': this.api.i18n.t('Stretch'), 'value': 'stretch'});
    return result;
  };

  #setData() {
    let wrapper = this.wrapper;
    if (wrapper != null)
    {
      let fileurl1 = this.#image1.fileurl;
      let fileurl2 = this.#image2.fileurl;
      let image1 = wrapper.querySelector('div.image1 div.box').empty();
      let image2 = wrapper.querySelector('div.image2 div.box').empty();
      wrapper.style.setProperty('--image-gap', this.#gap + 'px');
      wrapper.style.setProperty('--padding-top', this.#paddingTop + 'px');
      wrapper.style.setProperty('--padding-bottom', this.#paddingBottom + 'px');
      wrapper.dataset.ratio = this.#ratio;
      wrapper.dataset.alignItems = this.#alignItems;
      if (fileurl1 != null)
      {
        let img1 = document.createElement('img');
        img1.setAttribute('src', fileurl1);
        image1.append(img1);
      };
      if (fileurl2 != null)
      {
        let img2 = document.createElement('img');
        img2.setAttribute('src', fileurl2);
        image2.append(img2);
      };
    };
  };

  #updateSettings(el) {
    let gapEl = el.querySelector('[name=gap]');
    let paddingTopEl = el.querySelector('[name=paddingTop]');
    let paddingBottomEl = el.querySelector('[name=paddingBottom]');
    let image1El = el.querySelector('[name=image1]');
    let image2El = el.querySelector('[name=image2]');
    let ratioEl = el.querySelector('[name=ratio]');
    let alignItemsEl = el.querySelector('[name=alignItems]');
    if (gapEl != null)
    {
      this.#gap = Number.parseInt(gapEl.value);
    };
    if (paddingTopEl != null)
    {
      this.#paddingTop = Number.parseInt(paddingTopEl.value);
    };
    if (paddingBottomEl != null)
    {
      this.#paddingBottom = Number.parseInt(paddingBottomEl.value);
    };
    if (image1El != null)
    {
      let image1Value = image1El.value;
      if (image1Value.length === 0)
      {
        this.#image1.uploadid = 0;
        this.#image1.fileurl = null;
      }
      else
      {
        try
        {
          let tempObj = JSON.parse(image1Value);
          if (tempObj.hasOwnProperty('uploadid') && tempObj.hasOwnProperty('fileurl'))
          {
            this.#image1.uploadid = Number.parseInt(tempObj.uploadid);
            this.#image1.fileurl = tempObj.fileurl;
          };
        }
        catch(e)
        {
          throw new Error('Unexpected value');
        };
      };
    };
    if (image2El != null)
    {
      let image2Value = image2El.value;
      if (image2Value.length === 0)
      {
        this.#image2.uploadid = 0;
        this.#image2.fileurl = null;
      }
      else
      {
        try
        {
          let tempObj = JSON.parse(image2Value);
          if (tempObj.hasOwnProperty('uploadid') && tempObj.hasOwnProperty('fileurl'))
          {
            this.#image2.uploadid = Number.parseInt(tempObj.uploadid);
            this.#image2.fileurl = tempObj.fileurl;
          };
        }
        catch(e)
        {
          throw new Error('Unexpected value');
        };
      };
    };
    if (ratioEl != null)
    {
      try
      {
        let tempArr = JSON.parse(ratioEl.value);
        if (Array.isArray(tempArr) && tempArr.length === 1)
        {
          this.#ratio = tempArr.pop();
        };
      }
      catch(e)
      {
        throw new Error('Unexpected value');
      };
    };
    if (alignItemsEl != null)
    {
      try
      {
        let tempArr = JSON.parse(alignItemsEl.value);
        if (Array.isArray(tempArr) && tempArr.length === 1)
        {
          this.#alignItems = tempArr.pop();
        };
      }
      catch(e)
      {
        throw new Error('Unexpected value');
      };
    };
    this.#setData();
  };

  #initData(data) {
    this.#gap = data.hasOwnProperty('gap')? data.gap: 20;
    this.#paddingTop = data.hasOwnProperty('paddingTop')? data.paddingTop: 0;
    this.#paddingBottom = data.hasOwnProperty('paddingBottom')? data.paddingBottom: 0;
    this.#ratio = data.hasOwnProperty('ratio')? data.ratio: '5 / 5';
    this.#alignItems = data.hasOwnProperty('alignItems')? data.alignItems: 'top';
    if (data.hasOwnProperty('image1'))
    {
      if (data.image1.hasOwnProperty('uploadid') && data.image1.hasOwnProperty('fileurl'))
      {
        this.#image1.uploadid = data.image1.uploadid;
        this.#image1.fileurl = data.image1.fileurl;
      };
    };
    if (data.hasOwnProperty('image2'))
    {
      if (data.image2.hasOwnProperty('uploadid') && data.image2.hasOwnProperty('fileurl'))
      {
        this.#image2.uploadid = data.image2.uploadid;
        this.#image2.fileurl = data.image2.fileurl;
      };
    };
  };

  #initEvents() {
    let that = this;
    let wrapper = this.wrapper;
    const swapImage = () => {
      let image1uploadid = this.#image1.uploadid;
      let image1fileurl = this.#image1.fileurl;
      let image2uploadid = this.#image2.uploadid;
      let image2fileurl = this.#image2.fileurl;
      this.#image1.uploadid = image2uploadid;
      this.#image1.fileurl = image2fileurl;
      this.#image2.uploadid = image1uploadid;
      this.#image2.fileurl = image1fileurl;
      this.#setData();
    };
    wrapper.delegateEventListener('div.image div.box', 'click', function(){
      if (this.childElementCount === 0)
      {
        this.parentElement.querySelector('input.file').click();
      };
    });
    wrapper.delegateEventListener('div.image div.icon[icon=arrow_left]', 'click', e => swapImage());
    wrapper.delegateEventListener('div.image div.icon[icon=arrow_right]', 'click', e => swapImage());
    wrapper.delegateEventListener('div.image div.icon[icon=trash]', 'click', function(){
      let box = this.parentElement.parentElement.querySelector('div.box');
      if (!this.classList.contains('on'))
      {
        this.classList.add('on');
      }
      else
      {
        box.empty();
        this.classList.remove('on');
        if (box.parentElement.classList.contains('image1'))
        {
          that.#image1.uploadid = 0;
          that.#image1.fileurl = null;
        }
        else
        {
          that.#image2.uploadid = 0;
          that.#image2.fileurl = null;
        };
        if (that.#image1.fileurl == null && that.#image2.fileurl == null)
        {
          that.api.blocks.delete(that.api.blocks.getCurrentBlockIndex());
        };
      };
    });
    wrapper.delegateEventListener('div.image input.file', 'change', function(){
      let box = this.parentElement.querySelector('div.box');
      if (!box.classList.contains('uploading') && this.files.length == 1)
      {
        box.empty().classList.add('uploading');
        box.style.setProperty('--image-uploading-width', '100%');
        let currentFile = this.files[0];
        let fileReader = new FileReader();
        fileReader.readAsDataURL(currentFile);
        fileReader.addEventListener('load', () => {
          let img = document.createElement('img');
          img.setAttribute('src', fileReader.result);
          box.append(img);
          let currentUploader = new uploader(that.config.action);
          currentUploader.upload(currentFile, percent => {
            box.style.setProperty('--image-uploading-width', (100 - percent) + '%');
          }, data => {
            this.value = null;
            box.classList.remove('uploading');
            if (data.code == 1)
            {
              if (box.parentElement.classList.contains('image1'))
              {
                that.#image1.uploadid = data.param.uploadid;
                that.#image1.fileurl = data.param.fileurl + (that.config.tail ?? '');
                img.setAttribute('src', that.#image1.fileurl);
              }
              else
              {
                that.#image2.uploadid = data.param.uploadid;
                that.#image2.fileurl = data.param.fileurl + (that.config.tail ?? '');
                img.setAttribute('src', that.#image2.fileurl);
              };
            }
            else
            {
              box.empty();
              that.config.miniMessage.push(data.message);
            };
          }, target => that.config.miniMessage.push(target.status + String.fromCharCode(32) + target.statusText));
        });
      };
    });
    wrapper.delegateEventListener('div.icon[icon=setting]', 'click', e => this.showSettings());
  };

  showSettings() {
    const renderContentRow1 = () => {
      let result = document.createElement('div');
      let item1 = document.createElement('div');
      let item2 = document.createElement('div');
      let item3 = document.createElement('div');
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
      item3.classList.add('item');
      item3.setAttribute('size', 's');
      let item3H4 = document.createElement('h4');
      let item3Field = document.createElement('div');
      let item3Input = document.createElement('jtbc-field-number');
      item3H4.innerText = this.api.i18n.t('Gap between images(px)');
      item3Field.classList.add('field');
      item3Input.classList.add('setting');
      item3Input.setAttributes({
        'name': 'gap',
        'step': '5',
        'min': '0',
        'max': '1000',
        'width': '100',
        'value': this.#gap,
      });
      item3Field.append(item3Input);
      item3.append(item3H4, item3Field);
      result.append(item1, item2, item3);
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
      itemH4.innerText = this.api.i18n.t('Left image url');
      itemField.classList.add('field');
      itemInput.setAttribute('name', 'image1');
      itemInput.setAttribute('width', '100%');
      itemInput.setAttribute('accept', 'image/*');
      itemInput.setAttribute('whisper', 'true');
      itemInput.setAttribute('action', this.config.action);
      itemInput.setAttribute('tail', this.config.tail ?? '');
      itemInput.setAttribute('text-upload', this.api.i18n.t('Upload'));
      itemInput.setAttribute('value', JSON.stringify(this.#image1));
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
      itemH4.innerText = this.api.i18n.t('Right image url');
      itemField.classList.add('field');
      itemInput.setAttribute('name', 'image2');
      itemInput.setAttribute('width', '100%');
      itemInput.setAttribute('accept', 'image/*');
      itemInput.setAttribute('whisper', 'true');
      itemInput.setAttribute('action', this.config.action);
      itemInput.setAttribute('tail', this.config.tail ?? '');
      itemInput.setAttribute('text-upload', this.api.i18n.t('Upload'));
      itemInput.setAttribute('value', JSON.stringify(this.#image2));
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
      itemH4.innerText = this.api.i18n.t('Ratio of images');
      itemField.classList.add('field');
      itemInput.setAttribute('name', 'ratio');
      itemInput.setAttribute('type', 'radio');
      itemInput.setAttribute('columns', '5');
      itemInput.setAttribute('data', JSON.stringify(this.#getRatioOptions()));
      itemInput.setAttribute('value', JSON.stringify([this.#ratio]));
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
      itemInput.setAttribute('name', 'alignItems');
      itemInput.setAttribute('type', 'radio');
      itemInput.setAttribute('columns', '5');
      itemInput.setAttribute('data', JSON.stringify(this.#getAlignItemsOptions()));
      itemInput.setAttribute('value', JSON.stringify([this.#alignItems]));
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
    h3.innerText = this.api.i18n.t('Two images settings');
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
    const renderButtons = () => {
      let buttons = document.createElement('div');
      let titles = {
        'arrow_left': 'Move to the left',
        'arrow_right': 'Move to the right',
        'trash': 'Delete',
      };
      buttons.classList.add('buttons');
      ['arrow_left', 'trash', 'arrow_right'].forEach(item => {
        let icon = document.createElement('div');
        let svg = document.createElement('jtbc-svg');
        svg.setAttribute('name', item);
        icon.classList.add('icon');
        icon.setAttribute('icon', item);
        icon.append(svg);
        icon.setAttribute('title', this.api.i18n.t(titles[item]));
        buttons.append(icon);
      });
      return buttons;
    };
    let wrapper = this.wrapper = document.createElement('div');
    let image1 = document.createElement('div');
    let image2 = document.createElement('div');
    let icons = document.createElement('div');
    wrapper.classList.add('block_two_images');
    image1.classList.add('image');
    image1.classList.add('image1');
    let image1Box = document.createElement('div');
    let image1File = document.createElement('input');
    image1Box.classList.add('box');
    image1File.setAttribute('type', 'file');
    image1File.setAttribute('accept', 'image/*');
    image1File.classList.add('file');
    image1.append(image1Box, renderButtons(), image1File);
    image2.classList.add('image');
    image2.classList.add('image2');
    let image2Box = document.createElement('div');
    let image2File = document.createElement('input');
    image2Box.classList.add('box');
    image2File.setAttribute('type', 'file');
    image2File.setAttribute('accept', 'image/*');
    image2File.classList.add('file');
    image2.append(image2Box, renderButtons(), image2File);
    icons.classList.add('icons');
    let icon = document.createElement('div');
    let svg = document.createElement('jtbc-svg');
    svg.setAttribute('name', 'setting');
    icon.classList.add('icon');
    icon.setAttribute('icon', 'setting');
    icon.append(svg);
    icon.setAttribute('title', this.api.i18n.t('Setting'));
    icons.append(icon);
    wrapper.append(image1, image2, icons);
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
      'gap': this.#gap,
      'paddingTop': this.#paddingTop,
      'paddingBottom': this.#paddingBottom,
      'ratio': this.#ratio,
      'alignItems': this.#alignItems,
      'image1': this.#image1,
      'image2': this.#image2,
    };
  };

  constructor({data, api, config}) {
    this.data = data;
    this.api = api;
    this.config = config || {};
    this.#initData(this.data);
  };
};