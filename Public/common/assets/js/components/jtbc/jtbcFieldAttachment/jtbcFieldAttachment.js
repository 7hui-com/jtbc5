export default class jtbcFieldAttachment extends HTMLElement {
  static get observedAttributes() {
    return ['text', 'partner', 'action', 'value', 'disabled', 'width'];
  };

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = '';
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
    return this.currentDisabled;
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
    if (disabled == true)
    {
      this.container.classList.add('disabled');
    }
    else
    {
      this.container.classList.remove('disabled');
    };
    this.currentDisabled = disabled;
  };

  addUploadedItem(param) {
    let container = this.container;
    let tbody = container.querySelector('table.attachment').querySelector('tbody');
    let tr = document.createElement('tr');
    let td1 = document.createElement('td');
    let td2 = document.createElement('td');
    let td3 = document.createElement('td');
    let td4 = document.createElement('td');
    let td1Span = document.createElement('span');
    td1Span.classList.add('filegroup');
    td1Span.setAttribute('filegroup', param.filegroup);
    td1Span.innerText = param.filetype.toUpperCase();
    td1.setAttribute('width', '50');
    td1.setAttribute('role', 'draghandle');
    td1.append(td1Span);
    let td2Span = document.createElement('span');
    td2Span.classList.add('filename');
    td2Span.innerText = param.filename;
    td2.append(td2Span);
    let td3Span = document.createElement('span');
    td3Span.classList.add('filesize');
    td3Span.innerText = param.filesize_text;
    td3.append(td3Span);
    let td4Icons = document.createElement('icons');
    let iconInsert = document.createElement('jtbc-svg');
    iconInsert.setAttribute('name', 'power_cord');
    iconInsert.setAttribute('title', this.text.insert);
    iconInsert.classList.add('textInsert');
    td4Icons.append(iconInsert);
    let iconTrash = document.createElement('jtbc-svg');
    iconTrash.setAttribute('name', 'trash');
    iconTrash.setAttribute('title', this.text.remove);
    iconTrash.classList.add('textRemove');
    td4Icons.append(iconTrash);
    td4.append(td4Icons);
    tr.append(td1, td2, td3, td4);
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

  initEvents() {
    let that = this;
    let container = this.container;
    let progress = container.querySelector('.progress');
    container.querySelector('.textUpload').addEventListener('click', function(){
      this.parentNode.querySelector('input.file').click();
    });
    container.querySelector('input.file').addEventListener('change', function(){
      if (that.currentUploading != true)
      {
        that.currentUploading = true;
        progress.startUpload(this, (index, data) => {
          if (data.code == 1) that.addUploadedItem(data.param);
        }, () => { that.currentUploading = false; });
      };
    });
    container.delegateEventListener('.textInsert', 'click', function(){
      let partner = that.partner;
      let tr = this.parentNode.parentNode.parentNode;
      if (tr.tagName == 'TR' && partner != null)
      {
        let content = document.createElement('a');
        let currentParam = JSON.parse(tr.getAttribute('param'));
        content.innerText = currentParam.filename;
        content.setAttribute('href', currentParam.fileurl);
        if (currentParam.filegroup == 1)
        {
          content = document.createElement('img');
          content.setAttribute('src', currentParam.fileurl);
        }
        else if (currentParam.filegroup == 2)
        {
          content = document.createElement('video');
          content.setAttribute('width', 480);
          content.setAttribute('width', 270);
          content.setAttribute('controls', 'controls');
          content.setAttribute('src', currentParam.fileurl);
        };
        partner.forEach(el => { el.insertContent(content.outerHTML); });
      };
    });
    container.delegateEventListener('.textRemove', 'click', function(){
      let tr = this.parentNode.parentNode.parentNode;
      if (tr.tagName == 'TR') tr.classList.toggle('remove');
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
        this.action = this.currentAction = newVal;
        break;
      };
      case 'value':
      {
        this.value = this.currentValue = newVal;
        break;
      };
      case 'disabled':
      {
        this.disabled = this.hasAttribute('disabled')? true: false;
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
  };

  constructor() {
    super();
    this.ready = false;
    this.inited = false;
    this.currentValue = null;
    this.currentAction = null;
    this.currentPartner = null;
    this.currentDisabled = false;
    this.currentUploading = false;
    this.text = {
      'upload': 'Upload',
      'insert': 'Insert',
      'remove': 'Remove',
      'selectFromDB': 'Select from media database',
      'filesList': 'Files list',
      'emptyTips': 'No files yet. if you want to upload, please click the upload button.',
    };
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.substring(0, import.meta.url.lastIndexOf('.')) + '.css';
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <div class="container" style="display:none"></div>
    `;
    let containerHTML = `
      <table is="jtbc-table" class="attachment">
        <thead>
          <tr>
            <th colspan="2"><span class="textFilesList">${this.text.filesList}</span></th>
            <th width="80"></th>
            <th width="60"><icons><jtbc-svg name="db_fill" class="textSelectFromDB" title="${this.text.selectFromDB}"></jtbc-svg><jtbc-svg name="upload" class="textUpload" title="${this.text.upload}"></jtbc-svg><input type="file" class="file" multiple="multiple" /></icons></th>
          </tr>
        </thead>
        <tbody></tbody>
        <tfoot>
          <tr>
            <td colspan="4" class="textEmptyTips">${this.text.emptyTips}</td>
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
      this.initEvents();
      if (this.currentValue != null)
      {
        this.value = this.currentValue;
      };
      if (this.currentAction != null)
      {
        this.action = this.currentAction;
      };
      if (this.materialExplorer == null)
      {
        this.container.querySelector('.textSelectFromDB')?.remove();
      };
    });
  };
};