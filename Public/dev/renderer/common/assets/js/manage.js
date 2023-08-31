export default class manage {
  #currentGenre;
  #currentTableName;

  #bindFormEvents() {
    let scarf = this.self.parentNode.querySelector('.scarf');
    const changeTable = data => {
      this.#currentGenre = data.genre;
      this.#currentTableName = data.tableName;
      let tableEl = scarf.querySelector('jtbc-field-select2[name=table]');
      let whereEl = scarf.querySelector('jtbc-field-table[name=where]');
      let orderbyEl = scarf.querySelector('jtbc-field-table[name=orderby]');
      let templateFileEl = scarf.querySelector('jtbc-field-select2[name=template_file]');
      let fieldsEl = scarf.querySelector('jtbc-field-flat-selector[name=fields]');
      scarf.querySelector('div[name=div-table]').classList.remove('hide');
      scarf.querySelector('div[name=div-table-empty]').classList.add('hide');
      tableEl.setAttribute('data', data.tables);
      tableEl.setAttribute('value', data.tableName);
      scarf.querySelector('div[name=div-where]').classList.remove('hide');
      scarf.querySelector('div[name=div-where-empty]').classList.add('hide');
      if (!whereEl.hasAttribute('columns'))
      {
        whereEl.setAttribute('columns', data.whereColumns);
      }
      else
      {
        let newWhereEl = document.createElement(whereEl.tagName);
        whereEl.getAttributeNames().forEach(name => {
          newWhereEl.setAttribute(name, name == 'columns'? data.whereColumns: whereEl.getAttribute(name));
        });
        whereEl.replaceWith(newWhereEl);
      };
      scarf.querySelector('div[name=div-orderby]').classList.remove('hide');
      scarf.querySelector('div[name=div-orderby-empty]').classList.add('hide');
      if (!orderbyEl.hasAttribute('columns'))
      {
        orderbyEl.setAttribute('columns', data.orderbyColumns);
      }
      else
      {
        let newOrderbyEl = document.createElement(orderbyEl.tagName);
        orderbyEl.getAttributeNames().forEach(name => {
          newOrderbyEl.setAttribute(name, name == 'columns'? data.orderbyColumns: orderbyEl.getAttribute(name));
        });
        orderbyEl.replaceWith(newOrderbyEl);
      };
      if (fieldsEl != null)
      {
        fieldsEl.setAttribute('data', data.fieldsOptions);
        fieldsEl.setAttribute('value', data.fieldsSelected);
        scarf.querySelector('div[name=div-fields]').classList.remove('hide');
        scarf.querySelector('div[name=div-fields-empty]').classList.add('hide');
      };
      if (templateFileEl != null)
      {
        templateFileEl.setAttribute('data', data.template_files);
        templateFileEl.setAttribute('value', data.default_template_file);
        templateFileEl.dispatchEvent(new CustomEvent('selected', {bubbles: true}));
      };
    };
    scarf.delegateEventListener('jtbc-field-select2[name=genre]', 'selected', e => {
      let self = e.target;
      self.setAttribute('disabled', true);
      let apiURL = scarf.getAttribute('apiurl');
      fetch(apiURL + '&genre=' + encodeURIComponent(self.value)).then(res => res.ok? res.json(): {}).then(data => {
        if (data.code == 1)
        {
          changeTable(data.data);
        }
        else
        {
          this.miniMessage.push(self.getAttribute('error'));
        };
        self.removeAttribute('disabled');
      });
    });
    scarf.delegateEventListener('jtbc-field-select2[name=table]', 'selected', e => {
      let self = e.target;
      let apiURL = scarf.getAttribute('apiurl');
      if (this.#currentTableName != self.value)
      {
        self.setAttribute('disabled', true);
        fetch(apiURL + '&genre=' + encodeURIComponent(this.#currentGenre) + '&tableName=' + encodeURIComponent(self.value)).then(res => res.ok? res.json(): {}).then(data => {
          if (data.code == 1)
          {
            changeTable(data.data);
          }
          else
          {
            this.miniMessage.push(self.getAttribute('error'));
          };
          self.removeAttribute('disabled');
        });
      };
    });
    scarf.delegateEventListener('input[name=orderby_mode]', 'change', e => {
      let self = e.target;
      let orderbyEl = scarf.querySelector('tbody[name=orderby]');
      if (self.value != '3')
      {
        orderbyEl.classList.add('hide');
      }
      else
      {
        orderbyEl.classList.remove('hide');
      };
    });
  };

  initBackend() {
    if (this.inited != true)
    {
      this.inited = true;
      let that = this;
      this.#bindFormEvents();
      let scarf = this.self.parentNode.querySelector('.scarf');
      scarf.delegateEventListener('jtbc-field-select2[name=template_file]', 'selected', e => {
        let self = e.target;
        self.setAttribute('disabled', true);
        let apiURL = self.getAttribute('apiurl');
        let templateNodeEl = scarf.querySelector('jtbc-field-select2[name=template_node]');
        fetch(apiURL + '&templateFile=' + encodeURIComponent(self.value)).then(res => res.ok? res.json(): {}).then(data => {
          if (data.code == 1)
          {
            templateNodeEl.value = '';
            templateNodeEl.setAttribute('data', data.data.template_nodes);
          };
          self.removeAttribute('disabled');
        });
      });
      scarf.delegateEventListener('form.form', 'submitend', e => {
        let self = e.target;
        let parentEl = self.parentElement;
        let res = e.detail.res;
        res.json().then(data => {
          if (data.code == 1)
          {
            let resultData = data.data;
            parentEl.querySelector('div.source').classList.remove('hide');
            parentEl.querySelector('div.result').classList.remove('hide');
            parentEl.querySelector('jtbc-syntax-highlighter[name=source]').setAttribute('value', resultData.source_code);
            if (resultData.render_code == 1)
            {
              parentEl.querySelector('div.result div.box').classList.remove('hide');
              parentEl.querySelector('div.result div.message').classList.add('hide');
              parentEl.querySelector('jtbc-syntax-highlighter[name=result]').setAttribute('value', resultData.render_result);
            }
            else
            {
              parentEl.querySelector('div.result div.box').classList.add('hide');
              parentEl.querySelector('div.result div.message').classList.remove('hide');
              parentEl.querySelector('div.result div.message span[name=message]').innerText = resultData.render_message;
            };
          }
          else
          {
            this.miniMessage.push(data.message);
            parentEl.querySelector('div.source').classList.add('hide');
            parentEl.querySelector('div.result').classList.add('hide');
          };
        });
      });
      scarf.delegateEventListener('div.source div.copy', 'click', function(){
        let self = this;
        let parentEl = this.parentElement;
        if (navigator.clipboard == undefined)
        {
          that.miniMessage.push(self.getAttribute('message-failed'));
        }
        else
        {
          navigator.clipboard.writeText(parentEl.querySelector('jtbc-syntax-highlighter[name=source]').value).then(function(){
            that.miniMessage.push(self.getAttribute('message-succeed'));
          }, function(){
            that.miniMessage.push(self.getAttribute('message-failed'));
          });
        };
      });
    };
  };

  initFrontend() {
    if (this.inited != true)
    {
      this.inited = true;
      let that = this;
      this.#bindFormEvents();
      let scarf = this.self.parentNode.querySelector('.scarf');
      scarf.delegateEventListener('form.form', 'submitend', e => {
        let self = e.target;
        let parentEl = self.parentElement;
        let res = e.detail.res;
        res.json().then(data => {
          if (data.code == 1)
          {
            let resultData = data.data;
            let sourceEl = parentEl.querySelector('div.source');
            if (sourceEl.classList.contains('hide'))
            {
              sourceEl.classList.remove('hide');
              let fragment = document.createDocumentFragment();
              let codeEditor = document.createElement('jtbc-field-code-editor');
              codeEditor.setAttribute('name', 'source');
              codeEditor.setAttribute('theme', 'monokai');
              codeEditor.setAttribute('mode', 'htmlmixed');
              codeEditor.setAttribute('value', resultData.source_code);
              fragment.appendChild(codeEditor);
              sourceEl.querySelector('div.code-editor').empty().appendFragment(fragment);
            }
            else
            {
              sourceEl.querySelectorAll('jtbc-field-code-editor').forEach(el => {
                el.setAttribute('value', resultData.source_code);
              });
            };
          }
          else
          {
            this.miniMessage.push(data.message);
            parentEl.querySelector('div.source').classList.add('hide');
          };
        });
      });
    };
  };

  readiedCallback() {
    let init = this.self.getAttribute('init');
    if (Reflect.has(this, init)) Reflect.get(this, init).call(this);
  };

  constructor(self) {
    this.self = self;
    this.inited = false;
    this.root = document.getElementById('root');
    this.main = document.getElementById('main');
    this.master = document.getElementById('master');
    this.dialog = document.getElementById('dialog');
    this.miniMessage = document.getElementById('miniMessage');
  };
};