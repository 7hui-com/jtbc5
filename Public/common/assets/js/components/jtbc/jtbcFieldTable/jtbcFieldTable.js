export default class jtbcFieldTable extends HTMLElement {
  static get observedAttributes() {
    return ['text', 'columns', 'value', 'min-items', 'max-items', 'disabled', 'width', 'with-global-headers'];
  };

  #columns = null;
  #disabled = false;
  #value = null;
  #minItems = 0;
  #maxItems = 10000;
  #withGlobalHeaders = null;

  get name() {
    return this.getAttribute('name');
  };

  get value() {
    let result = '';
    if (this.inited == false)
    {
      if (this.#value != null)
      {
        result = this.#value;
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

  get minItems() {
    return this.#minItems;
  };

  get maxItems() {
    return this.#maxItems;
  };

  get columns() {
    return this.#columns;
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
    return this.#disabled;
  };

  get withGlobalHeaders() {
    return this.#withGlobalHeaders;
  };

  set columns(columns) {
    this.#columns = columns;
    if (this.ready == true)
    {
      if (this.inited === false)
      {
        this.#init();
      };
    };
  };

  set value(value) {
    if (value != null)
    {
      let items = value? JSON.parse(value): [];
      if (this.inited == false)
      {
        this.#value = value;
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
            if (field != null)
            {
              field.setAttribute('value', item[key]);
            };
          });
          tbody.append(newTr);
        });
        this.itemsReset();
      };
    };
  };

  set minItems(minItems) {
    let min = 0;
    if (isFinite(minItems))
    {
      min = Math.max(0, Number.parseInt(minItems));
    };
    this.#minItems = min;
    this.itemsReset();
  };

  set maxItems(maxItems) {
    let max = 0;
    if (isFinite(maxItems))
    {
      max = Math.min(1000000, Number.parseInt(maxItems));
    };
    this.#maxItems = max;
    this.itemsReset();
  };

  set disabled(disabled) {
    this.#disabled = disabled;
    this.container.classList.toggle('disabled', disabled);
  };

  set withGlobalHeaders(withGlobalHeaders) {
    this.#withGlobalHeaders = withGlobalHeaders;
  };

  #init() {
    if (this.inited == false)
    {
      if (this.columns != null)
      {
        let table = this.container.querySelector('table.table');
        let thead = table.querySelector('thead');
        let tfoot = table.querySelector('tfoot');
        let textEmptyTips = tfoot.querySelector('.textEmptyTips');
        let theadTr = document.createElement('tr');
        let theadThFirst = document.createElement('th');
        theadThFirst.classList.add('dragable');
        theadTr.append(theadThFirst);
        let columns = JSON.parse(this.columns);
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
          this.value = this.#value;
        });
      };
      this.container.classList.add('on');
    };
  };

  #initEvents() {
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
        that.itemsReset();
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
          that.itemsReset();
          that.dispatchEvent(new CustomEvent('trremoved', {bubbles: true, detail: {'tr': el}}));
        };
      });
    });
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
          field = ['date', 'datetime', 'switch', 'currency-input', 'ipv4', 'icon-picker', 'star', 'select2', 'selector', 'upload', 'number', 'multi-select', 'linkage-selector'].includes(item.type)? this.renderOthers(item): null;
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
    if (item.type == 'upload' && this.withGlobalHeaders != null)
    {
      result.setAttribute('with-global-headers', this.withGlobalHeaders);
    };
    if (Array.isArray(item.data))
    {
      result.setAttribute('data', JSON.stringify(item.data));
    };
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

  itemsReset() {
    let container = this.container;
    if (this.inited == true)
    {
      let itemCount = container.querySelectorAll('table.table tbody tr').length;
      container.querySelectorAll('.textAdd').forEach(el => el.classList.toggle('disabled', itemCount >= this.maxItems));
      container.querySelectorAll('.textRemove').forEach(el => el.classList.toggle('disabled', itemCount <= this.minItems));
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
      case 'columns':
      {
        this.columns = newVal;
        break;
      };
      case 'value':
      {
        this.value = this.#value = newVal;
        break;
      };
      case 'min-items':
      {
        this.minItems = newVal;
        break;
      };
      case 'max-items':
      {
        this.maxItems = newVal;
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
      case 'with-global-headers':
      {
        this.withGlobalHeaders = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.#init();
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
    this.currentTempId = 0;
    this.tbodyTrElement = null;
    this.container = shadowRoot.querySelector('container');
    this.dialog = document.getElementById('dialog');
    this.miniMessage = document.getElementById('miniMessage');
    this.container.loadComponents().then(() => { this.#initEvents(); });
  };
};