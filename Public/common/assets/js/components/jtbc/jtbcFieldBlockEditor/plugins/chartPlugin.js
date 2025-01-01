export default class chartPlugin {
  static get toolbox() {
    return {
      title: 'Chart',
      icon: '<svg width="24" height="24" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M278.755 777.557h89.543c22.642 0 40.96-18.318 40.96-40.96v-407.211c0-22.642-18.318-40.96-40.96-40.96h-89.543c-22.642 0-40.96 18.318-40.96 40.96v407.211c0 22.528 18.432 40.96 40.96 40.96zM292.409 343.040h62.237v379.904h-62.237v-379.904zM501.191 777.557h89.543c22.642 0 40.96-18.318 40.96-40.96v-521.102c0-22.642-18.318-40.96-40.96-40.96h-89.543c-22.642 0-40.96 18.318-40.96 40.96v521.102c0 22.528 18.432 40.96 40.96 40.96zM514.845 229.149h62.237v493.795h-62.237v-493.795zM723.627 777.557h89.543c22.642 0 40.96-18.318 40.96-40.96v-257.479c0-22.642-18.318-40.96-40.96-40.96h-89.543c-22.642 0-40.96 18.318-40.96 40.96v257.479c0 22.528 18.432 40.96 40.96 40.96zM737.28 492.771h62.237v230.173h-62.237v-230.173z"></path><path d="M863.687 816.242h-676.181v-633.173c0-15.133-12.174-27.307-27.307-27.307s-27.307 12.174-27.307 27.307v659.911c0 6.258 2.048 11.947 5.575 16.498 5.006 6.827 13.085 11.378 22.187 11.378h703.147c15.133 0 27.307-12.174 27.307-27.307-0.114-15.019-12.288-27.307-27.421-27.307z"></path></svg>',
    };
  };

  #paddingTop = 0;
  #paddingBottom = 0;
  #width = 'auto';
  #align = 'left';
  #type = 'pie';
  #types = {
    'bar': 'Bar chart',
    'line': 'Line chart',
    'pie': 'Pie chart',
  };
  #data = [{'name': 'Hello', 'value': 100}, {'name': 'World', 'value': 50}];

  #getItemsFromData(mode) {
    let result = this.#data;
    if (mode == 'name')
    {
      result = [];
      this.#data.forEach(item => {
        result.push(item['name']);
      });
    }
    else if (mode == 'value')
    {
      result = [];
      this.#data.forEach(item => {
        result.push(item['value']);
      });
    };
    return result;
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

  #getTypeOptions() {
    let result = [];
    Object.keys(this.#types).forEach(type => {
      result.push({'text': this.api.i18n.t(this.#types[type]), 'value': type});
    });
    return result;
  };

  #setData() {
    let wrapper = this.wrapper;
    if (wrapper != null)
    {
      let type = this.#type;
      wrapper.style.setProperty('--padding-top', this.#paddingTop + 'px');
      wrapper.style.setProperty('--padding-bottom', this.#paddingBottom + 'px');
      wrapper.dataset.align = this.#align;
      wrapper.dataset.width = this.#width;
      let chart = document.createElement('jtbc-charts');
      if (type == 'bar')
      {
        chart.setAttribute('option', JSON.stringify({
          'xAxis': {
            'type': 'category',
            'data': this.#getItemsFromData('name'),
          },
          'yAxis': {
            'type': 'value',
          },
          'series': [
            {
              'data': this.#getItemsFromData('value'),
              'type': 'bar',
            },
          ],
        }));
      }
      else if (type == 'line')
      {
        chart.setAttribute('option', JSON.stringify({
          'xAxis': {
            'type': 'category',
            'data': this.#getItemsFromData('name'),
          },
          'yAxis': {
            'type': 'value',
          },
          'series': [
            {
              'data': this.#getItemsFromData('value'),
              'type': 'line',
            },
          ],
        }));
      }
      else if (type == 'pie')
      {
        chart.setAttribute('option', JSON.stringify({
          'tooltip': {
            'trigger': 'item',
          },
          'legend': {
            'top': '5%',
            'left': 'center',
          },
          'series': [
            {
              'type': 'pie',
              'radius': ['40%', '70%'],
              'avoidLabelOverlap': false,
              'label': {
                'show': false,
                'position': 'center',
              },
              'emphasis': {
                'label': {
                  'show': true,
                  'fontSize': 40,
                  'fontWeight': 'bold',
                },
              },
              'labelLine': {
                'show': false,
              },
              'data': this.#getItemsFromData(),
            },
          ],
        }));
      };
      wrapper.querySelector('div.chart').empty().append(chart);
    };
  };

  #updateTable(el) {
    let data = [];
    el.querySelectorAll('table.table tbody tr').forEach(tr => {
      data.push({'name': tr.querySelector('[name=name]').value, 'value': tr.querySelector('[name=value]').value});
    });
    this.#data = data;
    this.#setData();
  };

  #updateSettings(el) {
    let paddingTopEl = el.querySelector('[name=paddingTop]');
    let paddingBottomEl = el.querySelector('[name=paddingBottom]');
    let widthEl = el.querySelector('[name=width]');
    let alignEl = el.querySelector('[name=align]');
    let typeEl = el.querySelector('[name=type]');
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
    if (typeEl != null)
    {
      try
      {
        let tempArr = JSON.parse(typeEl.value);
        if (Array.isArray(tempArr) && tempArr.length === 1)
        {
          this.#type = tempArr.pop();
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
    this.#type = data.hasOwnProperty('type')? data.type: 'pie';
    this.#data = data.hasOwnProperty('data')? data.data: [{'name': 'Hello', 'value': 100}, {'name': 'World', 'value': 50}];
  };

  #initEvents() {
    let wrapper = this.wrapper;
    wrapper.delegateEventListener('div.icon[icon=table]', 'click', e => this.showTable());
    wrapper.delegateEventListener('div.icon[icon=setting]', 'click', e => this.showSettings());
  };

  showTable() {
    const createRow = (name, value) => {
      let tr = document.createElement('tr');
      let td1 = document.createElement('td');
      let td2 = document.createElement('td');
      let td3 = document.createElement('td');
      let input1 = document.createElement('input');
      let input2 = document.createElement('jtbc-field-number');
      let icons = document.createElement('div');
      input1.style.width = '100%';
      input1.setAttribute('type', 'text');
      input1.setAttribute('name', 'name');
      input1.setAttribute('value', name);
      td1.append(input1);
      input2.setAttribute('width', '100%');
      input2.setAttribute('name', 'value');
      input2.setAttribute('min', '0');
      input2.setAttribute('value', value);
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
      tr.append(td1, td2, td3);
      return tr;
    };
    const renderBodyContent = tbody => {
      this.#data.forEach(item => {
        tbody.append(createRow(item.name, item.value));
      });
    };
    const renderFootContent = tfoot => {
      let tr = document.createElement('tr');
      let td = document.createElement('td');
      td.setAttribute('colspan', '3');
      td.innerText = this.api.i18n.t('No data');
      tr.append(td);
      tfoot.append(tr);
    };
    let settings = document.createElement('div');
    settings.classList.add('settings');
    let h3 = document.createElement('h3');
    let close = document.createElement('div');
    let box = document.createElement('div');
    let content = document.createElement('div');
    let footer = document.createElement('div');
    h3.innerText = this.api.i18n.t('Data table');
    close.classList.add('close');
    let closeSvg = document.createElement('jtbc-svg');
    closeSvg.setAttribute('name', 'close');
    close.append(closeSvg);
    box.classList.add('box');
    content.classList.add('content');
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
    theadTh1.innerText = this.api.i18n.t('Name');
    theadTh2.setAttribute('width', '150');
    theadTh2.innerText = this.api.i18n.t('Value');
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
    content.append(table);
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
          e.currentTarget.querySelector('tbody.tbody').append(createRow('', 0));
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
        settings.delegateEventListener('button.ok', 'click', e => {
          this.#updateTable(e.currentTarget);
          e.currentTarget.dispatchEvent(new CustomEvent('close'));
        });
        settings.delegateEventListener('div.close', 'click', e => e.currentTarget.dispatchEvent(new CustomEvent('close')));
        settings.delegateEventListener('button.cancel', 'click', e => e.currentTarget.dispatchEvent(new CustomEvent('close')));
      });
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
      let itemInput = document.createElement('jtbc-field-flat-selector');
      itemH4.innerText = this.api.i18n.t('Chart width');
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
    const renderContentRow3 = () => {
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
    const renderContentRow4 = () => {
      let result = document.createElement('div');
      let item = document.createElement('div');
      result.classList.add('row');
      item.classList.add('item');
      let itemH4 = document.createElement('h4');
      let itemField = document.createElement('div');
      let itemInput = document.createElement('jtbc-field-flat-selector');
      itemH4.innerText = this.api.i18n.t('Chart type');
      itemField.classList.add('field');
      itemInput.setAttribute('name', 'type');
      itemInput.setAttribute('type', 'radio');
      itemInput.setAttribute('columns', '5');
      itemInput.setAttribute('data', JSON.stringify(this.#getTypeOptions()));
      itemInput.setAttribute('value', JSON.stringify([this.#type]));
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
    h3.innerText = this.api.i18n.t('Chart settings');
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
    let chart = document.createElement('div');
    let icons = document.createElement('div');
    let emptyInput = document.createElement('input');
    wrapper.classList.add('block_chart');
    chart.classList.add('chart');
    icons.classList.add('icons');
    ['table', 'setting'].forEach(item => {
      let icon = document.createElement('div');
      let svg = document.createElement('jtbc-svg');
      svg.setAttribute('name', item);
      icon.classList.add('icon');
      icon.setAttribute('icon', item);
      icon.append(svg);
      icon.setAttribute('title', this.api.i18n.t(item.charAt(0).toUpperCase() + item.slice(1)));
      icons.append(icon);
    });
    emptyInput.setAttribute('type', 'hidden');
    wrapper.append(chart, icons, emptyInput);
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
      'width': this.#width,
      'align': this.#align,
      'type': this.#type,
      'data': this.#data,
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