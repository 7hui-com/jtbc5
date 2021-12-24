export default class mixedFieldCreator {
  allow(type) {
    let result = false;
    if (!this.allowType.includes(type))
    {
      result = true;
      this.allowType.push(type);
    };
    return result;
  };

  disallow(type) {
    let result = false;
    if (this.allowType.includes(type))
    {
      result = true;
      this.allowType.splice(this.allowType.indexOf(type), 1);
    };
    return result;
  };

  getFragment() {
    let result = null;
    if (Array.isArray(this.columns))
    {
      result = document.createDocumentFragment();
      this.columns.forEach(item => {
        let field = null;
        let extraMode = item?.extra?.mode ?? 'auto';
        let itemEl = document.createElement('div');
        let fieldEl = document.createElement('span');
        itemEl.classList.add('item');
        fieldEl.classList.add('field');
        if (this.allowType.includes(item.type))
        {
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
            case 'textarea': {
              field = this.renderTextarea(item);
              break;
            };
            default: {
              field = this.renderOthers(item);
              break;
            };
          };
          if (extraMode == 'auto')
          {
            extraMode = ['text', 'textarea', 'upload'].includes(item.type)? 'placeholder': 'label';
          };
          if (extraMode == 'label')
          {
            let label = document.createElement('label');
            label.classList.add('name');
            label.innerText = item.text;
            itemEl.append(label);
          }
          else if (extraMode == 'placeholder')
          {
            field.setAttribute('placeholder', item.text);
          };
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
          fieldEl.append(field);
          itemEl.append(fieldEl);
          result.append(itemEl);
        }
        else
        {
          throw new Error('Unallowed Type Error.');
        };
      });
    };
    return result;
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
      let form = document.createElement('form');
      form.style.display = 'inline-block';
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
        form.append(label);
      });
      result.append(form);
    };
    return result;
  };

  renderRadio(item) {
    let result = null;
    if (Array.isArray(item.data))
    {
      result = document.createElement('jtbc-choice-selector');
      result.setAttribute('type', 'radio');
      let form = document.createElement('form');
      form.style.display = 'inline-block';
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
        form.append(label);
      });
      result.append(form);
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

  renderTextarea(item) {
    let result = document.createElement('textarea', {is: 'jtbc-textarea'});
    result.setAttribute('is', 'jtbc-textarea');
    return result;
  };

  renderOthers(item) {
    return document.createElement('jtbc-field-' + item.type);
  };

  constructor(columns) {
    this.columns = columns;
    this.allowType = ['color', 'checkbox', 'radio', 'range', 'select', 'text', 'textarea', 'number', 'date', 'datetime', 'switch', 'star', 'upload', 'avatar', 'gallery', '24color-picker', 'code-editor', 'flat-selector', 'cn-city-picker2', 'table', 'mix', 'multi', 'multi-group'];
  };
};