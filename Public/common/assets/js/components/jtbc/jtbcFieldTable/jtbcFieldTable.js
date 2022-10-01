export default class jtbcFieldTable extends HTMLElement {
  static get observedAttributes() {
    return ['text', 'columns', 'value', 'disabled', 'width'];
  };

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = '';
    if (this.inited == false)
    {
      if (this.currentValue != null)
      {
        result = this.currentValue;
      };
    }
    else
    {
      let value = [];
      let table = this.container.querySelector('table.table');
      let tbody = table.querySelector('tbody');
      tbody.querySelectorAll('tr').forEach(el => {
        let item = {};
        el.querySelectorAll('[role=field]').forEach(f => {
          if (!(f.name == 'id' && f.value.length == 0))
          {
            item[f.name] = f.value;
          };
        });
        value.push(item);
      });
      if (value.length != 0)
      {
        result = JSON.stringify(value);
      };
    };
    return result;
  };

  get dblmode() {
    let result = false;
    if (this.hasAttribute('dblmode'))
    {
      result = true;
    }
    else if (this.dialog != null)
    {
      if (this.dialog.shadowRoot.contains(this))
      {
        result = true;
      };
    };
    return result;
  };

  get disabled() {
    return this.currentDisabled;
  };

  set value(value) {
    if (value != null)
    {
      let items = value? JSON.parse(value): [];
      if (this.inited == false)
      {
        this.currentValue = value;
      }
      else if (this.inited == true && Array.isArray(items))
      {
        let table = this.container.querySelector('table.table');
        let tbody = table.querySelector('tbody');
        tbody.querySelectorAll('tr').forEach(el => { el.remove(); });
        items.forEach(item => {
          let newTr = this.tbodyTrElement.cloneNode(true);
          Object.keys(item).forEach(key => {
            let field = newTr.querySelector("[name='" + key + "']");
            if (field != null) field.value = item[key];
          });
          tbody.append(newTr);
        });
      };
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

  getTempId() {
    this.currentTempId -= 1;
    return this.currentTempId;
  };

  createBodyTrElement(columns) {
    this.tbodyTrElement = document.createElement('tr');
    let tbodyTdFirst = document.createElement('td');
    tbodyTdFirst.classList.add('dragable');
    tbodyTdFirst.setAttribute('role', 'draghandle');
    tbodyTdFirst.innerHTML = '<jtbc-svg name="dragable"><input type="hidden" name="id" role="field" /></jtbc-svg>';
    this.tbodyTrElement.append(tbodyTdFirst);
    columns.forEach(item => {
      let tbodyTd = document.createElement('td');
      let field = null;
      switch(item.type)
      {
        case 'color': {
          field = this.renderColor(item);
          break;
        };
        case 'checkbox': {
          field = this.renderCheckbox(item);
          break;
        };
        case 'radio': {
          field = this.renderRadio(item);
          break;
        };
        case 'range': {
          field = this.renderRange(item);
          break;
        };
        case 'select': {
          field = this.renderSelect(item);
          break;
        };
        case 'text': {
          field = this.renderText(item);
          break;
        };
        default: {
          field = ['date', 'datetime', 'switch', 'currency-input', 'star', 'select2', 'upload', 'number', 'multi-select', 'cn-city-picker2'].includes(item.type)? this.renderOthers(item): null;
          break;
        };
      };
      if (field != null)
      {
        field.setAttribute('role', 'field');
        field.setAttribute('name', item.name);
        if (item.hasOwnProperty('value'))
        {
          field.setAttribute('value', item.value);
        };
        if (item.hasOwnProperty('extra'))
        {
          Object.keys(item.extra).forEach(key => {
            field.setAttribute(key, item.extra[key]);
          });
        };
        tbodyTd.append(field);
      };
      this.tbodyTrElement.append(tbodyTd);
    });
    let tbodyTdLast = document.createElement('td');
    tbodyTdLast.classList.add('center');
    tbodyTdLast.innerHTML = '<icons><jtbc-svg name="close" class="textRemove"></jtbc-svg></icons>';
    tbodyTdLast.querySelector('.textRemove').setAttribute('title', this.text.remove);
    this.tbodyTrElement.append(tbodyTdLast);
  };

  renderColor(item) {
    let result = document.createElement('input', {is: 'jtbc-input'});
    result.setAttribute('is', 'jtbc-input');
    result.setAttribute('type', 'color');
    return result;
  };

  renderCheckbox(item) {
    let result = null;
    if (Array.isArray(item.data))
    {
      result = document.createElement('jtbc-choice-selector');
      result.setAttribute('type', 'checkbox');
      item.data.forEach(option => {
        let label = document.createElement('label');
        let input = document.createElement('input');
        let span = document.createElement('span');
        label.className = 'checkbox';
        input.setAttribute('type', 'checkbox');
        input.setAttribute('value', option.value);
        input.setAttribute('name', item.name + '_option');
        span.innerText = option.text;
        label.append(input, span);
        result.append(label);
      });
    };
    return result;
  };

  renderRadio(item) {
    let result = null;
    if (Array.isArray(item.data))
    {
      result = document.createElement('jtbc-choice-selector');
      result.setAttribute('type', 'radio');
      item.data.forEach(option => {
        let label = document.createElement('label');
        let input = document.createElement('input');
        let span = document.createElement('span');
        label.className = 'radio';
        input.setAttribute('type', 'radio');
        input.setAttribute('value', option.value);
        input.setAttribute('name', item.name + '_option');
        span.innerText = option.text;
        label.append(input, span);
        result.append(label);
      });
    };
    return result;
  };

  renderRange(item) {
    let result = document.createElement('input', {is: 'jtbc-input'});
    result.setAttribute('is', 'jtbc-input');
    result.setAttribute('type', 'range');
    return result;
  };

  renderSelect(item) {
    let result = document.createElement('select', {is: 'jtbc-select'});
    result.setAttribute('is', 'jtbc-select');
    if (Array.isArray(item.data))
    {
      item.data.forEach(option => {
        let optionEl = document.createElement('option');
        optionEl.setAttribute('value', option.value);
        if (option.disabled === true)
        {
          optionEl.setAttribute('disabled', true);
        };
        optionEl.innerText = option.text;
        result.append(optionEl);
      });
    };
    return result;
  };

  renderText(item) {
    let result = document.createElement('input', {is: 'jtbc-input'});
    result.setAttribute('is', 'jtbc-input');
    result.setAttribute('type', 'text');
    return result;
  };

  renderOthers(item) {
    let result = document.createElement('jtbc-field-' + item.type);
    if (Array.isArray(item.data))
    {
      result.setAttribute('data', JSON.stringify(item.data));
    }
    return result;
  };

  textReset() {
    let text = this.text;
    let container = this.container;
    if (this.inited == true)
    {
      container.querySelectorAll('.textAdd').forEach(el => { el.setAttribute('title', text.add); });
      container.querySelectorAll('.textRemove').forEach(el => { el.setAttribute('title', text.remove); });
      container.querySelectorAll('.textEmptyTips').forEach(el => { el.innerText = text.emptyTips });
    };
  };

  init() {
    if (this.inited == false)
    {
      let currentColumns = this.currentColumns;
      if (currentColumns != null)
      {
        let table = this.container.querySelector('table.table');
        let thead = table.querySelector('thead');
        let tfoot = table.querySelector('tfoot');
        let textEmptyTips = tfoot.querySelector('.textEmptyTips');
        let theadTr = document.createElement('tr');
        let theadThFirst = document.createElement('th');
        theadThFirst.classList.add('dragable');
        theadTr.append(theadThFirst);
        let columns = JSON.parse(currentColumns);
        columns.forEach(column => {
          let theadWidth = null;
          let theadTh = document.createElement('th');
          if (Number.isInteger(column?.extra?.width))
          {
            theadWidth = column.extra.width;
          };
          if (theadWidth != null)
          {
            theadTh.setAttribute('width', theadWidth);
          };
          theadTh.innerText = column.text;
          theadTr.append(theadTh);
        });
        let theadThLast = document.createElement('th');
        theadThLast.setAttribute('width', 28);
        theadThLast.classList.add('center');
        theadThLast.innerHTML = '<icons><jtbc-svg name="add" class="textAdd"></jtbc-svg></icons>';
        theadThLast.querySelector('.textAdd').setAttribute('title', this.text.add);
        theadTr.append(theadThLast);
        thead.append(theadTr);
        this.createBodyTrElement(columns);
        textEmptyTips.innerText = this.text.emptyTips;
        textEmptyTips.setAttribute('colspan', theadTr.childElementCount);
        this.tbodyTrElement.loadComponents().then(() => {
          this.inited = true;
          this.value = this.currentValue;
        });
      };
      this.container.classList.add('on');
    };
  };

  initEvents() {
    let that = this;
    let container = this.container;
    let table = container.querySelector('table.table');
    let tbody = table.querySelector('tbody');
    container.delegateEventListener('.textAdd', 'click', () => {
      if (this.inited === true)
      {
        let newTr = this.tbodyTrElement.cloneNode(true);
        newTr.querySelector('input[name=id]').value = this.getTempId();
        tbody.append(newTr);
        that.dispatchEvent(new CustomEvent('tradded', {bubbles: true, detail: {'tr': newTr}}));
      };
    });
    container.delegateEventListener('.textRemove', 'dblclick', function(){
      if (that.dblmode == true)
      {
        this.removeAttribute('prepared');
        this.dispatchEvent(new CustomEvent('remove', {bubbles: true}));
      };
    });
    container.delegateEventListener('.textRemove', 'click', function(){
      if (that.dblmode == true)
      {
        let hasRemoved = false;
        if (this.hasAttribute('dbltips') && this.hasAttribute('timestamp'))
        {
          this.removeAttribute('dbltips');
          let timeGap = (new Date()).getTime() - Number(this.getAttribute('timestamp'));
          if (timeGap <= 5000)
          {
            hasRemoved = true;
            this.dispatchEvent(new CustomEvent('remove', {bubbles: true}));
          };
        };
        if (hasRemoved != true)
        {
          this.setAttribute('prepared', 'true');
          setTimeout(() => {
            if (this.hasAttribute('prepared'))
            {
              if (!this.hasAttribute('dbltips'))
              {
                this.setAttribute('dbltips', 'true');
                this.setAttribute('timestamp', (new Date()).getTime());
                that.miniMessage?.push(that.text.dblClickRemoveTips);
              };
            };
          }, 200);
        };
      }
      else if (that.dialog != null)
      {
        that.dialog.confirm(that.text.removeTips, () => {
          this.dispatchEvent(new CustomEvent('remove', {bubbles: true}));
        });
      }
      else
      {
        if (window.confirm(that.text.removeTips))
        {
          this.dispatchEvent(new CustomEvent('remove', {bubbles: true}));
        };
      };
    });
    container.delegateEventListener('.textRemove', 'remove', function(){
      tbody.querySelectorAll('tr').forEach(el => {
        if (el.contains(this))
        {
          el.remove();
          that.dispatchEvent(new CustomEvent('trremoved', {bubbles: true, detail: {'tr': el}}));
        };
      });
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'text':
      {
        this.text = JSON.parse(newVal);
        this.textReset();
        break;
      };
      case 'columns':
      {
        this.currentColumns = newVal;
        this.init();
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
    this.dispatchEvent(new CustomEvent('connected', {bubbles: true}));
  };

  constructor() {
    super();
    this.text = {
      'add': 'Add',
      'remove': 'Remove',
      'removeTips': 'Are you sure to remove?',
      'emptyTips': 'There is no content yet, please click the plus button to add.',
      'dblClickRemoveTips': 'Click again to remove',
    };
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `
      <style>@import url('${importCssUrl}');</style>
      <container style="display:none">
        <table class="table" is="jtbc-table">
          <thead></thead>
          <tbody></tbody>
          <tfoot>
            <tr>
              <td class="textEmptyTips"></td>
            </tr>
          </tfoot>
        </table>
        <div class="mask"></div>
      </container>
    `;
    shadowRoot.innerHTML = shadowRootHTML;
    this.ready = false;
    this.inited = false;
    this.currentColumns = null;
    this.currentDisabled = false;
    this.currentTempId = 0;
    this.currentValue = null;
    this.tbodyTrElement = null;
    this.container = shadowRoot.querySelector('container');
    this.dialog = document.getElementById('dialog');
    this.miniMessage = document.getElementById('miniMessage');
    this.container.loadComponents().then(() => { this.initEvents(); });
  };
};