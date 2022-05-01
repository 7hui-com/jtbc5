export default class jtbcSchemaForm extends HTMLDivElement {
  static get observedAttributes() {
    return ['data'];
  };

  build() {
    if (this.currentData != null)
    {
      let schema = JSON.parse(this.currentData);
      if (Array.isArray(schema))
      {
        let fragment = document.createDocumentFragment();
        schema.forEach(item => {
          let itemEl = document.createElement('item');
          let itemLabel = document.createElement('label');
          itemLabel.className = 'name';
          if (item.required == true)
          {
            itemLabel.append(document.createElement('r'));
          };
          let itemLabelSpan = document.createElement('span');
          itemLabelSpan.innerText = item.text;
          itemLabel.append(itemLabelSpan);
          let itemContent = document.createElement('div');
          itemContent.className = 'content';
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
            case 'editor': {
              field = this.renderEditor(item);
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
            case 'tips': {
              field = this.renderTips(item);
              break;
            };
            default: {
              field = this.renderOthers(item);
              break;
            };
          };
          if (field != null)
          {
            if (item.hasOwnProperty('id')) field.id = item.id;
            if (!field.hasAttribute('iamnotafield'))
            {
              field.setAttribute('role', 'field');
              field.setAttribute('name', item.name);
              if (item.hasOwnProperty('value'))
              {
                if (item.value != null)
                {
                  field.setAttribute('value', item.value);
                };
              };
            };
            if (item.hasOwnProperty('extra'))
            {
              Object.keys(item.extra).forEach(key => {
                field.setAttribute(key, item.extra[key]);
              });
            };
            itemContent.append(field);
          };
          itemEl.append(itemLabel, itemContent);
          itemEl.setAttribute('field', item.name);
          if (item.hasOwnProperty('class'))
          {
            itemEl.setAttribute('class', item.class);
          };
          fragment.append(itemEl);
        });
        this.appendFragment(fragment).then(() => {
          this.parentNode.querySelector('.formSubmit')?.classList.remove('hide');
        });
      };
    };
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
      result.setAttribute('name', item.name);
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

  renderEditor(item) {
    let result = document.createElement('textarea', {is: 'jtbc-editor'});
    result.classList.add('editor');
    result.setAttribute('is', 'jtbc-editor');
    return result;
  };

  renderRadio(item) {
    let result = null;
    if (Array.isArray(item.data))
    {
      result = document.createElement('jtbc-choice-selector');
      result.setAttribute('type', 'radio');
      result.setAttribute('name', item.name);
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

  renderTips(item) {
    let result = document.createElement('span');
    result.setAttribute('iamnotafield', 'true');
    result.classList.add('tips');
    result.innerText = item.tips;
    return result;
  };

  renderOthers(item) {
    let result = document.createElement('jtbc-field-' + item.type);
    if (item.hasOwnProperty('data'))
    {
      if (Array.isArray(item.data))
      {
        result.setAttribute('data', JSON.stringify(item.data));
      };
    };
    return result;
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'data':
      {
        this.currentData = newVal;
        this.build();
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
    this.currentData = null;
  };
};