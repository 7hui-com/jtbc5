import uploader from '../../../../library/upload/uploader.js';
import htmlInspector from '../../../../library/html/htmlInspector.js';

export default class mixedTextPlugin {
  static get toolbox() {
    return {
      title: 'Mixed Text',
      icon: '<svg width="24" height="24" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="m737.38129,381.11656c0,16.26238 -11.49053,29.46083 -25.72245,29.46083l-128.78723,0c-14.17359,0 -25.72245,-13.19845 -25.72245,-29.46083c0,-16.20346 11.54885,-29.46083 25.72245,-29.46083l128.78723,0c14.23192,0.05892 25.72245,13.25738 25.72245,29.46083zm0,-104.05567c0,16.26238 -11.49053,29.46083 -25.72245,29.46083l-128.78723,0c-14.17359,0 -25.72245,-13.19845 -25.72245,-29.46083s11.54885,-29.46083 25.72245,-29.46083l128.78723,0c14.23192,0 25.72245,13.19845 25.72245,29.46083zm12.59875,344.75069c0,16.26238 -11.54885,29.46083 -25.78078,29.46083l-463.64569,0c-14.23192,0 -25.72245,-13.19845 -25.72245,-29.46083c0,-16.20346 11.54885,-29.46083 25.72245,-29.46083l463.64569,0c14.23192,0 25.78078,13.19845 25.78078,29.46083zm0,130.09905c0,16.3213 -11.54885,29.46083 -25.78078,29.46083l-463.64569,0c-14.23192,0 -25.72245,-13.13953 -25.72245,-29.46083c0,-16.20346 11.54885,-29.46083 25.72245,-29.46083l463.64569,0c14.23192,0 25.78078,13.19845 25.78078,29.46083z"/><path d="m812.63912,964.50001l-601.33403,0a126.2004,128.00094 0 0 1 -126.0331,-127.88781l0,-649.28094a126.2004,128.00094 0 0 1 126.0331,-127.83125l601.33403,0a126.25617,128.0575 0 0 1 126.08886,127.83125l0,649.28094a126.25617,128.0575 0 0 1 -126.08886,127.88781zm-601.33403,-848.43751c-38.75797,0 -70.26624,31.95781 -70.26624,71.26875l0,649.28094c0,39.31094 31.50827,71.32531 70.26624,71.32531l601.33403,0c38.75797,0 70.32201,-31.95781 70.32201,-71.32531l0,-649.28094c0,-39.31094 -31.50827,-71.26875 -70.32201,-71.26875l-601.33403,0z"/><path d="m349.61974,456.88983c-69.75975,0 -126.45413,-57.33078 -126.45413,-127.74218s56.75271,-127.74218 126.45413,-127.74218s126.45413,57.33078 126.45413,127.74218s-56.69438,127.74218 -126.45413,127.74218zm0,-196.62161a68.1849,68.87943 0 1 0 0.05833,137.69994a68.1849,68.87943 0 0 0 -0.05833,-137.69994z"/></svg>',
    };
  };

  static get sanitize() {
    return {
      'title': {
        'span': true,
      },
      'content': {
        'br': true,
      },
    };
  };

  #gap = 20;
  #layout = 0;
  #paddingTop = 0;
  #paddingBottom = 0;
  #imageWidth = '50%';
  #alignItems = 'top';
  #textAlign = 'left';
  #image = {
    'uploadid': 0,
    'fileurl': null,
  };
  #title = '';
  #titleless = false;
  #content = '';
  #stretchable = true;

  #getLayoutOptions() {
    let result = [];
    result.push({'text': this.api.i18n.t('Left image, right text'), 'value': 0});
    result.push({'text': this.api.i18n.t('Left text, right image'), 'value': 1});
    return result;
  };

  #getWidthOptions() {
    let result = [];
    for (let i = 3; i <= 7; i ++)
    {
      result.push({'text': (i * 10) + '%', 'value': (i * 10) + '%'});
    };
    return result;
  };

  #getAlignItemsOptions() {
    let result = [];
    result.push({'text': this.api.i18n.t('Top'), 'value': 'top'});
    result.push({'text': this.api.i18n.t('Middle'), 'value': 'middle'});
    result.push({'text': this.api.i18n.t('Bottom'), 'value': 'bottom'});
    return result;
  };

  #getTextAlignOptions() {
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
      wrapper.style.setProperty('--text-gap', this.#gap + 'px');
      wrapper.style.setProperty('--padding-top', this.#paddingTop + 'px');
      wrapper.style.setProperty('--padding-bottom', this.#paddingBottom + 'px');
      wrapper.dataset.layout = this.#layout;
      wrapper.dataset.titleless = this.#titleless == true? 1: 0;
      wrapper.dataset.stretchable = this.#stretchable == true? 1: 0;
      wrapper.dataset.alignItems = this.#alignItems;
      wrapper.dataset.textAlign = this.#textAlign;
      wrapper.dataset.imageWidth = this.#imageWidth;
      if (fileurl != null)
      {
        let img = document.createElement('img');
        img.setAttribute('src', fileurl);
        image.append(img);
      };
      let titleInspector = new htmlInspector(this.#title, 'block-editor');
      let contentInspector = new htmlInspector(this.#content, 'block-editor');
      wrapper.querySelector('div.text div.title').innerHTML = titleInspector.getFilteredHTML();
      wrapper.querySelector('div.text div.content').innerHTML = contentInspector.getFilteredHTML();
    };
  };

  #updateSettings(el) {
    let gapEl = el.querySelector('[name=gap]');
    let imageEl = el.querySelector('[name=image]');
    let layoutEl = el.querySelector('[name=layout]');
    let titlelessEl = el.querySelector('[name=titleless]');
    let stretchableEl = el.querySelector('[name=stretchable]');
    let paddingTopEl = el.querySelector('[name=paddingTop]');
    let paddingBottomEl = el.querySelector('[name=paddingBottom]');
    let imageWidthEl = el.querySelector('[name=imageWidth]');
    let alignItemsEl = el.querySelector('[name=alignItems]');
    let textAlignEl = el.querySelector('[name=textAlign]');
    if (gapEl != null)
    {
      this.#gap = Number.parseInt(gapEl.value);
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
    if (layoutEl != null)
    {
      this.#layout = Number.parseInt(layoutEl.value);
    };
    if (paddingTopEl != null)
    {
      this.#paddingTop = Number.parseInt(paddingTopEl.value);
    };
    if (paddingBottomEl != null)
    {
      this.#paddingBottom = Number.parseInt(paddingBottomEl.value);
    };
    if (titlelessEl != null)
    {
      this.#titleless = Number.parseInt(titlelessEl.value) == 1? true: false;
    };
    if (stretchableEl != null)
    {
      this.#stretchable = Number.parseInt(stretchableEl.value) == 1? true: false;
    };
    if (imageWidthEl != null)
    {
      try
      {
        let tempArr = JSON.parse(imageWidthEl.value);
        if (Array.isArray(tempArr) && tempArr.length === 1)
        {
          this.#imageWidth = tempArr.pop();
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
    if (textAlignEl != null)
    {
      try
      {
        let tempArr = JSON.parse(textAlignEl.value);
        if (Array.isArray(tempArr) && tempArr.length === 1)
        {
          this.#textAlign = tempArr.pop();
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
    this.#layout = data.hasOwnProperty('layout')? data.layout: 0;
    this.#paddingTop = data.hasOwnProperty('paddingTop')? data.paddingTop: 0;
    this.#paddingBottom = data.hasOwnProperty('paddingBottom')? data.paddingBottom: 0;
    this.#imageWidth = data.hasOwnProperty('imageWidth')? data.imageWidth: '50%';
    this.#alignItems = data.hasOwnProperty('alignItems')? data.alignItems: 'top';
    this.#textAlign = data.hasOwnProperty('textAlign')? data.textAlign: 'left';
    if (data.hasOwnProperty('image'))
    {
      if (data.image.hasOwnProperty('uploadid') && data.image.hasOwnProperty('fileurl'))
      {
        this.#image.uploadid = data.image.uploadid;
        this.#image.fileurl = data.image.fileurl;
      };
    };
    this.#title = data.hasOwnProperty('title')? data.title: '';
    this.#titleless = data.hasOwnProperty('titleless')? data.titleless: false;
    this.#content = data.hasOwnProperty('content')? data.content: '';
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
          currentUploader.setHeaders(that.config.getGlobalHeaders());
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
      item3H4.innerText = this.api.i18n.t('Gap between image and text(px)');
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
      if (this.config.withGlobalHeaders != null)
      {
        itemInput.setAttribute('with-global-headers', this.config.withGlobalHeaders);
      };
      itemField.append(itemInput);
      item.append(itemH4, itemField);
      result.append(item);
      return result;
    };
    const renderContentRow3 = () => {
      let result = document.createElement('div');
      let item1 = document.createElement('div');
      let item2 = document.createElement('div');
      let item3 = document.createElement('div');
      result.classList.add('row');
      item1.classList.add('item');
      item1.setAttribute('size', 's');
      let item1H4 = document.createElement('h4');
      let item1Field = document.createElement('div');
      let item1Input = document.createElement('jtbc-field-selector');
      item1H4.innerText = this.api.i18n.t('Graphic layout');
      item1Field.classList.add('field');
      item1Input.setAttribute('name', 'layout');
      item1Input.setAttribute('width', '160');
      item1Input.setAttribute('placeholder', this.api.i18n.t('Left image, right text'));
      item1Input.setAttribute('data', JSON.stringify(this.#getLayoutOptions()));
      item1Input.setAttribute('value', this.#layout);
      item1Field.append(item1Input);
      item1.append(item1H4, item1Field);
      item2.classList.add('item');
      item2.setAttribute('size', 's');
      let item2H4 = document.createElement('h4');
      let item2Field = document.createElement('div');
      let item2Input = document.createElement('jtbc-field-switch');
      item2H4.innerText = this.api.i18n.t('Don\'t show the title');
      item2Field.classList.add('field');
      item2Input.setAttribute('name', 'titleless');
      item2Input.setAttribute('value', this.#titleless === true? 1: 0);
      item2Field.append(item2Input);
      item2.append(item2H4, item2Field);
      item3.classList.add('item');
      item3.setAttribute('size', 's');
      let item3H4 = document.createElement('h4');
      let item3Field = document.createElement('div');
      let item3Input = document.createElement('jtbc-field-switch');
      item3H4.innerText = this.api.i18n.t('Image adaptive height');
      item3Field.classList.add('field');
      item3Input.setAttribute('name', 'stretchable');
      item3Input.setAttribute('value', this.#stretchable === true? 1: 0);
      item3Field.append(item3Input);
      item3.append(item3H4, item3Field);
      result.append(item1, item2, item3);
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
      itemH4.innerText = this.api.i18n.t('Graphic alignment');
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
    const renderContentRow5 = () => {
      let result = document.createElement('div');
      let item = document.createElement('div');
      result.classList.add('row');
      item.classList.add('item');
      let itemH4 = document.createElement('h4');
      let itemField = document.createElement('div');
      let itemInput = document.createElement('jtbc-field-flat-selector');
      itemH4.innerText = this.api.i18n.t('Image width');
      itemField.classList.add('field');
      itemInput.setAttribute('name', 'imageWidth');
      itemInput.setAttribute('type', 'radio');
      itemInput.setAttribute('columns', '5');
      itemInput.setAttribute('data', JSON.stringify(this.#getWidthOptions()));
      itemInput.setAttribute('value', JSON.stringify([this.#imageWidth]));
      itemField.append(itemInput);
      item.append(itemH4, itemField);
      result.append(item);
      return result;
    };
    const renderContentRow6 = () => {
      let result = document.createElement('div');
      let item = document.createElement('div');
      result.classList.add('row');
      item.classList.add('item');
      let itemH4 = document.createElement('h4');
      let itemField = document.createElement('div');
      let itemInput = document.createElement('jtbc-field-flat-selector');
      itemH4.innerText = this.api.i18n.t('Text alignment');
      itemField.classList.add('field');
      itemInput.setAttribute('name', 'textAlign');
      itemInput.setAttribute('type', 'radio');
      itemInput.setAttribute('columns', '5');
      itemInput.setAttribute('data', JSON.stringify(this.#getTextAlignOptions()));
      itemInput.setAttribute('value', JSON.stringify([this.#textAlign]));
      itemField.append(itemInput);
      item.append(itemH4, itemField);
      result.append(item);
      return result;
    };
    if (this.config.withGlobalHeaders != null)
    {
      let state = {};
      state[this.config.withGlobalHeaders] = this.config.getGlobalHeaders();
      this.config.iWindow.getBroadcaster('fetch').tryPublish(this.config.iWindow.JSON.parse(JSON.stringify(state)));
    };
    let settings = document.createElement('div');
    settings.classList.add('settings');
    let h3 = document.createElement('h3');
    let close = document.createElement('div');
    let content = document.createElement('div');
    let footer = document.createElement('div');
    h3.innerText = this.api.i18n.t('Mixed text settings');
    close.classList.add('close');
    let closeSvg = document.createElement('jtbc-svg');
    closeSvg.setAttribute('name', 'close');
    close.append(closeSvg);
    content.classList.add('content');
    content.append(renderContentRow1(), renderContentRow2(), renderContentRow3(), renderContentRow4(), renderContentRow5(), renderContentRow6());
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
    let image = document.createElement('div');
    let text = document.createElement('div');
    let textTitle = document.createElement('div');
    let textContent = document.createElement('div');
    let icons = document.createElement('div');
    wrapper.classList.add('block_mixed_text');
    image.classList.add('image');
    text.classList.add('text');
    textTitle.classList.add('title');
    textTitle.setAttribute('contenteditable', 'true');
    textTitle.setAttribute('placeholder', this.api.i18n.t('Here is the title'));
    textContent.classList.add('content');
    textContent.setAttribute('contenteditable', 'true');
    textContent.setAttribute('placeholder', this.api.i18n.t('Here is the content'));
    textTitle.addEventListener('keydown', e => {
      if (e.key == 'Enter')
      {
        e.preventDefault();
        e.stopPropagation();
        e.target.parentElement.querySelector('div.content')?.focus();
      };
    });
    textContent.addEventListener('keydown', e => {
      if (e.key == 'Enter')
      {
        e.preventDefault();
        e.stopPropagation();
        let selection = this.config.iWindow.getSelection();
        if (selection.rangeCount === 1)
        {
          let range = selection.getRangeAt(0);
          let br = document.createElement('br');
          let newRange = document.createRange();
          range.insertNode(br);
          newRange.setStartAfter(br);
          selection.removeAllRanges();
          selection.addRange(newRange);
        };
      };
    });
    text.append(textTitle, textContent);
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
    wrapper.append(image, text, icons);
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
    let wrapper = this.wrapper;
    let title = wrapper.querySelector('div.title');
    let content = wrapper.querySelector('div.content');
    this.#title = title.dataset.empty == 'true'? '': title.innerHTML;
    this.#content = content.dataset.empty == 'true'? '': content.innerHTML;
    return {
      'gap': this.#gap,
      'layout': this.#layout,
      'paddingTop': this.#paddingTop,
      'paddingBottom': this.#paddingBottom,
      'imageWidth': this.#imageWidth,
      'alignItems': this.#alignItems,
      'textAlign': this.#textAlign,
      'image': this.#image,
      'title': this.#title,
      'titleless': this.#titleless,
      'content': this.#content,
      'stretchable': this.#stretchable,
    };
  };

  constructor({data, api, config}) {
    this.data = data;
    this.api = api;
    this.config = config || {};
    this.#initData(this.data);
  };
};