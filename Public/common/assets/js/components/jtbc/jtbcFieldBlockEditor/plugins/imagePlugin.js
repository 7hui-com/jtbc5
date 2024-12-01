import uploader from '../../../../library/upload/uploader.js';

export default class imagePlugin {
  static get toolbox() {
    return {
      title: 'Image',
      icon: '<svg width="24" height="24" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="m820.84087,99.79999l-617.58995,0c-56.83005,0 -102.90101,46.17893 -102.90101,103.05l0,618.3c0,56.96324 46.07096,103.05 102.90101,103.05l617.49799,0c56.83005,0 102.90101,-46.17893 102.90101,-103.05l0,-618.3c0.09196,-56.87107 -46.07096,-103.05 -102.80905,-103.05zm-605.63541,65.53538l593.49695,0c27.31153,0 49.4734,22.12165 49.4734,49.49718l0,415.14956l-126.16638,-170.70537c-6.25315,-8.57214 -16.36852,-13.73385 -27.21957,-14.01038c-10.85104,-0.27652 -21.2423,4.33215 -27.95523,12.5356l-183.82404,222.32254l-118.53387,-107.84303c-12.13845,-11.06082 -30.89788,-12.16691 -44.32376,-2.58085l-164.32895,116.87603l0,-471.74409c0,-27.28336 22.06992,-49.49718 49.38144,-49.49718l0,-0.00001zm593.58891,693.23708l-593.58891,0c-27.31153,0 -49.4734,-22.12165 -49.4734,-49.49718l0,-40.64852c2.02308,-0.92174 4.04615,-2.02782 5.88531,-3.41042l176.37545,-125.35599l124.78701,113.55778c7.08076,6.45215 16.55245,9.67822 26.20803,9.03301s18.57552,-5.16172 24.64475,-12.44343l178.76635,-216.14691l142.25903,192.64267c3.58636,4.8852 8.36817,8.47997 13.60978,10.87648l0,71.89535c0,27.28336 -22.16188,49.49718 -49.4734,49.49718l0.00001,-0.00001z"/><path d="m354.79771,430.88728c52.69194,0 95.63632,-43.04503 95.63632,-95.86046s-42.94439,-95.86046 -95.63632,-95.86046s-95.63632,43.04503 -95.63632,95.86046s42.94439,95.86046 95.63632,95.86046zm0,-125.35599c16.27656,0 29.42656,13.18081 29.42656,29.49553s-13.14999,29.49553 -29.42656,29.49553s-29.42656,-13.18081 -29.42656,-29.49553s13.05804,-29.49553 29.42656,-29.49553z"/></svg>',
    };
  };

  #paddingTop = 0;
  #paddingBottom = 0;
  #width = 'auto';
  #align = 'left';
  #image = {
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
      let fileurl = this.#image.fileurl;
      let image = wrapper.querySelector('div.image').empty();
      wrapper.style.setProperty('--padding-top', this.#paddingTop + 'px');
      wrapper.style.setProperty('--padding-bottom', this.#paddingBottom + 'px');
      wrapper.dataset.align = this.#align;
      wrapper.dataset.width = this.#width;
      if (fileurl != null)
      {
        let img = document.createElement('img');
        img.setAttribute('src', fileurl);
        image.append(img);
      };
    };
  };

  #updateSettings(el) {
    let paddingTopEl = el.querySelector('[name=paddingTop]');
    let paddingBottomEl = el.querySelector('[name=paddingBottom]');
    let imageEl = el.querySelector('[name=image]');
    let widthEl = el.querySelector('[name=width]');
    let alignEl = el.querySelector('[name=align]');
    if (paddingTopEl != null)
    {
      this.#paddingTop = Number.parseInt(paddingTopEl.value);
    };
    if (paddingBottomEl != null)
    {
      this.#paddingBottom = Number.parseInt(paddingBottomEl.value);
    };
    if (imageEl != null)
    {
      let imageValue = imageEl.value;
      if (imageValue.length === 0)
      {
        this.#image.uploadid = 0;
        this.#image.fileurl = null;
      }
      else
      {
        try
        {
          let tempObj = JSON.parse(imageValue);
          if (tempObj.hasOwnProperty('uploadid') && tempObj.hasOwnProperty('fileurl'))
          {
            this.#image.uploadid = Number.parseInt(tempObj.uploadid);
            this.#image.fileurl = tempObj.fileurl;
          };
        }
        catch(e)
        {
          throw new Error('Unexpected value');
        };
      };
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
    this.#setData();
  };

  #initData(data) {
    this.#paddingTop = data.hasOwnProperty('paddingTop')? data.paddingTop: 0;
    this.#paddingBottom = data.hasOwnProperty('paddingBottom')? data.paddingBottom: 0;
    this.#width = data.hasOwnProperty('width')? data.width: 'auto';
    this.#align = data.hasOwnProperty('align')? data.align: 'left';
    if (data.hasOwnProperty('image'))
    {
      if (data.image.hasOwnProperty('uploadid') && data.image.hasOwnProperty('fileurl'))
      {
        this.#image.uploadid = data.image.uploadid;
        this.#image.fileurl = data.image.fileurl;
      };
    };
  };

  #initEvents() {
    let that = this;
    let wrapper = this.wrapper;
    wrapper.delegateEventListener('div.image', 'click', function(){
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
      let image = wrapper.querySelector('div.image');
      if (!image.classList.contains('uploading') && this.files.length == 1)
      {
        image.empty().classList.add('uploading');
        image.style.setProperty('--image-uploading-width', '100%');
        let currentFile = this.files[0];
        let fileReader = new FileReader();
        fileReader.readAsDataURL(currentFile);
        fileReader.addEventListener('load', () => {
          let img = document.createElement('img');
          img.setAttribute('src', fileReader.result);
          image.append(img);
          let currentUploader = new uploader(that.config.action);
          currentUploader.upload(currentFile, percent => {
            image.style.setProperty('--image-uploading-width', (100 - percent) + '%');
          }, data => {
            this.value = null;
            image.classList.remove('uploading');
            if (data.code == 1)
            {
              that.#image.uploadid = data.param.uploadid;
              that.#image.fileurl = data.param.fileurl + (that.config.tail ?? '');
              img.setAttribute('src', that.#image.fileurl);
            }
            else
            {
              image.empty();
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
      itemH4.innerText = this.api.i18n.t('Image url');
      itemField.classList.add('field');
      itemInput.setAttribute('name', 'image');
      itemInput.setAttribute('width', '100%');
      itemInput.setAttribute('accept', 'image/*');
      itemInput.setAttribute('whisper', 'true');
      itemInput.setAttribute('action', this.config.action);
      itemInput.setAttribute('tail', this.config.tail ?? '');
      itemInput.setAttribute('text-upload', this.api.i18n.t('Upload'));
      itemInput.setAttribute('value', JSON.stringify(this.#image));
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
      itemH4.innerText = this.api.i18n.t('Image width');
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
    h3.innerText = this.api.i18n.t('Image settings');
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
    let el = document.createElement('div');
    let icons = document.createElement('div');
    wrapper.classList.add('block_image');
    el.classList.add('image');
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
    file.setAttribute('accept', 'image/*');
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
      'image': this.#image,
    };
  };

  constructor({data, api, config}) {
    this.data = data;
    this.api = api;
    this.config = config || {};
    this.#initData(this.data);
  };
};