export default class codePlugin {
  static get toolbox() {
    return {
      title: 'Code',
      icon: '<svg width="24" height="24" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M848.08 112c34.949 0 63.347 28.049 63.911 62.863l0.009 1.057v672.16c0 34.949-28.049 63.347-62.863 63.911l-1.057 0.009H175.92c-34.949 0-63.347-28.049-63.911-62.863L112 848.08V175.92c0-34.949 28.049-63.347 62.863-63.911l1.057-0.009h672.16z m0 278.652H175.92V848.08h672.16V390.652zM353.62 457.136c23.02 20.131 25.567 54.963 5.885 78.219l-0.604 0.701-68.928 78.815 68.928 78.816c20.132 23.019 18.016 57.88-4.59 78.305l-0.69 0.615-119.549-136.696c-10.536-12.048-10.536-30.032 0-42.08l119.548-136.695z m315.982 0l119.548 136.696c10.43 11.927 10.535 29.672 0.313 41.716l-0.313 0.363-119.548 136.696c-23.019-20.132-25.567-54.964-5.884-78.22l0.603-0.7 68.929-78.816-68.929-78.815c-20.132-23.02-18.015-57.88 4.59-78.306l0.691-0.614z m-88.262 19.204l0.888 0.258-71.802 239.068c-8.797 29.288-39.45 46.027-68.767 37.737l-0.888-0.259 71.802-239.068c8.709-28.995 38.839-45.69 67.887-37.978l0.88 0.242zM848.08 175.92H175.92v158.802h672.16V175.92z"></path></svg>',
    };
  };

  #paddingTop = 0;
  #paddingBottom = 0;
  #language = 'markup';
  #languages = {
    'markup': 'Markup',
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'css': 'CSS',
    'php': 'PHP',
    'python': 'Python',
    'java': 'Java',
    'c': 'C',
    'cpp': 'C++',
    'csharp': 'C#',
    'go': 'Go',
    'rust': 'Rust',
  };
  #code = '';

  #getLanguageOptions() {
    let result = [];
    Object.keys(this.#languages).forEach(language => {
      result.push({'text': this.api.i18n.t(this.#languages[language]), 'value': language});
    });
    return result;
  };

  #setData() {
    let wrapper = this.wrapper;
    if (wrapper != null)
    {
      let highlighter = wrapper.querySelector('.highlighter');
      wrapper.style.setProperty('--padding-top', this.#paddingTop + 'px');
      wrapper.style.setProperty('--padding-bottom', this.#paddingBottom + 'px');
      highlighter.setAttribute('language', this.#language);
      highlighter.setAttribute('value', this.#code);
    };
  };

  #updateSettings(el) {
    let paddingTopEl = el.querySelector('[name=paddingTop]');
    let paddingBottomEl = el.querySelector('[name=paddingBottom]');
    let languageEl = el.querySelector('[name=language]');
    let codeEl = el.querySelector('[name=code]');
    if (paddingTopEl != null)
    {
      this.#paddingTop = Number.parseInt(paddingTopEl.value);
    };
    if (paddingBottomEl != null)
    {
      this.#paddingBottom = Number.parseInt(paddingBottomEl.value);
    };
    if (languageEl != null)
    {
      this.#language = languageEl.value;
      if (this.#language.length == 0)
      {
        this.#language = 'markup';
      };
    };
    if (codeEl != null)
    {
      this.#code = codeEl.value;
    };
    this.#setData();
  };

  #initData(data) {
    this.#paddingTop = data.hasOwnProperty('paddingTop')? data.paddingTop: 0;
    this.#paddingBottom = data.hasOwnProperty('paddingBottom')? data.paddingBottom: 0;
    this.#language = data.hasOwnProperty('language')? data.language: 'markup';
    this.#code = data.hasOwnProperty('code')? data.code: '<b>Hello, world!</b>';
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
    const renderContentRow2 = () => {
      let result = document.createElement('div');
      let item = document.createElement('div');
      result.classList.add('row');
      item.classList.add('item');
      let itemH4 = document.createElement('h4');
      let itemField = document.createElement('div');
      let itemInput = document.createElement('jtbc-field-selector');
      itemH4.innerText = this.api.i18n.t('Language');
      itemField.classList.add('field');
      itemInput.setAttribute('name', 'language');
      itemInput.setAttribute('width', '100%');
      itemInput.setAttribute('placeholder', this.api.i18n.t('Markup'));
      itemInput.setAttribute('data', JSON.stringify(this.#getLanguageOptions()));
      itemInput.setAttribute('value', this.#language);
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
      let itemInput = document.createElement('textarea');
      itemH4.innerText = this.api.i18n.t('Code');
      itemField.classList.add('field');
      itemInput.classList.add('textarea');
      itemInput.setAttribute('name', 'code');
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
    h3.innerText = this.api.i18n.t('Code settings');
    close.classList.add('close');
    let closeSvg = document.createElement('jtbc-svg');
    closeSvg.setAttribute('name', 'close');
    close.append(closeSvg);
    content.classList.add('content');
    content.append(renderContentRow1(), renderContentRow2(), renderContentRow3());
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
        settings.querySelector('textarea[name=code]').value = this.#code;
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
    let code = document.createElement('div');
    let syntaxHighlighter = document.createElement('jtbc-syntax-highlighter');
    let icons = document.createElement('div');
    let emptyInput = document.createElement('input');
    wrapper.classList.add('block_code');
    code.classList.add('code');
    syntaxHighlighter.classList.add('highlighter');
    syntaxHighlighter.setAttribute('language', this.#language);
    syntaxHighlighter.setAttribute('value', this.#code);
    code.append(syntaxHighlighter);
    icons.classList.add('icons');
    let icon = document.createElement('div');
    let svg = document.createElement('jtbc-svg');
    svg.setAttribute('name', 'setting');
    icon.classList.add('icon');
    icon.setAttribute('icon', 'setting');
    icon.append(svg);
    icon.setAttribute('title', this.api.i18n.t('Setting'));
    icons.append(icon);
    emptyInput.setAttribute('type', 'hidden');
    wrapper.append(code, icons, emptyInput);
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
      'language': this.#language,
      'code': this.#code,
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