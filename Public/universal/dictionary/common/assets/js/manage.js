export default class manage {
  bindTableEvents() {
    let scarf = this.self.parentNode.querySelector('.scarf');
    scarf.delegateEventListener('jtbc-field-table[name=content]', 'tradded', e => {
      let tr = e.detail.tr;
      let mode = Number.parseInt(scarf.querySelector('input[name=mode]').value);
      if (mode == 1)
      {
        let maxValue = 0;
        let keyFieldQuery = 'jtbc-field-number[name=key]';
        tr.parentNode.querySelectorAll(keyFieldQuery).forEach(el => {
          let currentValue = Number.parseInt(el.value);
          if (currentValue > maxValue) maxValue = currentValue;
        });
        tr.querySelector(keyFieldQuery).value = maxValue + 1;
      };
    });
  };

  initAdd() {
    if (this.inited != true)
    {
      this.inited = true;
      this.bindTableEvents();
    };
  };

  initEdit() {
    if (this.inited != true)
    {
      this.inited = true;
      this.bindTableEvents();
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