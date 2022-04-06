export default class manageSetting {
  bindFieldGuideEvents() {
    let popup = this.self.parentNode.querySelector('.dialogPopup');
    let ppSettingEl = popup.querySelector('div.ppSetting');
    let additionalEl = ppSettingEl.querySelector('div.additional');
    let fieldTextEl = popup.querySelector('li[name=li-field-text]');
    popup.delegateEventListener('input[name=field_text_auto]', 'change', function(){
      if (this.checked == true)
      {
        fieldTextEl.classList.add('hide');
      }
      else
      {
        fieldTextEl.classList.remove('hide');
      };
    });
    popup.delegateEventListener('select[name=comment_sourceType]', 'change', function(){
      let parentElement = this.parentNode.parentNode;
      let selectedOption = parentElement.querySelector('.li-option-' + this.value);
      if (selectedOption != null)
      {
        parentElement.querySelectorAll('.li-option').forEach(el => { el.classList.add('hidden'); });
        selectedOption.classList.remove('hidden');
      };
    });
    popup.querySelector('select[name=comment_type]').addEventListener('change', function(){
      this.disabled = true;
      let currentType = this.value;
      let currentText = this.options[this.selectedIndex].text;
      let nodeMap = {
        'attachment': 7,
        'checkbox': 4,
        'code-editor': 5,
        'date': 10,
        'datetime': 10,
        'flat-selector': 4,
        'location-picker': 9,
        'mix': 2,
        'multi': 2,
        'multi-group': 3,
        'number': 1,
        'radio': 4,
        'range': 1,
        'sea-explorer': 8,
        'select': 4,
        'star': 6,
        'table': 2,
        'tag': 8,
        'transfer': 4,
      };
      if (!Object.keys(nodeMap).includes(currentType))
      {
        additionalEl.html('').then(() => {
          this.disabled = false;
        });
      }
      else
      {
        let currentGenre = popup.querySelector('input[name=genre]')?.value ?? '';
        let apiURL = this.getAttribute('api') + '.' + encodeURIComponent('fieldset' + nodeMap[currentType]) + '&genre=' + encodeURIComponent(currentGenre);
        fetch(apiURL).then(res => res.ok? res.json(): {}).then(data => {
          if (data.code == 1)
          {
            additionalEl.html(data.fragment).then(() => {
              additionalEl.querySelector('legend').innerText = currentText.substring(0, currentText.indexOf('('));
              this.disabled = false;
            });
          };
        });
      };
    });
  };

  initAddField() {
    if (this.inited != true)
    {
      this.inited = true;
      this.bindFieldGuideEvents();
    };
  };

  initEditField() {
    if (this.inited != true)
    {
      this.inited = true;
      let popup = this.self.parentNode.querySelector('.dialogPopup');
      popup.delegateEventListener('form', 'renderend', () => {
        this.bindFieldGuideEvents();
      });
      popup.delegateEventListener('.tabMode', 'tabchange', (e) => {
        popup.querySelector('input[name=tab_mode]').value = e.detail.value;
      });
    };
  };

  initConfig() {
    if (this.inited != true)
    {
      this.inited = true;
      let popup = this.self.parentNode.querySelector('.dialogPopup');
      popup.delegateEventListener('form', 'submitend', e => {
        let res = e.detail.res;
        res.json().then(data => {
          if (data.code == 1)
          {
            this.leftmenu?.fetch();
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
    this.leftmenu = document.getElementById('leftmenu');
  };
};