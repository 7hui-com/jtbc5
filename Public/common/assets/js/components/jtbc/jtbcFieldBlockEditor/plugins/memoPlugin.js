import htmlInspector from '../../../../library/html/htmlInspector.js';

export default class memoPlugin {
  static get toolbox() {
    return {
      title: 'Memo',
      icon: '<svg width="24" height="24" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M384 537.6A102.4 102.4 0 0 1 486.4 640v192A102.4 102.4 0 0 1 384 934.4H192A102.4 102.4 0 0 1 89.6 832v-192A102.4 102.4 0 0 1 192 537.6z m448 0a102.4 102.4 0 0 1 102.4 102.4v192a102.4 102.4 0 0 1-102.4 102.4h-192A102.4 102.4 0 0 1 537.6 832v-192A102.4 102.4 0 0 1 640 537.6zM384 614.4H192a25.6 25.6 0 0 0-25.6 25.6v192c0 14.08 11.52 25.6 25.6 25.6h192a25.6 25.6 0 0 0 25.6-25.6v-192a25.6 25.6 0 0 0-25.6-25.6z m448 0h-192a25.6 25.6 0 0 0-25.6 25.6v192c0 14.08 11.52 25.6 25.6 25.6h192a25.6 25.6 0 0 0 25.6-25.6v-192a25.6 25.6 0 0 0-25.6-25.6zM384 89.6A102.4 102.4 0 0 1 486.4 192v192A102.4 102.4 0 0 1 384 486.4H192A102.4 102.4 0 0 1 89.6 384V192A102.4 102.4 0 0 1 192 89.6z m448 0A102.4 102.4 0 0 1 934.4 192v192A102.4 102.4 0 0 1 832 486.4h-192A102.4 102.4 0 0 1 537.6 384V192A102.4 102.4 0 0 1 640 89.6zM384 166.4H192a25.6 25.6 0 0 0-25.6 25.6v192c0 14.08 11.52 25.6 25.6 25.6h192a25.6 25.6 0 0 0 25.6-25.6V192a25.6 25.6 0 0 0-25.6-25.6z m448 0h-192a25.6 25.6 0 0 0-25.6 25.6v192c0 14.08 11.52 25.6 25.6 25.6h192a25.6 25.6 0 0 0 25.6-25.6V192a25.6 25.6 0 0 0-25.6-25.6z"></path></svg>',
    };
  };

  #gap = 20;
  #innerGap = 20;
  #paddingTop = 0;
  #paddingBottom = 0;
  #borderRadius = 0;
  #justifyContent = 'left';
  #textAlign = 'left';
  #iconSize = 'm';
  #iconPosition = 'top';
  #itemSize = 'm';
  #colorable = false;
  #borderColor = null;
  #backgroundColor = null;
  #iconColor = null;
  #titleColor = null;
  #contentColor = null;
  #titleless = false;
  #items = [];

  #getIconSizeOptions() {
    let result = [];
    result.push({'text': this.api.i18n.t('S'), 'value': 's'});
    result.push({'text': this.api.i18n.t('M'), 'value': 'm'});
    result.push({'text': this.api.i18n.t('L'), 'value': 'l'});
    return result;
  };

  #getIconPositionOptions() {
    let result = [];
    result.push({'text': this.api.i18n.t('Icon on top'), 'value': 'top'});
    result.push({'text': this.api.i18n.t('Icon on left'), 'value': 'left'});
    result.push({'text': this.api.i18n.t('Don\'t show icons'), 'value': 'none'});
    return result;
  };

  #getItemSizeOptions() {
    let result = [];
    result.push({'text': this.api.i18n.t('S'), 'value': 's'});
    result.push({'text': this.api.i18n.t('M'), 'value': 'm'});
    result.push({'text': this.api.i18n.t('L'), 'value': 'l'});
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
      wrapper.style.setProperty('--item-gap', this.#gap + 'px');
      wrapper.style.setProperty('--inner-gap', this.#innerGap + 'px');
      wrapper.style.setProperty('--padding-top', this.#paddingTop + 'px');
      wrapper.style.setProperty('--padding-bottom', this.#paddingBottom + 'px');
      wrapper.style.setProperty('--border-radius', this.#borderRadius + 'px');
      wrapper.dataset.justifyContent = this.#justifyContent;
      wrapper.dataset.textAlign = this.#textAlign;
      wrapper.dataset.iconSize = this.#iconSize;
      wrapper.dataset.iconPosition = this.#iconPosition;
      wrapper.dataset.itemSize = this.#itemSize;
      if (this.#colorable === true)
      {
        if (this.#borderColor != null)
        {
          wrapper.style.setProperty('--border-color', this.#borderColor);
        };
        if (this.#backgroundColor != null)
        {
          wrapper.style.setProperty('--background-color', this.#backgroundColor);
        };
        if (this.#iconColor != null)
        {
          wrapper.style.setProperty('--icon-color', this.#iconColor);
        };
        if (this.#titleColor != null)
        {
          wrapper.style.setProperty('--title-color', this.#titleColor);
        };
        if (this.#contentColor != null)
        {
          wrapper.style.setProperty('--content-color', this.#contentColor);
        };
      }
      else
      {
        wrapper.style.removeProperty('--border-color');
        wrapper.style.removeProperty('--background-color');
        wrapper.style.removeProperty('--icon-color');
        wrapper.style.removeProperty('--title-color');
        wrapper.style.removeProperty('--content-color');
      };
      wrapper.dataset.titleless = this.#titleless == true? 1: 0;
      if (this.#items.length === 0)
      {
        this.addItem();
      }
      else
      {
        this.#items.forEach(item => this.addItem(item.title, item.content, item.icon));
      };
    };
  };

  #updateSettings(el) {
    let gapEl = el.querySelector('[name=gap]');
    let innerGapEl = el.querySelector('[name=innerGap]');
    let paddingTopEl = el.querySelector('[name=paddingTop]');
    let paddingBottomEl = el.querySelector('[name=paddingBottom]');
    let borderRadiusEl = el.querySelector('[name=borderRadius]');
    let justifyContentEl = el.querySelector('[name=justifyContent]');
    let textAlignEl = el.querySelector('[name=textAlign]');
    let iconSizeEl = el.querySelector('[name=iconSize]');
    let iconPositionEl = el.querySelector('[name=iconPosition]');
    let itemSizeEl = el.querySelector('[name=itemSize]');
    let colorableEl = el.querySelector('[name=colorable]');
    let borderColorEl = el.querySelector('[name=borderColor]');
    let backgroundColorEl = el.querySelector('[name=backgroundColor]');
    let iconColorEl = el.querySelector('[name=iconColor]');
    let titleColorEl = el.querySelector('[name=titleColor]');
    let contentColorEl = el.querySelector('[name=contentColor]');
    let titlelessEl = el.querySelector('[name=titleless]');
    if (gapEl != null)
    {
      this.#gap = Number.parseInt(gapEl.value);
    };
    if (innerGapEl != null)
    {
      this.#innerGap = Number.parseInt(innerGapEl.value);
    };
    if (paddingTopEl != null)
    {
      this.#paddingTop = Number.parseInt(paddingTopEl.value);
    };
    if (paddingBottomEl != null)
    {
      this.#paddingBottom = Number.parseInt(paddingBottomEl.value);
    };
    if (borderRadiusEl != null)
    {
      this.#borderRadius = Number.parseInt(borderRadiusEl.value);
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
    if (iconSizeEl != null)
    {
      this.#iconSize = iconSizeEl.value.length == 0? 'm': iconSizeEl.value;
    };
    if (iconPositionEl != null)
    {
      this.#iconPosition = iconPositionEl.value.length == 0? 'top': iconPositionEl.value;
    };
    if (itemSizeEl != null)
    {
      this.#itemSize = itemSizeEl.value.length == 0? 'm': itemSizeEl.value;
    };
    if (colorableEl != null)
    {
      this.#colorable = Number.parseInt(colorableEl.value) == 1? true: false;
      if (this.#colorable === true)
      {
        if (borderColorEl != null)
        {
          this.#borderColor = borderColorEl.value;
        };
        if (backgroundColorEl != null)
        {
          this.#backgroundColor = backgroundColorEl.value;
        };
        if (iconColorEl != null)
        {
          this.#iconColor = iconColorEl.value;
        };
        if (titleColorEl != null)
        {
          this.#titleColor = titleColorEl.value;
        };
        if (contentColorEl != null)
        {
          this.#contentColor = contentColorEl.value;
        };
      }
      else
      {
        this.#borderColor = null;
        this.#backgroundColor = null;
        this.#iconColor = null;
        this.#titleColor = null;
        this.#contentColor = null;
      };
    };
    if (titlelessEl != null)
    {
      this.#titleless = Number.parseInt(titlelessEl.value) == 1? true: false;
    };
    this.#setData();
  };

  #initData(data) {
    this.#gap = data.hasOwnProperty('gap')? data.gap: 20;
    this.#innerGap = data.hasOwnProperty('innerGap')? data.gap: 20;
    this.#paddingTop = data.hasOwnProperty('paddingTop')? data.paddingTop: 0;
    this.#paddingBottom = data.hasOwnProperty('paddingBottom')? data.paddingBottom: 0;
    this.#borderRadius = data.hasOwnProperty('borderRadius')? data.borderRadius: 0;
    this.#justifyContent = data.hasOwnProperty('justifyContent')? data.justifyContent: 'left';
    this.#textAlign = data.hasOwnProperty('textAlign')? data.textAlign: 'left';
    this.#iconSize = data.hasOwnProperty('iconSize')? data.iconSize: 'm';
    this.#iconPosition = data.hasOwnProperty('iconPosition')? data.iconPosition: 'top';
    this.#itemSize = data.hasOwnProperty('itemSize')? data.itemSize: 'm';
    this.#colorable = data.hasOwnProperty('colorable')? data.colorable: false;
    if (this.#colorable === true)
    {
      this.#borderColor = data.hasOwnProperty('borderColor')? data.borderColor: null;
      this.#backgroundColor = data.hasOwnProperty('backgroundColor')? data.backgroundColor: null;
      this.#iconColor = data.hasOwnProperty('iconColor')? data.iconColor: null;
      this.#titleColor = data.hasOwnProperty('titleColor')? data.titleColor: null;
      this.#contentColor = data.hasOwnProperty('contentColor')? data.contentColor: null;
    }
    else
    {
      this.#borderColor = null;
      this.#backgroundColor = null;
      this.#iconColor = null;
      this.#titleColor = null;
      this.#contentColor = null;
    };
    this.#titleless = data.hasOwnProperty('titleless')? data.titleless: false;
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
      that.showIconList(this, this.getAttribute('icon'));
    });
    wrapper.delegateEventListener('div.item div.buttons div.handler', 'click', function(){
      this.parentElement.classList.toggle('on');
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
        if (item.parentElement.querySelectorAll('div.item').length != 1)
        {
          item.remove();
        }
        else
        {
          that.api.blocks.delete(that.api.blocks.getCurrentBlockIndex());
        };
      };
    });
  };

  addItem(title, content, icon) {
    let item = document.createElement('div');
    item.classList.add('item');
    let image = document.createElement('div');
    let text = document.createElement('div');
    let textTitle = document.createElement('div');
    let textContent = document.createElement('div');
    let svg = document.createElement('jtbc-svg');
    const renderButtons = () => {
      let buttons = document.createElement('div');
      let handler = document.createElement('div');
      let titles = {
        'arrow_left': 'Move to the left',
        'arrow_right': 'Move to the right',
        'trash': 'Delete',
      };
      buttons.classList.add('buttons');
      handler.classList.add('handler');
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
      buttons.append(handler);
      return buttons;
    };
    image.classList.add('image');
    image.setAttribute('icon', icon ?? 'module');
    svg.setAttribute('name', icon ?? 'module');
    image.append(svg);
    text.classList.add('text');
    textTitle.classList.add('title');
    textTitle.setAttribute('contenteditable', 'true');
    textTitle.setAttribute('placeholder', this.api.i18n.t('Here is the title'));
    textContent.classList.add('content');
    textContent.setAttribute('contenteditable', 'true');
    textContent.setAttribute('placeholder', this.api.i18n.t('Here is the content'));
    if (typeof(title) == 'string')
    {
      let inspector = new htmlInspector(title, 'block-editor');
      textTitle.innerHTML = inspector.getFilteredHTML();
    };
    if (typeof(content) == 'string')
    {
      let inspector = new htmlInspector(content, 'block-editor');
      textContent.innerHTML = inspector.getFilteredHTML();
    };
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
    item.append(image, text, renderButtons());
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
      let item4 = document.createElement('div');
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
      item3H4.innerText = this.api.i18n.t('Outer gap(px)');
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
      item4.classList.add('item');
      item4.setAttribute('size', 's');
      let item4H4 = document.createElement('h4');
      let item4Field = document.createElement('div');
      let item4Input = document.createElement('jtbc-field-number');
      item4H4.innerText = this.api.i18n.t('Inner gap(px)');
      item4Field.classList.add('field');
      item4Input.classList.add('setting');
      item4Input.setAttributes({
        'name': 'innerGap',
        'step': '5',
        'min': '0',
        'max': '1000',
        'width': '100',
        'value': this.#innerGap,
      });
      item4Field.append(item4Input);
      item4.append(item4H4, item4Field);
      result.append(item1, item2, item3, item4);
      return result;
    };
    const renderContentRow2 = () => {
      let result = document.createElement('div');
      let item1 = document.createElement('div');
      let item2 = document.createElement('div');
      let item3 = document.createElement('div');
      let item4 = document.createElement('div');
      let item5 = document.createElement('div');
      result.classList.add('row');
      item1.classList.add('item');
      item1.setAttribute('size', 's');
      let item1H4 = document.createElement('h4');
      let item1Field = document.createElement('div');
      let item1Input = document.createElement('jtbc-field-selector');
      item1H4.innerText = this.api.i18n.t('Memo size');
      item1Field.classList.add('field');
      item1Input.setAttribute('name', 'itemSize');
      item1Input.setAttribute('width', '100');
      item1Input.setAttribute('placeholder', this.api.i18n.t('M'));
      item1Input.setAttribute('data', JSON.stringify(this.#getItemSizeOptions()));
      item1Input.setAttribute('value', this.#itemSize);
      item1Field.append(item1Input);
      item1.append(item1H4, item1Field);
      item2.classList.add('item');
      item2.setAttribute('size', 's');
      let item2H4 = document.createElement('h4');
      let item2Field = document.createElement('div');
      let item2Input = document.createElement('jtbc-field-selector');
      item2H4.innerText = this.api.i18n.t('Icon position');
      item2Field.classList.add('field');
      item2Input.setAttribute('name', 'iconPosition');
      item2Input.setAttribute('width', '140');
      item2Input.setAttribute('placeholder', this.api.i18n.t('Icon on top'));
      item2Input.setAttribute('data', JSON.stringify(this.#getIconPositionOptions()));
      item2Input.setAttribute('value', this.#iconPosition);
      item2Field.append(item2Input);
      item2.append(item2H4, item2Field);
      item3.classList.add('item');
      item3.classList.add('iconSize');
      item3.classList.toggle('hide', this.#iconPosition == 'none');
      item3.setAttribute('size', 's');
      let item3H4 = document.createElement('h4');
      let item3Field = document.createElement('div');
      let item3Input = document.createElement('jtbc-field-selector');
      item3H4.innerText = this.api.i18n.t('Icon size');
      item3Field.classList.add('field');
      item3Input.setAttribute('name', 'iconSize');
      item3Input.setAttribute('width', '100');
      item3Input.setAttribute('placeholder', this.api.i18n.t('M'));
      item3Input.setAttribute('data', JSON.stringify(this.#getIconSizeOptions()));
      item3Input.setAttribute('value', this.#iconSize);
      item3Field.append(item3Input);
      item3.append(item3H4, item3Field);
      item4.classList.add('item');
      item4.setAttribute('size', 's');
      let item4H4 = document.createElement('h4');
      let item4Field = document.createElement('div');
      let item4Input = document.createElement('jtbc-field-number');
      item4H4.innerText = this.api.i18n.t('Border radius(px)');
      item4Field.classList.add('field');
      item4Input.classList.add('setting');
      item4Input.setAttributes({
        'name': 'borderRadius',
        'step': '5',
        'min': '0',
        'max': '1000',
        'width': '100',
        'value': this.#borderRadius,
      });
      item4Field.append(item4Input);
      item4.append(item4H4, item4Field);
      item5.classList.add('item');
      item5.setAttribute('size', 's');
      let item5H4 = document.createElement('h4');
      let item5Field = document.createElement('div');
      let item5Input = document.createElement('jtbc-field-switch');
      item5H4.innerText = this.api.i18n.t('Don\'t show the title');
      item5Field.classList.add('field');
      item5Input.setAttribute('name', 'titleless');
      item5Input.setAttribute('value', this.#titleless === true? 1: 0);
      item5Field.append(item5Input);
      item5.append(item5H4, item5Field);
      result.append(item1, item2, item3, item4, item5);
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
      itemH4.innerText = this.api.i18n.t('Memo alignment');
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
    const renderContentRow5 = () => {
      let colorable = this.#colorable;
      let result = document.createElement('div');
      let item1 = document.createElement('div');
      let item2 = document.createElement('div');
      let item3 = document.createElement('div');
      let item4 = document.createElement('div');
      let item5 = document.createElement('div');
      let item6 = document.createElement('div');
      result.classList.add('row');
      item1.classList.add('item');
      item1.setAttribute('size', 's');
      let item1H4 = document.createElement('h4');
      let item1Field = document.createElement('div');
      let item1Input = document.createElement('jtbc-field-switch');
      item1H4.innerText = this.api.i18n.t('Custom colors');
      item1Field.classList.add('field');
      item1Input.setAttribute('name', 'colorable');
      item1Input.setAttribute('value', colorable === true? 1: 0);
      item1Field.append(item1Input);
      item1.append(item1H4, item1Field);
      item2.classList.add('item');
      item2.setAttribute('size', 's');
      item2.setAttribute('group', 'color');
      item2.classList.toggle('hide', colorable !== true);
      let item2H4 = document.createElement('h4');
      let item2Field = document.createElement('div');
      let item2Input = document.createElement('input');
      item2H4.innerText = this.api.i18n.t('Border color');
      item2Field.classList.add('field');
      item2Input.setAttribute('type', 'color');
      item2Input.setAttribute('name', 'borderColor');
      item2Input.setAttribute('value', this.#borderColor ?? '#d1d1d1');
      item2Field.append(item2Input);
      item2.append(item2H4, item2Field);
      item3.classList.add('item');
      item3.setAttribute('size', 's');
      item3.setAttribute('group', 'color');
      item3.classList.toggle('hide', colorable !== true);
      let item3H4 = document.createElement('h4');
      let item3Field = document.createElement('div');
      let item3Input = document.createElement('input');
      item3H4.innerText = this.api.i18n.t('Background color');
      item3Field.classList.add('field');
      item3Input.setAttribute('type', 'color');
      item3Input.setAttribute('name', 'backgroundColor');
      item3Input.setAttribute('value', this.#backgroundColor ?? '#ffffff');
      item3Field.append(item3Input);
      item3.append(item3H4, item3Field);
      item4.classList.add('item');
      item4.setAttribute('size', 's');
      item4.setAttribute('group', 'color');
      item4.classList.toggle('hide', colorable !== true);
      let item4H4 = document.createElement('h4');
      let item4Field = document.createElement('div');
      let item4Input = document.createElement('input');
      item4H4.innerText = this.api.i18n.t('Icon color');
      item4Field.classList.add('field');
      item4Input.setAttribute('type', 'color');
      item4Input.setAttribute('name', 'iconColor');
      item4Input.setAttribute('value', this.#iconColor ?? '#333333');
      item4Field.append(item4Input);
      item4.append(item4H4, item4Field);
      item5.classList.add('item');
      item5.setAttribute('size', 's');
      item5.setAttribute('group', 'color');
      item5.classList.toggle('hide', colorable !== true);
      let item5H4 = document.createElement('h4');
      let item5Field = document.createElement('div');
      let item5Input = document.createElement('input');
      item5H4.innerText = this.api.i18n.t('Title color');
      item5Field.classList.add('field');
      item5Input.setAttribute('type', 'color');
      item5Input.setAttribute('name', 'titleColor');
      item5Input.setAttribute('value', this.#titleColor ?? '#000000');
      item5Field.append(item5Input);
      item5.append(item5H4, item5Field);
      item6.classList.add('item');
      item6.setAttribute('size', 's');
      item6.setAttribute('group', 'color');
      item6.classList.toggle('hide', colorable !== true);
      let item6H4 = document.createElement('h4');
      let item6Field = document.createElement('div');
      let item6Input = document.createElement('input');
      item6H4.innerText = this.api.i18n.t('Content color');
      item6Field.classList.add('field');
      item6Input.setAttribute('type', 'color');
      item6Input.setAttribute('name', 'contentColor');
      item6Input.setAttribute('value', this.#contentColor ?? '#666666');
      item6Field.append(item6Input);
      item6.append(item6H4, item6Field);
      result.append(item1, item2, item3, item4, item5, item6);
      return result;
    };
    let settings = document.createElement('div');
    settings.classList.add('settings');
    let h3 = document.createElement('h3');
    let close = document.createElement('div');
    let content = document.createElement('div');
    let footer = document.createElement('div');
    h3.innerText = this.api.i18n.t('Memo settings');
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
        settings.delegateEventListener('[name=iconPosition]', 'selected', e => {
          settings.querySelector('div.item.iconSize')?.classList.toggle('hide', e.target.value == 'none');
        });
        settings.delegateEventListener('[name=colorable]', 'changed', e => {
          settings.querySelectorAll('[group=color]').forEach(item => item.classList.toggle('hide', Number.parseInt(e.target.value) != 1));
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

  showIconList(target, icon) {
    let settings = document.createElement('div');
    settings.classList.add('settings');
    let h3 = document.createElement('h3');
    let close = document.createElement('div');
    let content = document.createElement('div');
    let footer = document.createElement('div');
    h3.innerText = this.api.i18n.t('Icon list');
    close.classList.add('close');
    let closeSvg = document.createElement('jtbc-svg');
    closeSvg.setAttribute('name', 'close');
    close.append(closeSvg);
    content.classList.add('content');
    let icons = document.createElement('div');
    let iconSelector = document.createElement('jtbc-field-icon-selector');
    icons.classList.add('icons');
    iconSelector.setAttribute('width', '100%');
    iconSelector.setAttribute('value', icon);
    icons.append(iconSelector);
    content.append(icons);
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
          let iconSelector = settings.querySelector('jtbc-field-icon-selector');
          if (iconSelector != null)
          {
            let svg = document.createElement('jtbc-svg');
            svg.setAttribute('name', iconSelector.value);
            target.setAttribute('icon', iconSelector.value);
            target.empty().append(svg);
          };
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
    wrapper.classList.add('block_memo');
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
        let content = item.querySelector('div.content');
        this.#items.push({
          'icon': image.getAttribute('icon'),
          'title': title.innerHTML,
          'content': content.innerHTML,
        });
      });
    };
    return {
      'gap': this.#gap,
      'innerGap': this.#innerGap,
      'paddingTop': this.#paddingTop,
      'paddingBottom': this.#paddingBottom,
      'borderRadius': this.#borderRadius,
      'justifyContent': this.#justifyContent,
      'textAlign': this.#textAlign,
      'iconSize': this.#iconSize,
      'iconPosition': this.#iconPosition,
      'itemSize': this.#itemSize,
      'colorable': this.#colorable,
      'borderColor': this.#borderColor,
      'backgroundColor': this.#backgroundColor,
      'iconColor': this.#iconColor,
      'titleColor': this.#titleColor,
      'contentColor': this.#contentColor,
      'titleless': this.#titleless,
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