export default class jtbcFieldAttachment extends HTMLElement {
  static get observedAttributes() {
    return ['text', 'partner', 'action', 'value', 'disabled', 'tail', 'width'];
  };

  #action = null;
  #value = null;
  #disabled = false;
  #uploading = false;
  #tail = null;

  get name() {
    return this.getAttribute('name');
  };

  get uploading() {
    return this.#uploading;
  };

  get value() {
    let result = '';
    if (this.inited == true)
    {
      let value = [];
      let container = this.container;
      container.querySelectorAll('tr.param').forEach(tr => {
        if (!tr.classList.contains('remove'))
        {
          value.push(JSON.parse(tr.getAttribute('param')));
        };
      });
      if (value.length != 0)
      {
        result = JSON.stringify(value);
      };
    }
    else
    {
      result = this.#value ?? '';
    };
    return result;
  };

  get partner() {
    let partner = null;
    let parentNode = this.parentNode;
    while (parentNode != null)
    {
      partner = parentNode.querySelectorAll("[name='" + this.currentPartner + "']");
      if (partner.length == 0)
      {
        partner = null;
        parentNode = parentNode.parentNode;
      }
      else
      {
        break;
      };
    };
    return partner;
  };

  get disabled() {
    return this.#disabled;
  };

  get tail() {
    return this.#tail;
  };

  set action(action) {
    this.container.querySelector('.progress')?.setAttribute('action', action);
  };

  set partner(partner) {
    this.setAttribute('partner', partner);
  };

  set value(value) {
    let container = this.container;
    let params = value? JSON.parse(value): [];
    if (this.inited == true && Array.isArray(params))
    {
      container.querySelectorAll('tr.param').forEach(tr => { tr.remove(); });
      params.forEach(param => { this.addUploadedItem(param); });
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
    let progress = container.querySelector('.progress');
    container.querySelector('.textUpload').addEventListener('click', function(){
      this.parentNode.querySelector('input.file').click();
    });
    container.querySelector('input.file').addEventListener('change', function(){
      if (that.uploading != true)
      {
        that.#uploading = true;
        progress.startUpload(this, (index, data) => {
          if (data.code == 1) that.addUploadedItem(data.param, that.tail);
        }, () => { that.#uploading = false; });
      };
    });
    container.delegateEventListener('input[name=all]', 'change', function(){
      container.querySelectorAll('input[name=item]').forEach(el => {
        el.checked = this.checked;
        el.dispatchEvent(new Event('change', {'bubbles': true}));
      });
    });
    container.delegateEventListener('input[name=item]', 'change', function(){
      this.parentNode.parentNode.classList.toggle('on', this.checked);
      that.#resetIcons();
    });
    container.delegateEventListener('.textInsert', 'click', function(){
      let partner = that.partner;
      if (partner != null)
      {
        if (this.getAttribute('mode') != 'batch')
        {
          let tr = this.parentNode.parentNode.parentNode;
          let param = JSON.parse(tr.getAttribute('param'));
          let filename = param.filename;
          let fileurl = param.fileurl;
          let filegroup = param.filegroup;
          partner.forEach(el => {
            if (el.contentType == 'markdown')
            {
              filename = filename.replaceAll('[', '\\[');
              filename = filename.replaceAll(']', '\\]');
              if (filegroup == 1)
              {
                el.insertContent('![' + filename + '](' + fileurl + ')');
              }
              else
              {
                el.insertContent('[' + filename + '](' + fileurl + ')');
              };
            }
            else
            {
              if (filegroup == 1)
              {
                let content = document.createElement('img');
                content.setAttribute('src', fileurl);
                el.insertContent(content.outerHTML);
              }
              else if (filegroup == 2)
              {
                let content = document.createElement('video');
                content.setAttribute('width', 480);
                content.setAttribute('width', 270);
                content.setAttribute('controls', 'controls');
                content.setAttribute('src', fileurl);
                el.insertContent(content.outerHTML);
              }
              else
              {
                let content = document.createElement('a');
                content.innerText = filename;
                content.setAttribute('href', fileurl);
                el.insertContent(content.outerHTML);
              };
            };
          });
        }
        else
        {
          partner.forEach(el => {
            let contentArr = [];
            container.querySelectorAll('input[name=item]:checked').forEach(item => {
              let tr = item.parentNode.parentNode;
              let param = JSON.parse(tr.getAttribute('param'));
              let filename = param.filename;
              let fileurl = param.fileurl;
              let filegroup = param.filegroup;
              if (el.contentType == 'markdown')
              {
                filename = filename.replaceAll('[', '\\[');
                filename = filename.replaceAll(']', '\\]');
                if (filegroup == 1)
                {
                  contentArr.push('![' + filename + '](' + fileurl + ')');
                }
                else
                {
                  contentArr.push('[' + filename + '](' + fileurl + ')');
                };
              }
              else
              {
                let p = document.createElement('p');
                if (filegroup == 1)
                {
                  let content = document.createElement('img');
                  content.setAttribute('src', fileurl);
                  p.append(content);
                }
                else if (filegroup == 2)
                {
                  let content = document.createElement('video');
                  content.setAttribute('width', 480);
                  content.setAttribute('width', 270);
                  content.setAttribute('controls', 'controls');
                  content.setAttribute('src', fileurl);
                  p.append(content);
                }
                else
                {
                  let content = document.createElement('a');
                  content.innerText = filename;
                  content.setAttribute('href', fileurl);
                  p.append(content);
                };
                contentArr.push(p.outerHTML);
              };
            });
            if (el.contentType == 'markdown')
            {
              el.insertContent(contentArr.join(String.fromCharCode(13, 10)));
            }
            else
            {
              el.insertContent(contentArr.join(''));
            };
          });
        };
      };
    });
    container.delegateEventListener('.textRemove', 'click', function(){
      if (this.getAttribute('mode') != 'batch')
      {
        this.parentNode.parentNode.parentNode.classList.toggle('remove');
      }
      else
      {
        container.querySelectorAll('input[name=item]:checked').forEach(item => item.parentNode.parentNode.classList.toggle('remove'));
      };
    });
    container.delegateEventListener('.textSelectFromDB', 'click', function(){
      if (!this.classList.contains('locked'))
      {
        if (that.materialExplorer != null)
        {
          this.classList.add('locked');
          materialExplorer.open(files => {
            files.forEach(item => {
              that.addUploadedItem(item);
            });
          }).then(() => { this.classList.remove('locked'); });
        };
      };
    });
    container.delegateEventListener('span.filename', 'click', function(){
      let tr = this.parentNode.parentNode;
      let param = JSON.parse(tr.getAttribute('param'));
      let input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('value', this.innerText);
      input.setAttribute('filename', this.innerText);
      input.classList.add('filename');
      this.replaceWith(input);
      input.select();
      input.addEventListener('blur', function(){
        let currentValue = this.value;
        if (currentValue.trim() == '')
        {
          currentValue = this.getAttribute('filename');
        };
        param.filename = currentValue;
        tr.setAttribute('param', JSON.stringify(param));
        let span = document.createElement('span');
        span.classList.add('filename');
        span.innerText = currentValue;
        this.replaceWith(span);
      });
    });
    if (this.imagePreviewer != null)
    {
      container.delegateEventListener('.attachment tr', 'dblclick', function(){
        if (this.hasAttribute('param'))
        {
          let param = JSON.parse(this.getAttribute('param'));
          if (param.filegroup == 1)
          {
            imagePreviewer.popup(param);
          };
        };
      });
    };
  };

  #resetIcons() {
    let hasSelected = false;
    let container = this.container;
    container.querySelectorAll('input[name=item]').forEach(el => {
      if (el.checked === true)
      {
        hasSelected = true;
      };
    });
    container.querySelector('icons.g1').classList.toggle('hide', hasSelected);
    container.querySelector('icons.g2').classList.toggle('hide', !hasSelected);
  };

  addUploadedItem(param, tail = null) {
    let container = this.container;
    container.querySelector('input[name=all]').disabled = false;
    if (tail != null)
    {
      param.fileurl = param.fileurl + (tail ?? '');
    };
    let tbody = container.querySelector('table.attachment').querySelector('tbody');
    let tr = document.createElement('tr');
    let td1 = document.createElement('td');
    let td2 = document.createElement('td');
    let td3 = document.createElement('td');
    let td4 = document.createElement('td');
    let td5 = document.createElement('td');
    let td1Input = document.createElement('input');
    td1Input.setAttribute('name', 'item');
    td1Input.setAttribute('type', 'checkbox');
    td1Input.value = '1';
    td1.classList.add('center');
    td1.append(td1Input);
    let td2Span = document.createElement('span');
    td2Span.classList.add('filegroup');
    td2Span.setAttribute('filegroup', param.filegroup);
    td2Span.innerText = param.filetype.toUpperCase();
    td2.classList.add('skinny');
    td2.setAttribute('width', '50');
    td2.setAttribute('role', 'draghandle');
    td2.append(td2Span);
    let td3Span = document.createElement('span');
    td3Span.classList.add('filename');
    td3Span.innerText = param.filename;
    td3.append(td3Span);
    let td4Span = document.createElement('span');
    td4Span.classList.add('filesize');
    td4Span.innerText = param.filesize_text;
    td4.append(td4Span);
    let td5Icons = document.createElement('icons');
    let iconInsert = document.createElement('jtbc-svg');
    iconInsert.setAttribute('name', 'power_cord');
    iconInsert.setAttribute('title', this.text.insert);
    iconInsert.classList.add('textInsert');
    td5Icons.append(iconInsert);
    let iconTrash = document.createElement('jtbc-svg');
    iconTrash.setAttribute('name', 'trash');
    iconTrash.setAttribute('title', this.text.remove);
    iconTrash.classList.add('textRemove');
    td5Icons.append(iconTrash);
    td5.append(td5Icons);
    tr.append(td1, td2, td3, td4, td5);
    tr.classList.add('param');
    tr.setAttribute('param', JSON.stringify(param));
    tbody.append(tr);
  };

  textReset() {
    let text = this.text;
    let container = this.container;
    if (this.inited == true)
    {
      if (text.hasOwnProperty('upload'))
      {
        container.querySelector('.textUpload').setAttribute('title', text.upload);
      };
      if (text.hasOwnProperty('insert'))
      {
        container.querySelectorAll('.textInsert').forEach(el => {
          el.setAttribute('title', text.insert);
        });
      };
      if (text.hasOwnProperty('remove'))
      {
        container.querySelectorAll('.textRemove').forEach(el => {
          el.setAttribute('title', text.remove);
        });
      };
      if (text.hasOwnProperty('selectFromDB'))
      {
        container.querySelector('.textSelectFromDB').setAttribute('title', text.selectFromDB);
      };
      if (text.hasOwnProperty('filesList'))
      {
        container.querySelector('.textFilesList').innerText = text.filesList;
      };
      if (text.hasOwnProperty('emptyTips'))
      {
        container.querySelector('.textEmptyTips').innerText = text.emptyTips;
      };
    };
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'text':
      {
        this.text = JSON.parse(newVal);
        this.textReset();
        break;
      };
      case 'partner':
      {
        this.currentPartner = newVal;
        this.container.setAttribute('partner', this.currentPartner);
        break;
      };
      case 'action':
      {
        this.action = this.#action = newVal;
        break;
      };
      case 'value':
      {
        this.value = this.#value = newVal;
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
      case 'width':
      {
        this.style.width = isFinite(newVal)? newVal + 'px': newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    this.ready = false;
    this.inited = false;
    this.currentPartner = null;
    this.text = {
      'upload': 'Upload',
      'insert': 'Insert',
      'remove': 'Remove',
      'selectFromDB': 'Select from media database',
      'filesList': 'Files list',
      'emptyTips': 'No files yet. if you want to upload, please click the upload button.',
    };
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"></div>
    `;
    let containerHTML = `
      <table is="jtbc-table" class="attachment">
        <thead>
          <tr>
            <th width="20" class="center"><input name="all" type="checkbox" value="1" disabled /></th>
            <th colspan="2" class="skinny"><span class="textFilesList">${this.text.filesList}</span></th>
            <th width="80"></th>
            <th width="60"><icons class="g1"><jtbc-svg name="db_fill" class="textSelectFromDB" title="${this.text.selectFromDB}"></jtbc-svg><jtbc-svg name="upload" class="textUpload" title="${this.text.upload}"></jtbc-svg><input type="file" class="file" multiple="multiple" /></icons><icons class="g2 hide"><jtbc-svg name="power_cord" class="textInsert" mode="batch" title="${this.text.insert}"></jtbc-svg><jtbc-svg name="trash" class="textRemove" mode="batch" title="${this.text.remove}"></jtbc-svg></icons></th>
          </tr>
        </thead>
        <tbody></tbody>
        <tfoot>
          <tr>
            <td colspan="5" class="textEmptyTips">${this.text.emptyTips}</td>
          </tr>
        </tfoot>
      </table>
      <jtbc-upload-progress class="progress"></jtbc-upload-progress>
      <div class="mask"></div>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.container = shadowRoot.querySelector('div.container');
    this.imagePreviewer = document.getElementById('imagePreviewer');
    this.materialExplorer = document.getElementById('materialExplorer');
    this.container.html(containerHTML).then(() => {
      this.inited = true;
      this.textReset();
      this.#initEvents();
      if (this.#value != null)
      {
        this.value = this.#value;
      };
      if (this.#action != null)
      {
        this.action = this.#action;
      };
      if (this.materialExplorer == null)
      {
        this.container.querySelector('.textSelectFromDB')?.remove();
      };
    });
  };
};