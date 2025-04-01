import uploader from '../../../../library/upload/uploader.js';
import htmlInspector from '../../../../library/html/htmlInspector.js';

export default class diagramPlugin {
  static get toolbox() {
    return {
      title: 'Diagram',
      icon: '<svg width="24" height="24" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M800.16 960.096H224a96 96 0 0 1-96-96V160a96 96 0 0 1 96-96h576.16a96 96 0 0 1 96 96v704.096a96 96 0 0 1-96 96z m0-64a32 32 0 0 0 32-32V160a32 32 0 0 0-32-32H224a32 32 0 0 0-32 32v704.096a32 32 0 0 0 32 32h576.16z"></path><path d="M256 704.064v-64h512v64H256z m263.904-187.552l-92.576 48.736a24 24 0 0 1-34.848-25.28l17.696-103.296-74.944-73.12a24 24 0 0 1 13.312-40.928l103.552-15.04 46.304-93.952a24 24 0 0 1 43.04 0l46.304 93.952 103.52 15.04a24 24 0 0 1 13.312 40.96l-74.912 73.088 17.664 103.264a24 24 0 0 1-34.848 25.28l-92.576-48.704z m-11.2-48.384a24 24 0 0 1 22.4 0l60.704 32-11.584-67.776a24 24 0 0 1 6.88-21.216l49.184-48-67.936-9.856a24 24 0 0 1-18.08-13.152l-30.368-61.6-30.336 61.6a24 24 0 0 1-18.08 13.12l-67.936 9.92 49.152 47.968a24 24 0 0 1 6.912 21.216L448 500.096l60.736-31.968zM256 832.064v-64h512v64H256z"></path></svg>',
    };
  };

  #gap = 20;
  #paddingTop = 0;
  #paddingBottom = 0;
  #justifyContent = 'left';
  #textAlign = 'left';
  #imageSize = 'm';
  #borderless = false;
  #titleless = false;
  #subtitleless = false;
  #items = [];

  #getImageSizeOptions() {
    let result = [];
    result.push({'text': this.api.i18n.t('XS'), 'value': 'xs'});
    result.push({'text': this.api.i18n.t('S'), 'value': 's'});
    result.push({'text': this.api.i18n.t('M'), 'value': 'm'});
    result.push({'text': this.api.i18n.t('L'), 'value': 'l'});
    result.push({'text': this.api.i18n.t('XL'), 'value': 'xl'});
    return result;
  };

  #getJustifyContentOptions() {
    let result = [];
    result.push({'text': this.api.i18n.t('Left'), 'value': 'left'});
    result.push({'text': this.api.i18n.t('Center'), 'value': 'center'});
    result.push({'text': this.api.i18n.t('Right'), 'value': 'right'});
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
      wrapper.querySelector('div.items').empty();
      wrapper.style.setProperty('--image-gap', this.#gap + 'px');
      wrapper.style.setProperty('--padding-top', this.#paddingTop + 'px');
      wrapper.style.setProperty('--padding-bottom', this.#paddingBottom + 'px');
      wrapper.dataset.justifyContent = this.#justifyContent;
      wrapper.dataset.textAlign = this.#textAlign;
      wrapper.dataset.imageSize = this.#imageSize;
      wrapper.dataset.borderless = this.#borderless == true? 1: 0;
      wrapper.dataset.titleless = this.#titleless == true? 1: 0;
      wrapper.dataset.subtitleless = this.#subtitleless == true? 1: 0;
      wrapper.dataset.textless = (this.#titleless == true && this.#subtitleless == true)? 1: 0;
      if (this.#items.length === 0)
      {
        this.addItem();
      }
      else
      {
        this.#items.forEach(item => this.addItem(item.title, item.subtitle, item.image));
      };
    };
  };

  #updateSettings(el) {
    let gapEl = el.querySelector('[name=gap]');
    let paddingTopEl = el.querySelector('[name=paddingTop]');
    let paddingBottomEl = el.querySelector('[name=paddingBottom]');
    let justifyContentEl = el.querySelector('[name=justifyContent]');
    let textAlignEl = el.querySelector('[name=textAlign]');
    let imageSizeEl = el.querySelector('[name=imageSize]');
    let borderlessEl = el.querySelector('[name=borderless]');
    let titlelessEl = el.querySelector('[name=titleless]');
    let subtitlelessEl = el.querySelector('[name=subtitleless]');
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
    if (justifyContentEl != null)
    {
      try
      {
        let tempArr = JSON.parse(justifyContentEl.value);
        if (Array.isArray(tempArr) && tempArr.length === 1)
        {
          this.#justifyContent = tempArr.pop();
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
    if (imageSizeEl != null)
    {
      try
      {
        let tempArr = JSON.parse(imageSizeEl.value);
        if (Array.isArray(tempArr) && tempArr.length === 1)
        {
          this.#imageSize = tempArr.pop();
        };
      }
      catch(e)
      {
        throw new Error('Unexpected value');
      };
    };
    if (borderlessEl != null)
    {
      this.#borderless = Number.parseInt(borderlessEl.value) == 1? true: false;
    };
    if (titlelessEl != null)
    {
      this.#titleless = Number.parseInt(titlelessEl.value) == 1? true: false;
    };
    if (subtitlelessEl != null)
    {
      this.#subtitleless = Number.parseInt(subtitlelessEl.value) == 1? true: false;
    };
    this.#setData();
  };

  #initData(data) {
    this.#gap = data.hasOwnProperty('gap')? data.gap: 20;
    this.#paddingTop = data.hasOwnProperty('paddingTop')? data.paddingTop: 0;
    this.#paddingBottom = data.hasOwnProperty('paddingBottom')? data.paddingBottom: 0;
    this.#justifyContent = data.hasOwnProperty('justifyContent')? data.justifyContent: 'left';
    this.#textAlign = data.hasOwnProperty('textAlign')? data.textAlign: 'left';
    this.#imageSize = data.hasOwnProperty('imageSize')? data.imageSize: 'm';
    this.#borderless = data.hasOwnProperty('borderless')? data.borderless: false;
    this.#titleless = data.hasOwnProperty('titleless')? data.titleless: false;
    this.#subtitleless = data.hasOwnProperty('subtitleless')? data.subtitleless: false;
    if (data.hasOwnProperty('items') && Array.isArray(data.items))
    {
      this.#items = data.items;
    };
  };

  #initEvents() {
    let that = this;
    let wrapper = this.wrapper;
    wrapper.delegateEventListener('div.icon[icon=add]', 'click', e => this.addItem());
    wrapper.delegateEventListener('div.icon[icon=setting]', 'click', e => this.showSettings());
    wrapper.delegateEventListener('div.item div.image', 'click', function(){
      if (this.classList.contains('empty'))
      {
        this.parentElement.querySelector('input.file').click();
      };
    });
    wrapper.delegateEventListener('div.item input.file', 'change', function(){
      let image = this.parentElement.querySelector('div.image');
      if (!image.classList.contains('uploading') && this.files.length == 1)
      {
        image.classList.remove('empty');
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
              image.dataset.uploadid = data.param.uploadid;
              image.dataset.fileurl = data.param.fileurl + (that.config.tail ?? '');
              img.setAttribute('src', image.dataset.fileurl);
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
    wrapper.delegateEventListener('div.item div.icon[icon=arrow_left]', 'click', function(){
      let item = this.parentElement.parentElement;
      let prevEl = item.previousElementSibling;
      if (prevEl != null)
      {
        prevEl.before(item);
      };
    });
    wrapper.delegateEventListener('div.item div.icon[icon=arrow_right]', 'click', function(){
      let item = this.parentElement.parentElement;
      let nextEl = item.nextElementSibling;
      if (nextEl != null)
      {
        nextEl.after(item);
      };
    });
    wrapper.delegateEventListener('div.item div.icon[icon=trash]', 'click', function(){
      let item = this.parentElement.parentElement;
      if (!this.classList.contains('on'))
      {
        this.classList.add('on');
      }
      else
      {
        let image = item.querySelector('div.image');
        if (image.classList.contains('empty'))
        {
          if (item.parentElement.querySelectorAll('div.item').length != 1)
          {
            item.remove();
          }
          else
          {
            that.api.blocks.delete(that.api.blocks.getCurrentBlockIndex());
          };
        }
        else
        {
          this.classList.remove('on');
          image.empty().classList.add('empty');
          let img = document.createElement('img');
          img.setAttribute('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=');
          image.append(img);
        };
      };
    });
  };

  addItem(title, subtitle, imgFile) {
    let item = document.createElement('div');
    item.classList.add('item');
    let image = document.createElement('div');
    let text = document.createElement('div');
    let textTitle = document.createElement('div');
    let textSubtitle = document.createElement('div');
    let file = document.createElement('input');
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
    image.classList.add('image');
    text.classList.add('text');
    textTitle.classList.add('title');
    textTitle.setAttribute('contenteditable', 'true');
    textTitle.setAttribute('placeholder', this.api.i18n.t('Here is the title'));
    textSubtitle.classList.add('subtitle');
    textSubtitle.setAttribute('contenteditable', 'true');
    textSubtitle.setAttribute('placeholder', this.api.i18n.t('Here is the subtitle'));
    if (typeof(title) == 'string')
    {
      let inspector = new htmlInspector(title, 'block-editor');
      textTitle.innerHTML = inspector.getFilteredHTML();
    };
    if (typeof(subtitle) == 'string')
    {
      let inspector = new htmlInspector(subtitle, 'block-editor');
      textSubtitle.innerHTML = inspector.getFilteredHTML();
    };
    if (typeof(imgFile) == 'object' && imgFile.hasOwnProperty('uploadid') && imgFile.hasOwnProperty('fileurl') && imgFile.fileurl != null)
    {
      image.dataset.uploadid = imgFile.uploadid;
      image.dataset.fileurl = imgFile.fileurl;
      let img = document.createElement('img');
      img.setAttribute('src', image.dataset.fileurl);
      image.append(img);
    }
    else
    {
      let img = document.createElement('img');
      img.setAttribute('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=');
      image.append(img);
      image.classList.add('empty');
    };
    textTitle.addEventListener('keydown', e => {
      if (e.key == 'Enter')
      {
        e.preventDefault();
        e.stopPropagation();
        e.target.parentElement.querySelector('div.subtitle')?.focus();
      };
    });
    textSubtitle.addEventListener('keydown', e => {
      if (e.key == 'Enter')
      {
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey == false)
        {
          let nextEl = e.target.parentElement.parentElement.nextElementSibling;
          if (nextEl != null)
          {
            nextEl.querySelector('div.title')?.focus();
          }
          else
          {
            this.api.caret.setToNextBlock('start', 0);
          };
        };
      };
    });
    text.append(textTitle, textSubtitle);
    file.setAttribute('type', 'file');
    file.setAttribute('accept', 'image/*');
    file.classList.add('file');
    item.append(image, text, file, renderButtons());
    this.wrapper.querySelector('div.items').append(item);
    item.scrollIntoView({'behavior': 'smooth'});
    return this;
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
      let itemInput = document.createElement('jtbc-field-flat-selector');
      itemH4.innerText = this.api.i18n.t('Image size');
      itemField.classList.add('field');
      itemInput.setAttribute('name', 'imageSize');
      itemInput.setAttribute('type', 'radio');
      itemInput.setAttribute('columns', '5');
      itemInput.setAttribute('data', JSON.stringify(this.#getImageSizeOptions()));
      itemInput.setAttribute('value', JSON.stringify([this.#imageSize]));
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
      itemH4.innerText = this.api.i18n.t('Image alignment');
      itemField.classList.add('field');
      itemInput.setAttribute('name', 'justifyContent');
      itemInput.setAttribute('type', 'radio');
      itemInput.setAttribute('columns', '5');
      itemInput.setAttribute('data', JSON.stringify(this.#getJustifyContentOptions()));
      itemInput.setAttribute('value', JSON.stringify([this.#justifyContent]));
      itemField.append(itemInput);
      item.append(itemH4, itemField);
      result.append(item);
      return result;
    };
    const renderContentRow4 = () => {
      let result = document.createElement('div');
      let item1 = document.createElement('div');
      let item2 = document.createElement('div');
      let item3 = document.createElement('div');
      result.classList.add('row');
      item1.classList.add('item');
      item1.setAttribute('size', 's');
      let item1H4 = document.createElement('h4');
      let item1Field = document.createElement('div');
      let item1Input = document.createElement('jtbc-field-switch');
      item1H4.innerText = this.api.i18n.t('Don\'t show the border');
      item1Field.classList.add('field');
      item1Input.setAttribute('name', 'borderless');
      item1Input.setAttribute('value', this.#borderless === true? 1: 0);
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
      item3H4.innerText = this.api.i18n.t('Don\'t show the subtitle');
      item3Field.classList.add('field');
      item3Input.setAttribute('name', 'subtitleless');
      item3Input.setAttribute('value', this.#subtitleless === true? 1: 0);
      item3Field.append(item3Input);
      item3.append(item3H4, item3Field);
      result.append(item1, item2, item3);
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
    let settings = document.createElement('div');
    settings.classList.add('settings');
    let h3 = document.createElement('h3');
    let close = document.createElement('div');
    let content = document.createElement('div');
    let footer = document.createElement('div');
    h3.innerText = this.api.i18n.t('Diagram settings');
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
    let items = document.createElement('div');
    let icons = document.createElement('div');
    wrapper.classList.add('block_diagram');
    items.classList.add('items');
    icons.classList.add('icons');
    ['add', 'setting'].forEach(item => {
      let icon = document.createElement('div');
      let svg = document.createElement('jtbc-svg');
      svg.setAttribute('name', item);
      icon.classList.add('icon');
      icon.setAttribute('icon', item);
      icon.append(svg);
      icon.setAttribute('title', this.api.i18n.t(item.charAt(0).toUpperCase() + item.slice(1)));
      icons.append(icon);
    });
    wrapper.append(items, icons);
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
    this.#items = [];
    let items = this.wrapper.querySelector('div.items');
    if (items != null)
    {
      items.querySelectorAll('div.item').forEach(item => {
        let image = item.querySelector('div.image');
        let title = item.querySelector('div.title');
        let subtitle = item.querySelector('div.subtitle');
        let data = {
          'image': {
            'uploadid': 0,
            'fileurl': null,
          },
          'title': title.innerHTML,
          'subtitle': subtitle.innerHTML,
        };
        if (!image.classList.contains('empty') && !image.classList.contains('uploading'))
        {
          data.image.uploadid = image.dataset.uploadid;
          data.image.fileurl = image.dataset.fileurl;
        };
        this.#items.push(data);
      });
    };
    return {
      'gap': this.#gap,
      'paddingTop': this.#paddingTop,
      'paddingBottom': this.#paddingBottom,
      'justifyContent': this.#justifyContent,
      'textAlign': this.#textAlign,
      'imageSize': this.#imageSize,
      'borderless': this.#borderless,
      'titleless': this.#titleless,
      'subtitleless': this.#subtitleless,
      'items': this.#items,
    };
  };

  constructor({data, api, config}) {
    this.data = data;
    this.api = api;
    this.config = config || {};
    this.#initData(this.data);
  };
};