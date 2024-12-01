import htmlInspector from '../../../../library/html/htmlInspector.js';

export default class quotePlugin {
  static get toolbox() {
    return {
      title: 'Quote',
      icon: '<svg width="24" height="24" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M880 112c17.7 0 32 14.3 32 32v736c0 17.7-14.3 32-32 32H144c-17.7 0-32-14.3-32-32V144c0-17.7 14.3-32 32-32h736z m-40 728V184H184v656h656zM458.2 347v56c-3 0.2-5.4 0.4-7.2 0.7-47.4 6.7-83.1 47.4-83.1 95.7V531h62.4c15.4 0 28 12.5 28 27.9v90.2c0 15.4-12.5 27.9-28 27.9H340c-15.4 0-28-12.5-28-27.9V499.3c0-79.7 61.5-145.8 140.6-152 1.4-0.1 3.3-0.2 5.6-0.3z m253.8 0v56c-3 0.2-5.4 0.4-7.2 0.7-47.4 6.7-83.1 47.4-83.1 95.7V531H684c15.4 0 28 12.5 28 27.9v90.2c0 15.4-12.5 27.9-28 27.9h-90.3c-15.4 0-28-12.5-28-27.9V499.3c0-79.7 61.5-145.8 140.6-152 1.5-0.1 3.4-0.2 5.7-0.3z"></path></svg>',
    };
  };

  static get sanitize() {
    return {
      'text': {
        'br': true,
      },
    };
  };

  #paddingTop = 0;
  #paddingBottom = 0;
  #text = '';

  #setData() {
    let wrapper = this.wrapper;
    if (wrapper != null)
    {
      wrapper.style.setProperty('--padding-top', this.#paddingTop + 'px');
      wrapper.style.setProperty('--padding-bottom', this.#paddingBottom + 'px');
      let textInspector = new htmlInspector(this.#text, 'block-editor');
      wrapper.querySelector('div.text').innerHTML = textInspector.getFilteredHTML();
    };
  };

  #updateSettings(el) {
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
    this.#setData();
  };

  #initData(data) {
    this.#paddingTop = data.hasOwnProperty('paddingTop')? data.paddingTop: 0;
    this.#paddingBottom = data.hasOwnProperty('paddingBottom')? data.paddingBottom: 0;
    this.#text = data.hasOwnProperty('text')? data.text: '';
  };

  #initEvents() {
    let wrapper = this.wrapper;
    wrapper.delegateEventListener('div.icon[icon=setting]', 'click', e => this.showSettings());
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
    let settings = document.createElement('div');
    settings.classList.add('settings');
    let h3 = document.createElement('h3');
    let close = document.createElement('div');
    let content = document.createElement('div');
    let footer = document.createElement('div');
    h3.innerText = this.api.i18n.t('Quote settings');
    close.classList.add('close');
    let closeSvg = document.createElement('jtbc-svg');
    closeSvg.setAttribute('name', 'close');
    close.append(closeSvg);
    content.classList.add('content');
    content.append(renderContentRow1());
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
    let text = document.createElement('div');
    let icons = document.createElement('div');
    wrapper.classList.add('block_quote');
    text.classList.add('text');
    text.setAttribute('contenteditable', 'true');
    text.setAttribute('placeholder', this.api.i18n.t('Here is the content'));
    text.addEventListener('keydown', e => {
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
    icons.classList.add('icons');
    let icon = document.createElement('div');
    let svg = document.createElement('jtbc-svg');
    svg.setAttribute('name', 'setting');
    icon.classList.add('icon');
    icon.setAttribute('icon', 'setting');
    icon.append(svg);
    icon.setAttribute('title', this.api.i18n.t('Setting'));
    icons.append(icon);
    wrapper.append(text, icons);
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
    let wrapper = this.wrapper;
    let text = wrapper.querySelector('div.text');
    this.#text = text.dataset.empty == 'true'? '': text.innerHTML;
    return {
      'paddingTop': this.#paddingTop,
      'paddingBottom': this.#paddingBottom,
      'text': this.#text,
    };
  };

  constructor({data, api, config}) {
    this.data = data;
    this.api = api;
    this.config = config || {};
    this.#initData(this.data);
  };
};