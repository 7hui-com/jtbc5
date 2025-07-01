import uploader from '../../../../library/upload/uploader.js';

export default class attachmentPlugin {
  static get toolbox() {
    return {
      title: 'Attachment',
      icon: '<svg width="24" height="24" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="m837.79078,470.4724l-317.70316,333.10311a183.36953,192.50764 0 0 1 -259.60182,-272.53891l314.40664,-330.07489a108.37346,113.77418 0 0 1 153.70075,161.36034l-291.33092,305.41661a33.78944,35.47332 0 1 1 -47.7997,-50.18177l264.95867,-276.86492l-58.10135,-61.86201l-264.95868,278.16273a116.20272,121.99361 0 0 0 164.82655,173.04057l291.33092,-305.84921a190.78673,200.29446 0 0 0 -271.13967,-284.21915l-313.99457,330.50749a265.78281,279.02793 0 0 0 375.80453,394.53251l317.70317,-333.5357l-58.10136,-60.99681z"></path></svg>',
    };
  };

  #paddingTop = 0;
  #paddingBottom = 0;
  #files = [];

  #setData() {
    let wrapper = this.wrapper;
    if (wrapper != null)
    {
      wrapper.querySelector('div.attachment').empty();
      wrapper.style.setProperty('--padding-top', this.#paddingTop + 'px');
      wrapper.style.setProperty('--padding-bottom', this.#paddingBottom + 'px');
      this.#files.forEach(file => this.addFile(file));
    };
  };

  #updateSettings(el) {
    let files = [];
    let paddingTopEl = el.querySelector('[name=paddingTop]');
    let paddingBottomEl = el.querySelector('[name=paddingBottom]');
    if (paddingTopEl != null)
    {
      this.#paddingTop = Number.parseInt(paddingTopEl.value);
    };
    if (paddingBottomEl != null)
    {
      this.#paddingBottom = Number.parseInt(paddingBottomEl.value);
    };
    el.querySelectorAll('tr.file').forEach(tr => {
      let url = tr.querySelector('[name=url');
      let name = tr.querySelector('[name=name]');
      if (name != null && url != null)
      {
        let file = {'filename': name.value, 'uploadid': 0, 'fileurl': ''};
        if (url.value.length != 0)
        {
          try
          {
            let data = JSON.parse(url.value);
            if (data.hasOwnProperty('uploadid') && data.hasOwnProperty('fileurl'))
            {
              file.fileurl = data.fileurl;
              file.uploadid = Number.parseInt(data.uploadid);
            };
          }
          catch(e) {};
        };
        files.push(file);
      };
    });
    this.#files = files;
    this.#setData();
  };

  #initData(data) {
    this.#paddingTop = data.hasOwnProperty('paddingTop')? data.paddingTop: 0;
    this.#paddingBottom = data.hasOwnProperty('paddingBottom')? data.paddingBottom: 0;
    this.#files = data.hasOwnProperty('files')? data.files: [];
  };

  #initEvents() {
    let that = this;
    let wrapper = this.wrapper;
    wrapper.delegateEventListener('div.attachment', 'click', function(){
      if (this.childElementCount === 0)
      {
        this.parentElement.querySelector('input.file').click();
      };
    });
    wrapper.delegateEventListener('div.attachment div.filename > a', 'keydown', e => {
      if (e.key == 'Enter')
      {
        e.preventDefault();
        e.stopPropagation();
      };
    });
    wrapper.delegateEventListener('div.attachment div.filename > a', 'input', e => {
      let item = e.target.parentElement.parentElement;
      if (item.classList.contains('file'))
      {
        let fileIndex = item.index();
        if (that.#files.length >= fileIndex)
        {
          that.#files[fileIndex - 1].filename = e.target.innerText;
        };
      };
    });
    wrapper.delegateEventListener('div.icon[icon=upload]', 'click', function(){
      this.parentElement.querySelector('input.file').click();
    });
    wrapper.delegateEventListener('div.icon[icon=setting]', 'click', e => this.showSettings());
    wrapper.delegateEventListener('input.file', 'change', function(){
      let files = this.files;
      let attachment = wrapper.querySelector('div.attachment');
      if (files.length != 0)
      {
        let currentIndex = 0;
        attachment.classList.add('uploading');
        const uploadNextFile = () => {
          let currentUploader = new uploader(that.config.action);
          currentUploader.setHeaders(that.config.getGlobalHeaders());
          currentUploader.upload(files[currentIndex], percent => {
            wrapper.style.setProperty('--uploading-width', percent + '%');
          }, data => {
            wrapper.style.setProperty('--uploading-width', '100%');
            if (data.code == 1)
            {
              that.addFile(data.param, true);
            }
            else
            {
              that.config.miniMessage.push(data.message);
            };
            currentIndex += 1;
            if (currentIndex < files.length)
            {
              uploadNextFile();
            }
            else
            {
              this.value = null;
              attachment.classList.remove('uploading');
            };
          });
        };
        uploadNextFile();
      };
    });
  };

  addFile(file, isNew = false) {
    let attachment = this.wrapper.querySelector('div.attachment');
    if (file.hasOwnProperty('filename') && file.hasOwnProperty('uploadid') && file.hasOwnProperty('fileurl'))
    {
      let extension = 'others';
      let fileurl = file.fileurl;
      let uploadid = file.uploadid
      let filename = file.filename;
      if (fileurl.includes('/'))
      {
        let name = fileurl.substring(fileurl.lastIndexOf('/') + 1);
        if (name.includes('.'))
        {
          extension = name.substring(name.lastIndexOf('.') + 1).toLowerCase();
        };
      };
      let iDocument = this.config.iDocument;
      let item = iDocument.createElement('div');
      let itemExtension = iDocument.createElement('div');
      let itemFilename = iDocument.createElement('div');
      item.classList.add('file');
      let itemIcon = iDocument.createElement('jtbc-file-icons');
      itemIcon.setAttribute('icon', extension);
      itemExtension.classList.add('extension');
      itemExtension.append(itemIcon);
      let itemLink = iDocument.createElement('a');
      itemLink.innerText = filename;
      itemLink.setAttribute('contenteditable', 'true');
      itemLink.setAttribute('href', fileurl);
      itemLink.setAttribute('target', '_blank');
      itemFilename.classList.add('filename');
      itemFilename.append(itemLink);
      item.append(itemExtension, itemFilename);
      item.loadComponents();
      attachment.append(item);
      if (isNew === true)
      {
        this.#files.push({'filename': filename, 'uploadid': Number.parseInt(uploadid), 'fileurl': fileurl});
      };
    }
    else
    {
      throw new Error('Unexpected value');
    };
  };

  showSettings() {
    const createRow = file => {
      let tr = document.createElement('tr');
      let td1 = document.createElement('td');
      let td2 = document.createElement('td');
      let td3 = document.createElement('td');
      let input1 = document.createElement('input');
      let input2 = document.createElement('jtbc-field-upload');
      let icons = document.createElement('div');
      input1.style.width = '100%';
      input1.setAttribute('type', 'text');
      input1.setAttribute('name', 'name');
      input1.setAttribute('value', file.filename);
      td1.append(input1);
      input2.setAttribute('width', '100%');
      input2.setAttribute('name', 'url');
      input2.setAttribute('whisper', 'true');
      input2.setAttribute('action', this.config.action);
      input2.setAttribute('tail', this.config.tail ?? '');
      input2.setAttribute('text-upload', this.api.i18n.t('Upload'));
      input2.setAttribute('value', JSON.stringify({'uploadid': file.uploadid, 'fileurl': file.fileurl}));
      if (this.config.withGlobalHeaders != null)
      {
        input2.setAttribute('with-global-headers', this.config.withGlobalHeaders);
      };
      td2.append(input2);
      icons.classList.add('icons');
      let iconTitles = {
        'arrow_up': this.api.i18n.t('Move up'),
        'arrow_down': this.api.i18n.t('Move down'),
        'trash': this.api.i18n.t('Delete'),
      };
      ['arrow_up', 'arrow_down', 'trash'].forEach(name => {
        let icon = document.createElement('div');
        let iconSvg = document.createElement('jtbc-svg');
        icon.classList.add('icon');
        icon.classList.add(name);
        icon.setAttribute('title', iconTitles[name]);
        iconSvg.setAttribute('name', name);
        icon.append(iconSvg);
        icons.append(icon);
      });
      td3.append(icons);
      tr.classList.add('file');
      tr.append(td1, td2, td3);
      return tr;
    };
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
      const renderBodyContent = tbody => {
        this.#files.forEach(file => tbody.append(createRow(file)));
      };
      const renderFootContent = tfoot => {
        let tr = document.createElement('tr');
        let td = document.createElement('td');
        td.setAttribute('colspan', '3');
        td.innerText = this.api.i18n.t('No data');
        tr.append(td);
        tfoot.append(tr);
      };
      result.classList.add('row');
      item.classList.add('item');
      let itemH4 = document.createElement('h4');
      let itemField = document.createElement('div');
      itemH4.innerText = this.api.i18n.t('Files');
      itemField.classList.add('field');
      let table = document.createElement('table');
      let thead = document.createElement('thead');
      let tbody = document.createElement('tbody');
      let tfoot = document.createElement('tfoot');
      table.classList.add('table');
      let theadTr = document.createElement('tr');
      let theadTh1 = document.createElement('th');
      let theadTh2 = document.createElement('th');
      let theadTh3 = document.createElement('th');
      let icons = document.createElement('div');
      let icon = document.createElement('div');
      theadTh1.innerText = this.api.i18n.t('File name');
      theadTh2.innerText = this.api.i18n.t('File url');
      theadTh3.setAttribute('width', '90');
      icons.classList.add('icons');
      icon.classList.add('icon');
      icon.classList.add('add');
      icon.setAttribute('title', this.api.i18n.t('Add'));
      let iconAdd = document.createElement('jtbc-svg');
      iconAdd.setAttribute('name', 'add');
      icon.append(iconAdd);
      icons.append(icon);
      theadTh3.append(icons);
      theadTr.append(theadTh1, theadTh2, theadTh3);
      thead.append(theadTr);
      renderBodyContent(tbody);
      renderFootContent(tfoot);
      tbody.classList.add('tbody');
      table.append(thead, tbody, tfoot);
      itemField.append(table);
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
    let box = document.createElement('div');
    let content = document.createElement('div');
    let footer = document.createElement('div');
    h3.innerText = this.api.i18n.t('Attachment settings');
    close.classList.add('close');
    let closeSvg = document.createElement('jtbc-svg');
    closeSvg.setAttribute('name', 'close');
    close.append(closeSvg);
    box.classList.add('box');
    content.classList.add('content');
    content.append(renderContentRow1(), renderContentRow2());
    box.append(content);
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
    settings.append(h3, close, box, footer);
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
        settings.delegateEventListener('div.icon.add', 'click', e => {
          e.currentTarget.querySelector('tbody.tbody').append(createRow({'filename': '', 'uploadid': 0, 'fileurl': ''}));
        });
        settings.delegateEventListener('div.icon.arrow_up', 'click', function(){
          let tr = this.parentElement.parentElement.parentElement;
          tr.previousElementSibling?.before(tr);
        });
        settings.delegateEventListener('div.icon.arrow_down', 'click', function(){
          let tr = this.parentElement.parentElement.parentElement;
          tr.nextElementSibling?.after(tr);
        });
        settings.delegateEventListener('div.icon.trash', 'click', function(){
          if (!this.classList.contains('on'))
          {
            this.classList.add('on');
          }
          else
          {
            this.parentElement.parentElement.parentElement.remove();
          };
        });
        settings.delegateEventListener('[name=url]', 'uploaded', function(e){
          let tr = this.parentElement.parentElement;
          let nameInput = tr.querySelector('input[name=name]');
          if (nameInput != null && nameInput.value.length === 0)
          {
            nameInput.value = e?.detail?.filename;
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
    wrapper.classList.add('block_attachment');
    el.classList.add('attachment');
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
    file.setAttribute('multiple', 'multiple');
    file.classList.add('file');
    icons.append(file);
    wrapper.append(el, icons);
    this.#setData();
    this.#initEvents();
    return wrapper;
  };

  rendered() {
    this.block.holder.loadComponents();
    if (Object.keys(this.data).length == 0)
    {
      this.wrapper.scrollIntoView({'behavior': 'smooth'});
    };
  };

  save(blockContent) {
    return {
      'paddingTop': this.#paddingTop,
      'paddingBottom': this.#paddingBottom,
      'files': this.#files,
    };
  };

  constructor({data, api, config, block}) {
    this.data = data;
    this.api = api;
    this.config = config || {};
    this.block = block;
    this.#initData(this.data);
  };
};